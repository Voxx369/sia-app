import { Router } from "express";
import { myCourses } from "../controllers/enrollmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me/courses", requireAuth, myCourses);

export default router;
