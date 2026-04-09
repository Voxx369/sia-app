import { Router } from "express";
import { postLogin, postSignup } from "../controllers/authController.js";

const router = Router();

router.post("/login", postLogin);
router.post("/signup", postSignup);

export default router;
