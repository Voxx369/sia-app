CREATE TABLE IF NOT EXISTS site_content_entries (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_content_entries_key ON site_content_entries(key);
CREATE INDEX IF NOT EXISTS idx_site_content_entries_published ON site_content_entries(is_published);
