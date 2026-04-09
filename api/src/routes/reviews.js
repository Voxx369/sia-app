import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyCourseReview,
  getMyReviewsList,
  getMyTeacherReviewsList,
  putMyCourseReview,
} from "../controllers/reviewController.js";

const router = Router();

router.get("/courses/:course_id/me", requireAuth, getMyCourseReview);
router.put("/courses/:course_id/me", requireAuth, putMyCourseReview);
router.get("/me", requireAuth, getMyReviewsList);
router.get("/teacher/me", requireAuth, getMyTeacherReviewsList);

export default router;

