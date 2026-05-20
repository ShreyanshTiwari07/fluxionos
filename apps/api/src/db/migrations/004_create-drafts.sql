-- Up Migration
CREATE TYPE draft_category AS ENUM ('cold_outreach', 'reminder', 'personal', 'uncategorized');

CREATE TABLE drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "to"        TEXT[],
  subject     VARCHAR(998),
  body        TEXT,
  category    draft_category NOT NULL DEFAULT 'uncategorized',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drafts_user_category ON drafts(user_id, category);

-- Down Migration
-- DROP TABLE drafts;
-- DROP TYPE draft_category;
