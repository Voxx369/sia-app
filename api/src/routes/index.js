import { Router } from "express";
import authRoutes from "./auth.js";
import courseRoutes from "./courses.js";
import enrollmentRoutes from "./enrollments.js";
import userRoutes from "./users.js";
import teacherRoutes from "./teachers.js";
import blogRoutes from "./blog.js";
import announcementRoutes from "./announcements.js";
import contentRoutes from "./content.js";
import reviewRoutes from "./reviews.js";
import qaRoutes from "./qa.js";
import zoomRoutes from "./zoom.js";
import subscriptionRoutes from "./subscriptions.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/enroll", enrollmentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/blog", blogRoutes);
router.use("/announcements", announcementRoutes);
router.use("/content", contentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/qa", qaRoutes);
router.use("/zoom", zoomRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/", userRoutes);

export default router;
