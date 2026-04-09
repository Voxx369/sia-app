ALTER TABLE courses
ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
