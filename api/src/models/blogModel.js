import { query } from "../config/db.js";

const baseSelect = `
  SELECT
    bp.id,
    bp.author_id,
    bp.category_id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.cover_image_url,
    bp.content_md,
    bp.status,
    bp.published_at,
    bp.created_at,
    bp.updated_at,
    bc.slug AS category_slug,
    bc.name AS category_name,
    u.email AS author_email,
    tp.display_name AS author_name,
    tp.profile_slug AS author_slug,
    tp.avatar_url AS author_avatar
  FROM blog_posts bp
  JOIN blog_categories bc ON bc.id = bp.category_id
  JOIN users u ON u.id = bp.author_id
  LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
`;

export const findCategoryBySlug = async (slug) => {
  const { rows } = await query(
    `
      SELECT id, slug, name
      FROM blog_categories
      WHERE slug = $1 AND is_active = TRUE
      LIMIT 1
    `,
    [slug]
  );
  return rows[0] || null;
};

export const listPublishedPosts = async ({ q, category, limit = 50, offset = 0 } = {}) => {
  const values = [];
  const where = ["bp.status = 'published'"];

  if (q) {
    values.push(`%${q}%`);
    where.push(`(bp.title ILIKE $${values.length} OR bp.excerpt ILIKE $${values.length} OR bc.name ILIKE $${values.length})`);
  }

  if (category) {
    values.push(category);
    where.push(`bc.slug = $${values.length}`);
  }

  values.push(limit);
  const limitParam = `$${values.length}`;
  values.push(offset);
  const offsetParam = `$${values.length}`;

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const listQuery = `
    ${baseSelect}
    ${whereSql}
    ORDER BY bp.published_at DESC NULLS LAST, bp.id DESC
    LIMIT ${limitParam}
    OFFSET ${offsetParam}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM blog_posts bp
    JOIN blog_categories bc ON bc.id = bp.category_id
    ${whereSql}
  `;

  const [{ rows: items }, { rows: countRows }] = await Promise.all([
    query(listQuery, values),
    query(countQuery, values.slice(0, values.length - 2)),
  ]);

  return {
    items,
    total: countRows[0]?.total || 0,
  };
};

export const findPublishedPostBySlug = async (slug) => {
  const { rows } = await query(
    `
      ${baseSelect}
      WHERE bp.slug = $1
        AND bp.status = 'published'
      LIMIT 1
    `,
    [slug]
  );
  return rows[0] || null;
};

export const findPostById = async (id) => {
  const { rows } = await query(
    `
      ${baseSelect}
      WHERE bp.id = $1
      LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
};

export const createPost = async (post) => {
  const { rows } = await query(
    `
      INSERT INTO blog_posts (
        author_id,
        category_id,
        title,
        slug,
        excerpt,
        cover_image_url,
        content_md,
        status,
        published_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
      RETURNING id
    `,
    [
      post.author_id,
      post.category_id,
      post.title,
      post.slug,
      post.excerpt,
      post.cover_image_url,
      post.content_md,
      post.status,
      post.published_at,
    ]
  );

  return findPostById(rows[0].id);
};

export const updatePostById = async (id, patch) => {
  const fields = [];
  const values = [];

  const setField = (column, value) => {
    values.push(value);
    fields.push(`${column} = $${values.length}`);
  };

  if (Object.prototype.hasOwnProperty.call(patch, "category_id")) {
    setField("category_id", patch.category_id);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "title")) {
    setField("title", patch.title);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "slug")) {
    setField("slug", patch.slug);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "excerpt")) {
    setField("excerpt", patch.excerpt);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "cover_image_url")) {
    setField("cover_image_url", patch.cover_image_url);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "content_md")) {
    setField("content_md", patch.content_md);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "status")) {
    setField("status", patch.status);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "published_at")) {
    setField("published_at", patch.published_at);
  }

  setField("updated_at", new Date().toISOString());

  values.push(id);
  await query(
    `
      UPDATE blog_posts
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
    `,
    values
  );

  return findPostById(id);
};
