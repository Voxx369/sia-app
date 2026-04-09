import { Router } from "express";
import { enroll, unenroll } from "../controllers/enrollmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, enroll);
router.delete("/:course_id", requireAuth, unenroll);

export default router;
