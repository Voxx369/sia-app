import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCourseQuestions,
  postCourseQuestion,
  getQuestion,
  postAnswer,
  acceptAnswerCtrl,
  getMyTeacherQuestions,
  getMyQuestions,
} from "../controllers/questionController.js";
import { requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/courses/:course_id/questions", getCourseQuestions);
router.post("/courses/:course_id/questions", requireAuth, postCourseQuestion);
router.get("/questions/:question_id", getQuestion);
router.post("/questions/:question_id/answers", requireAuth, postAnswer);
router.patch("/answers/:answer_id/accept", requireAuth, acceptAnswerCtrl);
router.get("/teacher/me", requireAuth, requireTeacher, getMyTeacherQuestions);
router.get("/me", requireAuth, getMyQuestions);

export default router;
