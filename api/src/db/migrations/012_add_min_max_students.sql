ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS min_students INTEGER DEFAULT 1 CHECK (min_students > 0),
  ADD COLUMN IF NOT EXISTS max_students INTEGER CHECK (max_students IS NULL OR max_students >= min_students);
