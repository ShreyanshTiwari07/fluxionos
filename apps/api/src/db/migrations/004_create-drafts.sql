-- Up Migration
CREATE TYPE draft_category AS ENUM ('cold_outreach', 'reminder', 'personal', 'uncategorized');

CREATE TABLE fluxion_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES fluxion_users(id) ON DELETE CASCADE,
  "to"        TEXT[],
  subject     VARCHAR(998),
  body        TEXT,
  category    draft_category NOT NULL DEFAULT 'uncategorized',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fluxion_drafts_user_category ON fluxion_drafts(user_id, category);

-- Down Migration
-- DROP TABLE fluxion_drafts;
-- DROP TYPE draft_category;
