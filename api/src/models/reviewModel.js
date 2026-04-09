import { query } from "../config/db.js";

export const upsertCourseReview = async ({ user_id, course_id, rating, comment }) => {
  const { rows } = await query(
    `
      INSERT INTO course_reviews (course_id, user_id, rating, comment, updated_at)
      VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (course_id, user_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        updated_at = now()
      RETURNING id, course_id, user_id, rating, comment, created_at, updated_at
    `,
    [course_id, user_id, rating, comment ?? ""]
  );
  return rows[0] || null;
};

export const findMyCourseReview = async (user_id, course_id) => {
  const { rows } = await query(
    `
      SELECT id, course_id, user_id, rating, comment, created_at, updated_at
      FROM course_reviews
      WHERE user_id = $1 AND course_id = $2
      LIMIT 1
    `,
    [user_id, course_id]
  );
  return rows[0] || null;
};

export const getCourseReviewSummary = async (course_id) => {
  const { rows } = await query(
    `
      SELECT
        AVG(rating)::float AS rating_avg,
        COUNT(*)::int AS reviews_count
      FROM course_reviews
      WHERE course_id = $1
    `,
    [course_id]
  );

  return rows[0] || { rating_avg: null, reviews_count: 0 };
};

export const getTeacherReviewSummary = async (teacher_id) => {
  const { rows } = await query(
    `
      SELECT
        AVG(cr.rating)::float AS rating_avg,
        COUNT(cr.id)::int AS reviews_count
      FROM courses c
      LEFT JOIN course_reviews cr ON cr.course_id = c.id
      WHERE c.teacher_id = $1
    `,
    [teacher_id]
  );

  return rows[0] || { rating_avg: null, reviews_count: 0 };
};

export const listReviewsByUser = async (user_id) => {
  const { rows } = await query(
    `
      SELECT
        cr.id,
        cr.rating,
        cr.comment,
        cr.created_at,
        cr.updated_at,
        c.id AS course_id,
        c.title AS course_title,
        c.discipline AS course_discipline,
        c.slug AS course_slug,
        t.id AS teacher_id,
        t.email AS teacher_email
      FROM course_reviews cr
      JOIN courses c ON c.id = cr.course_id
      JOIN users t ON t.id = c.teacher_id
      WHERE cr.user_id = $1
      ORDER BY cr.updated_at DESC, cr.created_at DESC
    `,
    [user_id]
  );

  return rows;
};

export const listReviewsForTeacher = async (teacher_id) => {
  const { rows } = await query(
    `
      SELECT
        cr.id,
        cr.rating,
        cr.comment,
        cr.created_at,
        cr.updated_at,
        c.id AS course_id,
        c.title AS course_title,
        c.discipline AS course_discipline,
        c.slug AS course_slug,
        s.id AS student_id,
        s.email AS student_email
      FROM course_reviews cr
      JOIN courses c ON c.id = cr.course_id
      JOIN users s ON s.id = cr.user_id
      WHERE c.teacher_id = $1
      ORDER BY cr.updated_at DESC, cr.created_at DESC
    `,
    [teacher_id]
  );

  return rows;
};

