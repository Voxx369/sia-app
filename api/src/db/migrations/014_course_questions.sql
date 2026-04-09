CREATE TABLE IF NOT EXISTS course_questions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON course_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_user_id ON course_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_created_at ON course_questions(created_at);

CREATE TABLE IF NOT EXISTS course_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_answers_question_id ON course_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_course_answers_user_id ON course_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_course_answers_created_at ON course_answers(created_at);
