import {
  listCourseQnA,
  addQuestionToCourse,
  addAnswerToQuestion,
  acceptAnswer,
  getQuestionWithAnswers,
  listUserQuestions,
} from "../services/questionService.js";

export const getCourseQuestions = async (req, res, next) => {
  try {
    const courseId = Number(req.params.course_id);
    const result = await listCourseQnA(courseId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const postCourseQuestion = async (req, res, next) => {
  try {
    const courseId = Number(req.params.course_id);
    const userId = req.user.id;
    const result = await addQuestionToCourse(userId, courseId, req.body || {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const questionId = Number(req.params.question_id);
    const result = await getQuestionWithAnswers(questionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const postAnswer = async (req, res, next) => {
  try {
    const questionId = Number(req.params.question_id);
    const userId = req.user.id;
    const result = await addAnswerToQuestion(userId, questionId, req.body || {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const acceptAnswerCtrl = async (req, res, next) => {
  try {
    const answerId = Number(req.params.answer_id);
    const userId = req.user.id;
    const result = await acceptAnswer(userId, answerId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyTeacherQuestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await (await import("../services/questionService.js")).listTeacherQuestions(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyQuestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await listUserQuestions(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
