import { Router } from "express";
import {
  getAnnouncementFeed,
  getMyAnnouncements,
  postAnnouncement,
} from "../controllers/announcementController.js";
import { requireAuth, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/feed", requireAuth, getAnnouncementFeed);
router.get("/my", requireAuth, requireTeacher, getMyAnnouncements);
router.post("/", requireAuth, requireTeacher, postAnnouncement);

export default router;
