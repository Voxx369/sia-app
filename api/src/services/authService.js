import bcrypt from "bcryptjs";
import { createUser, findByEmail } from "../models/userModel.js";
import { upsertProfile } from "../models/teacherProfileModel.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { signToken } from "../utils/jwt.js";

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const signup = async ({ email, password, role = "student" }) => {
  if (!email || !password) throw badRequest("missing_fields");
  const allowedRoles = ["student", "teacher"];
  if (!allowedRoles.includes(role)) throw badRequest("invalid_role");
  const existing = await findByEmail(email);
  if (existing) throw badRequest("email_exists");
  const password_hash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password_hash, role });

  if (user.role === "teacher") {
    const emailPrefix = email.split("@")[0];
    const baseSlug = slugify(emailPrefix) || "teacher";
    await upsertProfile({
      user_id: user.id,
      display_name: emailPrefix,
      bio: "",
      avatar_url: null,
      cover_url: null,
      country_code: "FR",
      profile_slug: `${baseSlug}-${user.id}`,
      is_public: true,
    });
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};

export const login = async ({ email, password }) => {
  if (!email || !password) throw badRequest("missing_fields");
  const user = await findByEmail(email);
  if (!user) throw notFound("user_not_found");
  if (!user.password_hash) throw badRequest("no_password_set");
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw badRequest("invalid_credentials");
  const token = signToken({ sub: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};
