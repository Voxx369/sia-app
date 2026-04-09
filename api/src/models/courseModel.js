import { query } from "../config/db.js";

const reviewSummaryJoin = `
  LEFT JOIN (
    SELECT course_id, AVG(rating)::float AS rating_avg, COUNT(*)::int AS reviews_count
    FROM course_reviews
    GROUP BY course_id
  ) crs ON crs.course_id = c.id
`;

export const listCourses = async () => {
  const { rows } = await query(
    `
      SELECT c.id, c.title, c.slug, c.discipline, c.level, c.format,
             c.description, c.price_cents, c.course_date, c.status,
             c.min_students, c.max_students,
             c.teacher_id, u.email AS teacher_email,
             crs.rating_avg,
             COALESCE(crs.reviews_count, 0) AS reviews_count,
             COALESCE(enr.enrolled_count, 0) AS enrolled_count
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      ${reviewSummaryJoin}
      LEFT JOIN (
        SELECT course_id, COUNT(*)::int AS enrolled_count
        FROM enrollments
        WHERE status = 'enrolled'
        GROUP BY course_id
      ) enr ON enr.course_id = c.id
      WHERE (c.course_date IS NULL OR c.course_date > (now() + INTERVAL '3 days'))
        AND c.status = 'active'
        AND (c.max_students IS NULL OR COALESCE(enr.enrolled_count, 0) < c.max_students)
      ORDER BY c.id
    `
  );
  return rows;
};

export const findBySlug = async (slug) => {
  const { rows } = await query(
    `
      SELECT c.*, u.email AS teacher_email,
             crs.rating_avg,
             COALESCE(crs.reviews_count, 0) AS reviews_count,
             COALESCE(enr.enrolled_count, 0) AS enrolled_count
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      ${reviewSummaryJoin}
      LEFT JOIN (
        SELECT course_id, COUNT(*)::int AS enrolled_count
        FROM enrollments
        WHERE status = 'enrolled'
        GROUP BY course_id
      ) enr ON enr.course_id = c.id
      WHERE c.slug = $1 
        AND (c.course_date IS NULL OR c.course_date > (now() + INTERVAL '3 days'))
        AND c.status = 'active'
        AND (c.max_students IS NULL OR COALESCE(enr.enrolled_count, 0) < c.max_students)
      LIMIT 1
    `,
    [slug]
  );
  return rows[0];
};

export const findById = async (id) => {
  const { rows } = await query(
    `
      SELECT * FROM courses WHERE id = $1 LIMIT 1
    `,
    [id]
  );
  return rows[0];
};

export const createCourse = async (course) => {
  const { rows } = await query(
    `
      INSERT INTO courses (title, slug, discipline, level, format, description, price_cents, teacher_id, course_date, min_students, max_students)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `,
    [
      course.title,
      course.slug,
      course.discipline,
      course.level,
      course.format,
      course.description,
      course.price_cents,
      course.teacher_id,
      course.course_date || new Date().toISOString(),
      course.min_students || 1,
      course.max_students || null,
    ]
  );
  return rows[0];
};

export const updateCourseZoom = async (id, { zoom_meeting_id, zoom_join_url, zoom_start_url }) => {
  const { rows } = await query(
    `
      UPDATE courses
      SET zoom_meeting_id = $1, zoom_join_url = $2, zoom_start_url = $3
      WHERE id = $4
      RETURNING *
    `,
    [zoom_meeting_id, zoom_join_url, zoom_start_url, id]
  );
  return rows[0];
};

export const updateStatus = async (id, status) => {
  const { rows } = await query(
    `
      UPDATE courses
      SET status = $1
      WHERE id = $2
      RETURNING *
    `,
    [status, id]
  );
  return rows[0];
};

export const listByTeacher = async (teacherId) => {
  const { rows } = await query(
    `
      SELECT c.*,
             u.email AS teacher_email,
             crs.rating_avg,
             COALESCE(crs.reviews_count, 0) AS reviews_count,
             COALESCE(enr.enrolled_count, 0) AS enrolled_count
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      ${reviewSummaryJoin}
      LEFT JOIN (
        SELECT course_id, COUNT(*)::int AS enrolled_count
        FROM enrollments
        WHERE status = 'enrolled'
        GROUP BY course_id
      ) enr ON enr.course_id = c.id
      WHERE c.teacher_id = $1
      ORDER BY c.id DESC
    `,
    [teacherId]
  );
  return rows;
};
