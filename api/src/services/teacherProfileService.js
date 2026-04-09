import {
  getByUserId,
  listPublicTeachers,
  upsertProfile,
  updateSubscriptionEnabled,
} from "../models/teacherProfileModel.js";
import { getTeacherReviewSummary } from "../models/reviewModel.js";
import { badRequest } from "../utils/httpError.js";

const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const sanitizeDiscipline = (value) => (value ? value.trim() : "");

const mapPublicTeacher = (row) => ({
  user_id: row.user_id,
  email: row.email,
  display_name: row.display_name,
  bio: row.bio,
  avatar_url: row.avatar_url,
  cover_url: row.cover_url,
  country_code: row.country_code,
  profile_slug: row.profile_slug,
  is_public: row.is_public,
  subscription_enabled: row.subscription_enabled || false,
  disciplines: (row.disciplines || []).map(sanitizeDiscipline).filter(Boolean),
  courses_count: Number(row.courses_count || 0),
  learners_count: Number(row.learners_count || 0),
});

const mapProfile = (row, email, reviewSummary) => ({
  user_id: row.user_id,
  email,
  display_name: row.display_name,
  bio: row.bio,
  avatar_url: row.avatar_url,
  cover_url: row.cover_url,
  country_code: row.country_code,
  profile_slug: row.profile_slug,
  is_public: row.is_public,
  subscription_enabled: row.subscription_enabled || false,
  rating_avg:
    reviewSummary?.rating_avg === null || reviewSummary?.rating_avg === undefined
      ? null
      : Number(reviewSummary.rating_avg),
  reviews_count: Number(reviewSummary?.reviews_count || 0),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const ensureTeacherRole = (user) => {
  if (!user || !["teacher", "admin"].includes(user.role)) {
    throw badRequest("teacher_only", "Teacher account required");
  }
};

export const listPublicTeacherProfiles = async ({ q, discipline, subscriptionEnabled } = {}) => {
  const rows = await listPublicTeachers({
    q: q?.trim() || undefined,
    discipline: discipline?.trim() || undefined,
    subscriptionEnabled,
  });
  return rows.map(mapPublicTeacher);
};

export const getMyTeacherProfile = async (user) => {
  ensureTeacherRole(user);

  let profile = await getByUserId(user.id);
  if (!profile) {
    const emailPrefix = (user.email || "teacher").split("@")[0];
    const baseSlug = slugify(emailPrefix) || "teacher";
    profile = await upsertProfile({
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

  const reviewSummary = await getTeacherReviewSummary(user.id);
  return mapProfile(profile, user.email, reviewSummary);
};

export const updateMyTeacherProfile = async (user, payload = {}) => {
  ensureTeacherRole(user);

  const current = await getMyTeacherProfile(user);
  const nextDisplayName = (payload.display_name || current.display_name || "").trim();
  if (!nextDisplayName) {
    throw badRequest("invalid_display_name", "display_name is required");
  }

  const nextSlug = slugify(payload.profile_slug || nextDisplayName || current.profile_slug);
  if (!nextSlug) {
    throw badRequest("invalid_profile_slug", "profile_slug is invalid");
  }

  const nextProfile = {
    user_id: user.id,
    display_name: nextDisplayName,
    bio: (payload.bio ?? current.bio ?? "").trim(),
    avatar_url: payload.avatar_url ?? current.avatar_url ?? null,
    cover_url: payload.cover_url ?? current.cover_url ?? null,
    country_code: (payload.country_code ?? current.country_code ?? "FR").toUpperCase().slice(0, 2),
    profile_slug: nextSlug,
    is_public:
      typeof payload.is_public === "boolean" ? payload.is_public : Boolean(current.is_public),
  };

  try {
    const saved = await upsertProfile(nextProfile);
    const reviewSummary = await getTeacherReviewSummary(user.id);
    return mapProfile(saved, user.email, reviewSummary);
  } catch (err) {
    if (err?.code === "23505") {
      throw badRequest("profile_slug_exists", "profile_slug already exists");
    }
    throw err;
  }
};

// Activer/désactiver les abonnements pour un professeur
export const toggleSubscriptionEnabled = async (user, enabled) => {
  ensureTeacherRole(user);
  
  const updated = await updateSubscriptionEnabled(user.id, enabled);
  if (!updated) {
    throw badRequest("profile_not_found", "Teacher profile not found");
  }
  
  const reviewSummary = await getTeacherReviewSummary(user.id);
  return mapProfile(updated, user.email, reviewSummary);
};
