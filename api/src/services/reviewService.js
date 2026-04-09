import { findById as findCourseById } from "../models/courseModel.js";
import { isUserEnrolled } from "../models/enrollmentModel.js";
import {
  findMyCourseReview,
  getCourseReviewSummary,
  listReviewsByUser,
  listReviewsForTeacher,
  upsertCourseReview,
} from "../models/reviewModel.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";

const normalizeRating = (value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) return null;
  return number;
};

const normalizeComment = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

export const getMyReview = async (user, courseId) => {
  const course_id = Number(courseId);
  if (!course_id) throw badRequest("invalid_course_id", "course_id is invalid");

  const course = await findCourseById(course_id);
  if (!course) throw notFound("course_not_found");

  const review = await findMyCourseReview(user.id, course_id);
  return review;
};

export const upsertMyReview = async (user, courseId, payload = {}) => {
  const course_id = Number(courseId);
  if (!course_id) throw badRequest("invalid_course_id", "course_id is invalid");

  const course = await findCourseById(course_id);
  if (!course) throw notFound("course_not_found");

  const rating = normalizeRating(payload.rating);
  if (!rating) throw badRequest("invalid_rating", "rating must be an integer between 1 and 5");

  const comment = normalizeComment(payload.comment);
  if (comment.length > 2000) {
    throw badRequest("invalid_comment", "comment too long (max 2000 chars)");
  }

  const enrolled = await isUserEnrolled(user.id, course_id);
  if (!enrolled) throw forbidden("not_enrolled", "User must be enrolled to review this course");

  const review = await upsertCourseReview({
    user_id: user.id,
    course_id,
    rating,
    comment,
  });

  const summary = await getCourseReviewSummary(course_id);

  return {
    review,
    summary: {
      rating_avg: summary.rating_avg === null ? null : Number(summary.rating_avg),
      reviews_count: Number(summary.reviews_count || 0),
    },
  };
};

const ensureTeacherRole = (user) => {
  if (!user || !["teacher", "admin"].includes(user.role)) {
    throw forbidden("teacher_only", "Teacher account required");
  }
};

const mapReviewRow = (row) => ({
  id: row.id,
  rating: Number(row.rating),
  comment: row.comment || "",
  created_at: row.created_at,
  updated_at: row.updated_at,
  course: {
    id: row.course_id,
    title: row.course_title,
    discipline: row.course_discipline,
    slug: row.course_slug,
  },
});

export const listMyReviews = async (user) => {
  const rows = await listReviewsByUser(user.id);
  return rows.map((row) => ({
    ...mapReviewRow(row),
    teacher: {
      id: row.teacher_id,
      email: row.teacher_email,
    },
  }));
};

export const listMyTeacherReviews = async (user) => {
  ensureTeacherRole(user);
  const rows = await listReviewsForTeacher(user.id);
  return rows.map((row) => ({
    ...mapReviewRow(row),
    student: {
      id: row.student_id,
      email: row.student_email,
    },
  }));
};

