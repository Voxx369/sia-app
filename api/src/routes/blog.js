import { Router } from "express";
import {
  getBlogPostBySlug,
  getBlogPosts,
  patchBlogPost,
  postBlogPost,
} from "../controllers/blogController.js";
import { requireAuth, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/posts", getBlogPosts);
router.get("/posts/:slug", getBlogPostBySlug);
router.post("/posts", requireAuth, requireTeacher, postBlogPost);
router.patch("/posts/:id", requireAuth, requireTeacher, patchBlogPost);

export default router;
