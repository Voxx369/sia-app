import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getZoomConfig, putZoomConfig } from "../controllers/zoomController.js";

const router = Router();

router.get("/config", requireAuth, getZoomConfig);
router.put("/config", requireAuth, putZoomConfig);

export default router;
