import { query } from "../config/db.js";

export const listQuestionsForCourse = async (courseId) => {
  const { rows } = await query(
    `
      SELECT q.id, q.course_id, q.user_id, q.title, q.body, q.status, q.created_at, q.updated_at,
             u.email AS author_email
      FROM course_questions q
      JOIN users u ON u.id = q.user_id
      WHERE q.course_id = $1
      ORDER BY q.created_at DESC
    `,
    [courseId]
  );
  return rows;
};

export const listAnswersForQuestion = async (questionId) => {
  const { rows } = await query(
    `
      SELECT a.id, a.question_id, a.user_id, a.body, a.is_accepted, a.created_at, a.updated_at,
             u.email AS author_email
      FROM course_answers a
      JOIN users u ON u.id = a.user_id
      WHERE a.question_id = $1
      ORDER BY a.created_at ASC
    `,
    [questionId]
  );
  return rows;
};

export const createQuestion = async (courseId, userId, title, body) => {
  const { rows } = await query(
    `
      INSERT INTO course_questions (course_id, user_id, title, body)
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `,
    [courseId, userId, title, body]
  );
  return rows[0];
};

export const createAnswer = async (questionId, userId, body) => {
  const { rows } = await query(
    `
      INSERT INTO course_answers (question_id, user_id, body)
      VALUES ($1,$2,$3)
      RETURNING *
    `,
    [questionId, userId, body]
  );
  return rows[0];
};

export const findQuestionById = async (id) => {
  const { rows } = await query(
    `
      SELECT q.*, u.email AS author_email
      FROM course_questions q
      JOIN users u ON u.id = q.user_id
      WHERE q.id = $1
      LIMIT 1
    `,
    [id]
  );
  return rows[0];
};

export const findAnswerById = async (id) => {
  const { rows } = await query(
    `
      SELECT a.*, q.course_id
      FROM course_answers a
      JOIN course_questions q ON q.id = a.question_id
      WHERE a.id = $1
      LIMIT 1
    `,
    [id]
  );
  return rows[0];
};

export const acceptAnswerById = async (answerId) => {
  const { rows } = await query(
    `
      UPDATE course_answers
      SET is_accepted = TRUE, updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [answerId]
  );
  return rows[0];
};

export const clearAcceptedForQuestion = async (questionId) => {
  await query(
    `
      UPDATE course_answers
      SET is_accepted = FALSE, updated_at = now()
      WHERE question_id = $1
    `,
    [questionId]
  );
};

export const listQuestionsForTeacher = async (teacherId) => {
  const { rows } = await query(
    `
      SELECT q.id, q.course_id, q.user_id, q.title, q.body, q.status, q.created_at, q.updated_at,
             u.email AS author_email, c.title AS course_title
      FROM course_questions q
      JOIN courses c ON c.id = q.course_id
      JOIN users u ON u.id = q.user_id
      WHERE c.teacher_id = $1
      ORDER BY q.created_at DESC
    `,
    [teacherId]
  );
  return rows;
};

export const listQuestionsForUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT q.id, q.course_id, q.user_id, q.title, q.body, q.status, q.created_at, q.updated_at,
             c.title AS course_title, t.email AS teacher_email
      FROM course_questions q
      JOIN courses c ON c.id = q.course_id
      JOIN users t ON t.id = c.teacher_id
      WHERE q.user_id = $1
      ORDER BY q.created_at DESC
    `,
    [userId]
  );
  return rows;
};
