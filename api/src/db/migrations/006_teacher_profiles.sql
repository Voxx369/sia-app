CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  country_code TEXT NOT NULL DEFAULT 'FR',
  profile_slug TEXT NOT NULL UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO teacher_profiles (user_id, display_name, profile_slug, is_public)
SELECT
  u.id,
  split_part(u.email, '@', 1),
  split_part(u.email, '@', 1) || '-' || u.id::text,
  TRUE
FROM users u
WHERE u.role = 'teacher'
ON CONFLICT (user_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_public ON teacher_profiles(is_public);
