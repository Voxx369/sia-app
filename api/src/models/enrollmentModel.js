import { query } from "../config/db.js";

export const createEnrollment = async (userId, courseId) => {
  const { rows } = await query(
    `
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1, $2, 'enrolled')
      ON CONFLICT (user_id, course_id) DO NOTHING
      RETURNING *
    `,
    [userId, courseId]
  );
  return rows[0];
};

export const getEnrollment = async (userId, courseId) => {
  const { rows } = await query(
    `
      SELECT * FROM enrollments
      WHERE user_id = $1 AND course_id = $2
      LIMIT 1
    `,
    [userId, courseId]
  );
  return rows[0];
};

export const isUserEnrolled = async (userId, courseId) => {
  const { rows } = await query(
    `
      SELECT 1 FROM enrollments
      WHERE user_id = $1 AND course_id = $2 AND status = 'enrolled'
      LIMIT 1
    `,
    [userId, courseId]
  );
  return Boolean(rows[0]);
};

export const listCoursesForUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.discipline,
        c.level,
        c.format,
        c.description,
        c.price_cents,
        c.course_date,
        c.status,
        c.teacher_id,
        u.email AS teacher_email,
        COALESCE(crs.rating_avg, NULL) AS rating_avg,
        COALESCE(crs.reviews_count, 0) AS reviews_count,
        e.created_at AS enrollment_date
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON u.id = c.teacher_id
      LEFT JOIN (
        SELECT course_id, AVG(rating)::float AS rating_avg, COUNT(*)::int AS reviews_count
        FROM course_reviews
        GROUP BY course_id
      ) crs ON crs.course_id = c.id
      WHERE e.user_id = $1 AND e.status = 'enrolled'
      ORDER BY e.created_at DESC
    `,
    [userId]
  );
  return rows;
};

export const listEnrollmentsForCourse = async (courseId) => {
  const { rows } = await query(
    `
      SELECT e.id, e.user_id, e.created_at, u.email
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.course_id = $1 AND e.status = 'enrolled'
      ORDER BY e.created_at DESC
    `,
    [courseId]
  );
  return rows;
};

export const cancelEnrollment = async (userId, courseId) => {
  const { rowCount } = await query(
    `
      DELETE FROM enrollments
      WHERE user_id = $1 AND course_id = $2
    `,
    [userId, courseId]
  );
  return rowCount > 0;
};
