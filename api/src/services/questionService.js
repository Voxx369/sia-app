import { notFound, badRequest, forbidden } from "../utils/httpError.js";
import { findById as findCourseById } from "../models/courseModel.js";
import { isUserEnrolled, listEnrollmentsForCourse } from "../models/enrollmentModel.js";
import {
  listQuestionsForCourse,
  listAnswersForQuestion,
  createQuestion,
  createAnswer,
  findQuestionById,
  findAnswerById,
  acceptAnswerById,
  clearAcceptedForQuestion,
} from "../models/questionModel.js";

export const listCourseQnA = async (courseId) => {
  const course = await findCourseById(courseId);
  if (!course) throw notFound("course_not_found");
  const questions = await listQuestionsForCourse(courseId);
  const result = [];
  for (const q of questions) {
    const answers = await listAnswersForQuestion(q.id);
    result.push({
      id: q.id,
      title: q.title,
      body: q.body,
      status: q.status,
      created_at: q.created_at,
      author_email: q.author_email,
      answers: answers.map((a) => ({
        id: a.id,
        body: a.body,
        is_accepted: a.is_accepted,
        created_at: a.created_at,
        author_email: a.author_email,
      })),
    });
  }
  return { course_id: courseId, questions: result };
};

export const addQuestionToCourse = async (userId, courseId, payload) => {
  const course = await findCourseById(courseId);
  if (!course) throw notFound("course_not_found");
  const enrolled = await isUserEnrolled(userId, courseId);
  if (!enrolled) throw forbidden("not_enrolled");
  const title = (payload?.title || "").trim();
  const body = (payload?.body || "").trim();
  if (!title || !body) throw badRequest("invalid_payload");
  const q = await createQuestion(courseId, userId, title, body);
  return { id: q.id };
};

export const addAnswerToQuestion = async (userId, questionId, payload) => {
  const q = await findQuestionById(questionId);
  if (!q) throw notFound("question_not_found");
  const course = await findCourseById(q.course_id);
  if (!course) throw notFound("course_not_found");
  const isTeacher = course.teacher_id === userId;
  if (!isTeacher) throw forbidden("not_allowed");
  const body = (payload?.body || "").trim();
  if (!body) throw badRequest("invalid_payload");
  const a = await createAnswer(questionId, userId, body);
  return { id: a.id };
};

export const acceptAnswer = async (userId, answerId) => {
  const ans = await findAnswerById(answerId);
  if (!ans) throw notFound("answer_not_found");
  const course = await findCourseById(ans.course_id);
  if (!course) throw notFound("course_not_found");
  if (course.teacher_id !== userId) throw forbidden("not_allowed");
  await clearAcceptedForQuestion(ans.question_id);
  const updated = await acceptAnswerById(answerId);
  return { id: updated.id };
};

export const getQuestionWithAnswers = async (questionId) => {
  const q = await findQuestionById(questionId);
  if (!q) throw notFound("question_not_found");
  const answers = await listAnswersForQuestion(questionId);
  return {
    id: q.id,
    course_id: q.course_id,
    title: q.title,
    body: q.body,
    status: q.status,
    created_at: q.created_at,
    author_email: q.author_email,
    answers: answers.map((a) => ({
      id: a.id,
      body: a.body,
      is_accepted: a.is_accepted,
      created_at: a.created_at,
      author_email: a.author_email,
    })),
  };
};

export const listUserQuestions = async (userId) => {
  const { listQuestionsForUser } = await import("../models/questionModel.js");
  const questions = await listQuestionsForUser(userId);
  const result = [];
  for (const q of questions) {
    const answers = await listAnswersForQuestion(q.id);
    result.push({
      id: q.id,
      course_id: q.course_id,
      course_title: q.course_title,
      title: q.title,
      body: q.body,
      status: q.status,
      created_at: q.created_at,
      teacher_email: q.teacher_email,
      answers: answers.map((a) => ({
        id: a.id,
        body: a.body,
        is_accepted: a.is_accepted,
        created_at: a.created_at,
        author_email: a.author_email,
      })),
    });
  }
  return { questions: result };
};

export const listTeacherQuestions = async (teacherId) => {
  const { listQuestionsForTeacher } = await import("../models/questionModel.js");
  const questions = await listQuestionsForTeacher(teacherId);
  const result = [];
  for (const q of questions) {
    const answers = await listAnswersForQuestion(q.id);
    result.push({
      id: q.id,
      course_id: q.course_id,
      course_title: q.course_title,
      title: q.title,
      body: q.body,
      status: q.status,
      created_at: q.created_at,
      author_email: q.author_email,
      answers: answers.map((a) => ({
        id: a.id,
        body: a.body,
        is_accepted: a.is_accepted,
        created_at: a.created_at,
        author_email: a.author_email,
      })),
    });
  }
  return { questions: result };
};
