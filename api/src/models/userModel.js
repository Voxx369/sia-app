import { query } from "../config/db.js";

export const findByEmail = async (email) => {
  const { rows } = await query(
    `
      SELECT id, email, role, created_at, password_hash
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );
  return rows[0];
};

export const findById = async (id) => {
  const { rows } = await query(
    `
      SELECT id, email, role, created_at, password_hash, zoom_api_key, zoom_api_secret, zoom_account_id
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  return rows[0];
};

export const updateZoomConfig = async (id, { zoom_api_key, zoom_api_secret, zoom_account_id }) => {
  const { rows } = await query(
    `
      UPDATE users
      SET zoom_api_key = $1, zoom_api_secret = $2, zoom_account_id = $3
      WHERE id = $4
      RETURNING id, zoom_api_key, zoom_api_secret, zoom_account_id
    `,
    [zoom_api_key, zoom_api_secret, zoom_account_id, id]
  );
  return rows[0];
};

export const createUser = async ({ email, password_hash, role = "student" }) => {
  const { rows } = await query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `,
    [email, password_hash, role]
  );
  return rows[0];
};
