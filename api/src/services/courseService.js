import {
  createCourse as createCourseRow,
  findById,
  findBySlug,
  listByTeacher,
  listCourses as listCourseRows,
  updateCourseZoom,
  updateStatus,
} from "../models/courseModel.js";
import {
  isUserEnrolled,
  listEnrollmentsForCourse,
} from "../models/enrollmentModel.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { createZoomMeeting, deleteZoomMeeting } from "./zoomApiService.js";
import { query } from "../config/db.js";

const sendEmail = async (to, subject, message) => {
  console.log(`📧 Email envoyé à ${to}`);
  console.log(`   Sujet: ${subject}`);
  console.log(`   Message: ${message}`);
};

const mapCourse = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  discipline: row.discipline,
  level: row.level,
  format: row.format,
  description: row.description,
  price_cents: row.price_cents,
  course_date: row.course_date,
  status: row.status,
  min_students: row.min_students,
  max_students: row.max_students,
  enrolled_count: Number(row.enrolled_count || 0),
  rating_avg: row.rating_avg === null || row.rating_avg === undefined ? null : Number(row.rating_avg),
  reviews_count: Number(row.reviews_count || 0),
  teacher_id: row.teacher_id,
  teacher: {
    id: row.teacher_id,
    email: row.teacher_email,
  },
  zoom_meeting_id: row.zoom_meeting_id,
  zoom_join_url: row.zoom_join_url,
  zoom_start_url: row.zoom_start_url,
});

export const listCourses = async () => {
  const rows = await listCourseRows();
  return rows.map(mapCourse);
};

export const getCourseDetail = async (slug, userId) => {
  const row = await findBySlug(slug);
  if (!row) return null;

  let is_enrolled = false;
  if (userId) {
    is_enrolled = await isUserEnrolled(userId, row.id);
  }

  const course = mapCourse(row);
  
  // Si l'utilisateur n'est pas inscrit et n'est pas le professeur, on masque les URLs Zoom
  if (!is_enrolled && userId !== course.teacher_id) {
    delete course.zoom_join_url;
    delete course.zoom_start_url;
  }
  // Si c'est l'élève inscrit, on ne montre que le join_url
  else if (is_enrolled && userId !== course.teacher_id) {
    delete course.zoom_start_url;
  }

  return {
    ...course,
    is_enrolled,
  };
};

export const createCourse = async (teacherId, payload) => {
  const required = ["title", "slug", "format"];
  for (const k of required) {
    if (!payload[k]) throw badRequest("missing_field", `${k} is required`);
  }
  if (!["live", "replay"].includes(payload.format)) {
    throw badRequest("invalid_format");
  }
  
  // Vérifier que la date du cours est au moins dans 7 jours
  if (payload.course_date) {
    const courseDate = new Date(payload.course_date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    
    if (courseDate < minDate) {
      throw badRequest("course_date_too_soon", "La date du cours doit être au minimum dans une semaine (7 jours)");
    }
  }

  let course = await createCourseRow({
    title: payload.title,
    slug: payload.slug,
    discipline: payload.discipline || null,
    level: payload.level || null,
    format: payload.format,
    description: payload.description || "",
    price_cents: payload.price_cents ?? 0,
    teacher_id: teacherId,
    course_date: payload.course_date || null,
    min_students: payload.min_students ?? 1,
    max_students: payload.max_students || null,
  });

  // Si c'est un cours live, on tente de créer la réunion Zoom
  if (course.format === "live") {
    console.log(`Creating Zoom meeting for course ${course.id}...`);
    const zoomMeeting = await createZoomMeeting(teacherId, {
      title: course.title,
      description: course.description,
      start_time: course.course_date,
      duration: 60, // Par défaut 60 minutes
    });

    if (zoomMeeting) {
      console.log(`Zoom meeting created: ${zoomMeeting.meeting_id}`);
      course = await updateCourseZoom(course.id, {
        zoom_meeting_id: zoomMeeting.meeting_id,
        zoom_join_url: zoomMeeting.join_url,
        zoom_start_url: zoomMeeting.start_url,
      });
    } else {
      console.warn(`Failed to create Zoom meeting for course ${course.id}. Check logs for errors.`);
    }
  }

  return course;
};

export const listTeacherCourses = async (teacherId) => {
  const rows = await listByTeacher(teacherId);
  return rows.map(mapCourse);
};

export const listCourseEnrollments = async (teacherId, courseId) => {
  const courses = await listByTeacher(teacherId);
  const owns = courses.find((c) => c.id === Number(courseId));
  if (!owns) throw notFound("course_not_found_or_not_owner");
  return listEnrollmentsForCourse(courseId);
};

export const cancelCourse = async (teacherId, courseId) => {
  const course = await findById(courseId);
  if (!course) throw notFound("course_not_found");
  if (course.teacher_id !== teacherId) throw notFound("not_authorized");
  if (course.status === "cancelled") throw badRequest("already_cancelled");

  // Vérifier la contrainte de 3 jours
  const now = new Date();
  const courseDate = new Date(course.course_date);
  const limitDate = new Date(courseDate);
  limitDate.setDate(limitDate.getDate() - 3);

  if (now > limitDate) {
    throw badRequest("cancellation_period_exceeded", "Vous ne pouvez annuler un cours que jusqu'à 3 jours avant sa date prévue.");
  }

  // Marquer comme annulé
   await updateStatus(courseId, "cancelled");
 
   // Si c'est un cours live avec une réunion Zoom, on tente de la supprimer
   if (course.format === "live" && course.zoom_meeting_id) {
     console.log(`Deleting Zoom meeting ${course.zoom_meeting_id} for course ${courseId}...`);
     await deleteZoomMeeting(teacherId, course.zoom_meeting_id);
     // On nettoie les liens Zoom dans la DB
     await updateCourseZoom(courseId, {
       zoom_meeting_id: null,
       zoom_join_url: null,
       zoom_start_url: null,
     });
   }
 
   // Récupérer les étudiants inscrits pour les notifier
  const { rows: students } = await query(
    `SELECT u.email, u.id
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     WHERE e.course_id = $1 AND e.status = 'enrolled'`,
    [courseId]
  );

  for (const student of students) {
    await sendEmail(
      student.email,
      `Annulation du cours: ${course.title}`,
      `Bonjour,\n\nNous vous informons que le professeur a annulé le cours "${course.title}" prévu le ${new Date(course.course_date).toLocaleDateString('fr-FR')}.\n\nVous serez contacté prochainement pour les modalités de remboursement.\n\nCordialement,\nL'équipe Soul Into Art`
    );
  }

  return { success: true };
};

export const retryZoomMeeting = async (teacherId, courseId) => {
  const course = await findById(courseId);
  if (!course) throw notFound("course_not_found");
  if (course.teacher_id !== teacherId) throw notFound("not_authorized");
  if (course.format !== "live") throw badRequest("not_a_live_course");
  if (course.zoom_meeting_id) throw badRequest("zoom_meeting_already_exists");

  console.log(`Retrying Zoom meeting creation for course ${courseId}...`);
  const zoomMeeting = await createZoomMeeting(teacherId, {
    title: course.title,
    description: course.description,
    start_time: course.course_date,
    duration: 60,
  });

  if (!zoomMeeting) {
    throw badRequest("zoom_creation_failed", "La création de la réunion Zoom a encore échoué. Veuillez vérifier vos identifiants Zoom dans le dashboard.");
  }

  const updatedCourse = await updateCourseZoom(course.id, {
    zoom_meeting_id: zoomMeeting.meeting_id,
    zoom_join_url: zoomMeeting.join_url,
    zoom_start_url: zoomMeeting.start_url,
  });

  return mapCourse(updatedCourse);
};
