import {
  createPost,
  findCategoryBySlug,
  findPostById,
  findPublishedPostBySlug,
  listPublishedPosts,
  updatePostById,
} from "../models/blogModel.js";
import { badRequest, notFound } from "../utils/httpError.js";

const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const mapBlogPost = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  cover_image_url: row.cover_image_url,
  content_md: row.content_md,
  status: row.status,
  published_at: row.published_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
  category: {
    id: row.category_id,
    slug: row.category_slug,
    name: row.category_name,
  },
  author: {
    id: row.author_id,
    email: row.author_email,
    display_name: row.author_name || row.author_email?.split("@")[0] || "Artiste",
    profile_slug: row.author_slug,
    avatar_url: row.author_avatar,
  },
});

const ensureTeacherRole = (user) => {
  if (!user || !["teacher", "admin"].includes(user.role)) {
    throw badRequest("teacher_only", "Teacher account required");
  }
};

const resolveCategoryId = async (categorySlug) => {
  const slug = slugify(categorySlug);
  if (!slug) throw badRequest("invalid_category", "category_slug is required");
  const category = await findCategoryBySlug(slug);
  if (!category) throw badRequest("category_not_found", "Unknown blog category");
  return category.id;
};

export const listPublicBlogPosts = async (filters = {}) => {
  const result = await listPublishedPosts({
    q: filters.q?.trim() || undefined,
    category: filters.category?.trim() || undefined,
    limit: Number(filters.limit) > 0 ? Number(filters.limit) : 50,
    offset: Number(filters.offset) >= 0 ? Number(filters.offset) : 0,
  });

  return {
    items: result.items.map(mapBlogPost),
    total: result.total,
  };
};

export const getPublicBlogPostBySlug = async (slug) => {
  const normalized = slugify(slug);
  if (!normalized) return null;
  const row = await findPublishedPostBySlug(normalized);
  return row ? mapBlogPost(row) : null;
};

export const createTeacherBlogPost = async (user, payload = {}) => {
  ensureTeacherRole(user);

  const title = (payload.title || "").trim();
  const slug = slugify(payload.slug || title);
  const excerpt = (payload.excerpt || "").trim();

  if (!title) throw badRequest("missing_title", "title is required");
  if (!slug) throw badRequest("missing_slug", "slug is required");
  if (!excerpt) throw badRequest("missing_excerpt", "excerpt is required");

  const category_id = await resolveCategoryId(payload.category_slug);
  const content_md = (payload.content_md || excerpt).trim();
  if (!content_md) throw badRequest("missing_content", "content_md is required");

  const status = payload.status || "published";
  if (!["draft", "published", "archived"].includes(status)) {
    throw badRequest("invalid_status", "invalid status");
  }

  const published_at =
    status === "published" ? payload.published_at || new Date().toISOString() : null;

  try {
    const row = await createPost({
      author_id: user.id,
      category_id,
      title,
      slug,
      excerpt,
      cover_image_url: payload.cover_image_url || null,
      content_md,
      status,
      published_at,
    });
    return mapBlogPost(row);
  } catch (err) {
    if (err?.code === "23505") {
      throw badRequest("slug_exists", "blog slug already exists");
    }
    throw err;
  }
};

export const updateTeacherBlogPost = async (user, postId, payload = {}) => {
  ensureTeacherRole(user);

  const existing = await findPostById(postId);
  if (!existing) throw notFound("blog_post_not_found");
  if (existing.author_id !== user.id) {
    throw badRequest("not_owner", "Only the author can update this post");
  }

  const patch = {};
  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    const title = (payload.title || "").trim();
    if (!title) throw badRequest("invalid_title", "title cannot be empty");
    patch.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "slug")) {
    const slug = slugify(payload.slug);
    if (!slug) throw badRequest("invalid_slug", "slug cannot be empty");
    patch.slug = slug;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "excerpt")) {
    const excerpt = (payload.excerpt || "").trim();
    if (!excerpt) throw badRequest("invalid_excerpt", "excerpt cannot be empty");
    patch.excerpt = excerpt;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "cover_image_url")) {
    patch.cover_image_url = payload.cover_image_url || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "content_md")) {
    const content = (payload.content_md || "").trim();
    if (!content) throw badRequest("invalid_content", "content_md cannot be empty");
    patch.content_md = content;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "category_slug")) {
    patch.category_id = await resolveCategoryId(payload.category_slug);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    if (!["draft", "published", "archived"].includes(payload.status)) {
      throw badRequest("invalid_status", "invalid status");
    }
    patch.status = payload.status;
    if (payload.status === "published" && !payload.published_at) {
      patch.published_at = new Date().toISOString();
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "published_at")) {
    patch.published_at = payload.published_at;
  }

  if (Object.keys(patch).length === 0) {
    return mapBlogPost(existing);
  }

  try {
    const updated = await updatePostById(postId, patch);
    return mapBlogPost(updated);
  } catch (err) {
    if (err?.code === "23505") {
      throw badRequest("slug_exists", "blog slug already exists");
    }
    throw err;
  }
};
