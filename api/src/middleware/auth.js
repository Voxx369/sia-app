import { verifyToken } from "../utils/jwt.js";
import { findById as findUserById } from "../models/userModel.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.sub);
    if (!user) return res.status(401).json({ error: "unauthorized" });
    req.user = user;
    next();
  } catch (_err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.sub);
    if (user) req.user = user;
    next();
  } catch (_err) {
    next();
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "forbidden" });
  }
  return next();
};

export const requireTeacher = requireRole("teacher", "admin");
