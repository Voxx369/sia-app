import {
  createTeacherAnnouncement,
  listAnnouncementFeedForUser,
  listTeacherAnnouncements,
} from "../services/announcementService.js";

export const getAnnouncementFeed = async (req, res, next) => {
  try {
    const items = await listAnnouncementFeedForUser(req.user);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getMyAnnouncements = async (req, res, next) => {
  try {
    const items = await listTeacherAnnouncements(req.user);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const postAnnouncement = async (req, res, next) => {
  try {
    const created = await createTeacherAnnouncement(req.user, req.body || {});
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};
