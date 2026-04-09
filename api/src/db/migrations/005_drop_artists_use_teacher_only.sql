-- Remove artist linkage and enforce teacher_id on courses
ALTER TABLE courses DROP COLUMN IF EXISTS artist_id CASCADE;

-- Ensure every course has a teacher; fallback to first teacher/admin if missing
UPDATE courses
SET teacher_id = (
  SELECT id FROM users WHERE role IN ('teacher','admin') ORDER BY id LIMIT 1
)
WHERE teacher_id IS NULL;

ALTER TABLE courses ALTER COLUMN teacher_id SET NOT NULL;

-- Drop artists table (no longer used)
DROP TABLE IF EXISTS artists CASCADE;
