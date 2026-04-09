import { findById as findCourseById } from "../models/courseModel.js";
import {
  createEnrollment,
  getEnrollment,
  listCoursesForUser,
  cancelEnrollment,
} from "../models/enrollmentModel.js";
import * as subscriptionModel from "../models/subscriptionModel.js";
import { conflict, notFound, badRequest } from "../utils/httpError.js";

export const enrollUserInCourse = async (userId, courseId) => {
  if (!courseId) {
    throw badRequest("missing_course_id", "course_id is required");
  }

  const course = await findCourseById(courseId);
  if (!course) throw notFound("course_not_found");

  // Vérifier si l'utilisateur a un abonnement avec des cours gratuits disponibles
  let usedFreeCourse = false;
  if (course.teacher_id) {
    try {
      const freeCourseSub = await subscriptionModel.hasFreeCourseAvailable(userId, course.teacher_id);
      if (freeCourseSub) {
        // Utiliser un cours gratuit
        await subscriptionModel.incrementFreeCoursesUsed(freeCourseSub.id);
        usedFreeCourse = true;
      }
    } catch (err) {
      // Si erreur, continuer sans utiliser de cours gratuit
      console.error('Erreur lors de la vérification des cours gratuits:', err);
    }
  }

  const inserted = await createEnrollment(userId, courseId);
  if (!inserted) {
    const existing = await getEnrollment(userId, courseId);
    if (existing?.status === "enrolled") {
      throw conflict("already_enrolled");
    }
    throw conflict("enrollment_exists");
  }

  return { ok: true, usedFreeCourse };
};

export const getUserCourses = async (userId) => {
  const rows = await listCoursesForUser(userId);
  return rows.map((row) => ({
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
    rating_avg: row.rating_avg === null || row.rating_avg === undefined ? null : Number(row.rating_avg),
    reviews_count: Number(row.reviews_count || 0),
    teacher_id: row.teacher_id,
    teacher: {
      id: row.teacher_id,
      email: row.teacher_email,
    },
    enrollment_date: row.enrollment_date,
  }));
};

export const unenrollUserFromCourse = async (userId, courseId) => {
  if (!courseId) throw badRequest("missing_course_id");
  const course = await findCourseById(courseId);
  if (!course) throw notFound("course_not_found");
  const ok = await cancelEnrollment(userId, courseId);
  if (!ok) throw notFound("enrollment_not_found");
  return { ok: true };
};
