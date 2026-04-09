import {
  enrollUserInCourse,
  getUserCourses,
  unenrollUserFromCourse,
} from "../services/enrollmentService.js";

export const enroll = async (req, res, next) => {
  try {
    const { course_id } = req.body || {};
    const userId = req.user.id;
    const result = await enrollUserInCourse(userId, Number(course_id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const unenroll = async (req, res, next) => {
  try {
    const courseId = Number(req.params.course_id);
    const userId = req.user.id;
    const result = await unenrollUserFromCourse(userId, courseId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const myCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courses = await getUserCourses(userId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};
