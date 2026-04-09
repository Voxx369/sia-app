import { query } from "../config/db.js";

export const listPublicTeachers = async ({ q, discipline, subscriptionEnabled } = {}) => {
  const values = [];
  const where = [
    "u.role = 'teacher'",
    "tp.is_public = TRUE",
  ];

  // Filtrer uniquement les profs qui acceptent les abonnements
  if (subscriptionEnabled === true) {
    where.push("tp.subscription_enabled = TRUE");
  }

  if (q) {
    values.push(`%${q}%`);
    where.push(`(tp.display_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
  }

  if (discipline) {
    values.push(discipline);
    where.push(`EXISTS (
      SELECT 1
      FROM courses c_d
      WHERE c_d.teacher_id = u.id
        AND c_d.discipline ILIKE $${values.length}
    )`);
  }

  const { rows } = await query(
    `
      SELECT
        u.id AS user_id,
        u.email,
        tp.display_name,
        tp.bio,
        tp.avatar_url,
        tp.cover_url,
        tp.country_code,
        tp.profile_slug,
        tp.is_public,
        tp.subscription_enabled,
        COALESCE(
          array_agg(DISTINCT c.discipline) FILTER (WHERE c.discipline IS NOT NULL),
          '{}'::text[]
        ) AS disciplines,
        COUNT(DISTINCT c.id) AS courses_count,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'enrolled') AS learners_count
      FROM users u
      JOIN teacher_profiles tp ON tp.user_id = u.id
      LEFT JOIN courses c ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE ${where.join(" AND ")}
      GROUP BY u.id, u.email, tp.display_name, tp.bio, tp.avatar_url, tp.cover_url, tp.country_code, tp.profile_slug, tp.is_public, tp.subscription_enabled
      ORDER BY tp.display_name ASC
    `,
    values
  );

  return rows;
};

export const getByUserId = async (userId) => {
  const { rows } = await query(
    `
      SELECT user_id, display_name, bio, avatar_url, cover_url, country_code, profile_slug, is_public, subscription_enabled, created_at, updated_at
      FROM teacher_profiles
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );
  return rows[0] || null;
};

export const upsertProfile = async (profile) => {
  const { rows } = await query(
    `
      INSERT INTO teacher_profiles (
        user_id,
        display_name,
        bio,
        avatar_url,
        cover_url,
        country_code,
        profile_slug,
        is_public,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        cover_url = EXCLUDED.cover_url,
        country_code = EXCLUDED.country_code,
        profile_slug = EXCLUDED.profile_slug,
        is_public = EXCLUDED.is_public,
        updated_at = now()
      RETURNING user_id, display_name, bio, avatar_url, cover_url, country_code, profile_slug, is_public, created_at, updated_at
    `,
    [
      profile.user_id,
      profile.display_name,
      profile.bio,
      profile.avatar_url,
      profile.cover_url,
      profile.country_code,
      profile.profile_slug,
      profile.is_public,
    ]
  );
  return rows[0];
};

// Mettre à jour le statut d'activation des abonnements
export const updateSubscriptionEnabled = async (userId, enabled) => {
  const { rows } = await query(
    `
      UPDATE teacher_profiles
      SET subscription_enabled = $2, updated_at = now()
      WHERE user_id = $1
      RETURNING user_id, display_name, bio, avatar_url, cover_url, country_code, profile_slug, is_public, subscription_enabled, created_at, updated_at
    `,
    [userId, enabled]
  );
  return rows[0];
};
