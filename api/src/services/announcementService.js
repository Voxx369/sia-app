import { findById as findCourseById } from "../models/courseModel.js";
import {
  createAnnouncement,
  listByAuthor,
  listFeedForUser,
} from "../models/announcementModel.js";
import { badRequest, notFound } from "../utils/httpError.js";

const ensureTeacherRole = (user) => {
  if (!user || !["teacher", "admin"].includes(user.role)) {
    throw badRequest("teacher_only", "Teacher account required");
  }
};

const mapAnnouncement = (row) => ({
  id: row.id,
  title: row.title,
  message: row.message,
  audience: row.audience,
  course_id: row.course_id,
  course_title: row.course_title,
  course_slug: row.course_slug,
  status: row.status,
  published_at: row.published_at,
  created_at: row.created_at,
  author: {
    id: row.author_id,
    email: row.author_email,
    display_name: row.author_name || row.author_email?.split("@")[0] || "Artiste",
  },
});

export const listTeacherAnnouncements = async (user) => {
  ensureTeacherRole(user);
  const rows = await listByAuthor(user.id);
  return rows.map(mapAnnouncement);
};

export const listAnnouncementFeedForUser = async (user) => {
  const rows = await listFeedForUser(user.id);
  return rows.map(mapAnnouncement);
};

export const createTeacherAnnouncement = async (user, payload = {}) => {
  ensureTeacherRole(user);

  const title = (payload.title || "").trim();
  const message = (payload.message || "").trim();
  const audience = (payload.audience || "followers").trim();

  if (!title) throw badRequest("missing_title", "title is required");
  if (!message) throw badRequest("missing_message", "message is required");
  if (!["followers", "course"].includes(audience)) {
    throw badRequest("invalid_audience", "audience must be followers or course");
  }

  let course_id = null;
  if (audience === "course") {
    course_id = Number(payload.course_id);
    if (!course_id) {
      throw badRequest("missing_course_id", "course_id is required for course audience");
    }

    const course = await findCourseById(course_id);
    if (!course) throw notFound("course_not_found");
    if (course.teacher_id !== user.id) {
      throw badRequest("course_not_owned", "course does not belong to this teacher");
    }
  }

  const row = await createAnnouncement({
    author_id: user.id,
    title,
    message,
    audience,
    course_id,
    status: "published",
    published_at: new Date().toISOString(),
  });

  return mapAnnouncement(row);
};
