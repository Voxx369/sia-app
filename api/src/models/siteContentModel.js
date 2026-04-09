import { query } from "../config/db.js";

export const getPublishedContentByKeys = async (keys) => {
  const { rows } = await query(
    `
      SELECT key, payload
      FROM site_content_entries
      WHERE key = ANY($1::text[])
        AND is_published = TRUE
    `,
    [keys]
  );
  return rows;
};
