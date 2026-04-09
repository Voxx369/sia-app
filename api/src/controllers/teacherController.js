import {
  getMyTeacherProfile,
  listPublicTeacherProfiles,
  updateMyTeacherProfile,
  toggleSubscriptionEnabled,
} from "../services/teacherProfileService.js";

export const getPublicTeachers = async (req, res, next) => {
  try {
    const teachers = await listPublicTeacherProfiles({
      q: req.query.q,
      discipline: req.query.discipline,
      subscriptionEnabled: req.query.subscription_enabled === 'true',
    });
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getMyTeacherProfile(req.user);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const putMyProfile = async (req, res, next) => {
  try {
    const profile = await updateMyTeacherProfile(req.user, req.body || {});
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const putSubscriptionEnabled = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }
    const profile = await toggleSubscriptionEnabled(req.user, enabled);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};
