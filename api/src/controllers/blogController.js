import {
  createTeacherBlogPost,
  getPublicBlogPostBySlug,
  listPublicBlogPosts,
  updateTeacherBlogPost,
} from "../services/blogService.js";

export const getBlogPosts = async (req, res, next) => {
  try {
    const result = await listPublicBlogPosts({
      q: req.query.q,
      category: req.query.category,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const post = await getPublicBlogPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const postBlogPost = async (req, res, next) => {
  try {
    const created = await createTeacherBlogPost(req.user, req.body || {});
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const patchBlogPost = async (req, res, next) => {
  try {
    const updated = await updateTeacherBlogPost(req.user, Number(req.params.id), req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
