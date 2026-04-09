import {
  getCourseDetail,
  listCourses,
  createCourse,
  listTeacherCourses,
  listCourseEnrollments,
  cancelCourse as cancelCourseService,
  retryZoomMeeting as retryZoomService,
} from "../services/courseService.js";

export const getCourses = async (_req, res, next) => {
  try {
    const courses = await listCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id; // Utilise l'ID de l'utilisateur s'il est authentifié
    const course = await getCourseDetail(slug, userId);
    if (!course) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const postCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const course = await createCourse(teacherId, req.body || {});
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const getTeacherCourses = async (req, res, next) => {
  try {
    const courses = await listTeacherCourses(req.user.id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getTeacherCourseEnrollments = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const enrollments = await listCourseEnrollments(req.user.id, course_id);
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};

export const cancelCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await cancelCourseService(req.user.id, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const retryZoomMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await retryZoomService(req.user.id, id);
    res.json(course);
  } catch (err) {
    next(err);
  }
};
