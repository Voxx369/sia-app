import { Router } from "express";
import {
  getCourse,
  getCourses,
  postCourse,
  getTeacherCourses,
  getTeacherCourseEnrollments,
  cancelCourse,
  retryZoomMeeting,
} from "../controllers/courseController.js";
import { requireAuth, requireTeacher, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", getCourses);
router.get("/teacher/me", requireAuth, requireTeacher, getTeacherCourses);
router.get("/teacher/:course_id/enrollments", requireAuth, requireTeacher, getTeacherCourseEnrollments);
router.post("/", requireAuth, requireTeacher, postCourse);
router.put("/:id/cancel", requireAuth, requireTeacher, cancelCourse);
router.post("/:id/retry-zoom", requireAuth, requireTeacher, retryZoomMeeting);
router.get("/:slug", optionalAuth, getCourse);

export default router;
