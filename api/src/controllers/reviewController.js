import {
  getMyReview,
  listMyReviews,
  listMyTeacherReviews,
  upsertMyReview,
} from "../services/reviewService.js";

export const getMyCourseReview = async (req, res, next) => {
  try {
    const review = await getMyReview(req.user, req.params.course_id);
    res.json({ review });
  } catch (err) {
    next(err);
  }
};

export const putMyCourseReview = async (req, res, next) => {
  try {
    const result = await upsertMyReview(req.user, req.params.course_id, req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyReviewsList = async (req, res, next) => {
  try {
    const reviews = await listMyReviews(req.user);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

export const getMyTeacherReviewsList = async (req, res, next) => {
  try {
    const reviews = await listMyTeacherReviews(req.user);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

