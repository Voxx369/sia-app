import { Router } from "express";
import {
  getMyProfile,
  getPublicTeachers,
  putMyProfile,
  putSubscriptionEnabled,
} from "../controllers/teacherController.js";
import { requireAuth, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/public", getPublicTeachers);
router.get("/me/profile", requireAuth, requireTeacher, getMyProfile);
router.put("/me/profile", requireAuth, requireTeacher, putMyProfile);
router.put("/me/subscription-enabled", requireAuth, requireTeacher, putSubscriptionEnabled);

export default router;
