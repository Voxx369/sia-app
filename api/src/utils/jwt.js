import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const signToken = (payload, opts = {}) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: "7d", ...opts });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
