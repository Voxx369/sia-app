import { query } from "../config/db.js";

const announcementSelect = `
  SELECT
    a.id,
    a.author_id,
    a.title,
    a.message,
    a.audience,
    a.course_id,
    a.status,
    a.published_at,
    a.created_at,
    a.updated_at,
    c.title AS course_title,
    c.slug AS course_slug,
    u.email AS author_email,
    tp.display_name AS author_name
  FROM announcements a
  JOIN users u ON u.id = a.author_id
  LEFT JOIN teacher_profiles tp ON tp.user_id = a.author_id
  LEFT JOIN courses c ON c.id = a.course_id
`;

export const listByAuthor = async (authorId) => {
  const { rows } = await query(
    `
      ${announcementSelect}
      WHERE a.author_id = $1
      ORDER BY a.published_at DESC NULLS LAST, a.id DESC
    `,
    [authorId]
  );
  return rows;
};

export const listFeedForUser = async (userId) => {
  const { rows } = await query(
    `
      WITH followed_teachers AS (
        SELECT DISTINCT c.teacher_id
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = $1
          AND e.status = 'enrolled'
      )
      ${announcementSelect}
      WHERE a.status = 'published'
        AND a.author_id IN (SELECT teacher_id FROM followed_teachers)
      ORDER BY a.published_at DESC NULLS LAST, a.id DESC
    `,
    [userId]
  );
  return rows;
};

export const createAnnouncement = async (payload) => {
  const { rows } = await query(
    `
      INSERT INTO announcements (
        author_id,
        title,
        message,
        audience,
        course_id,
        status,
        published_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, now())
      RETURNING id
    `,
    [
      payload.author_id,
      payload.title,
      payload.message,
      payload.audience,
      payload.course_id,
      payload.status,
      payload.published_at,
    ]
  );

  const { rows: fullRows } = await query(
    `
      ${announcementSelect}
      WHERE a.id = $1
      LIMIT 1
    `,
    [rows[0].id]
  );

  return fullRows[0] || null;
};
