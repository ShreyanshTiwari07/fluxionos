-- Up Migration
CREATE TABLE fluxion_users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) NOT NULL UNIQUE,
  name                VARCHAR(255),
  picture_url         TEXT,
  access_token        TEXT NOT NULL,
  refresh_token       TEXT NOT NULL,
  token_expiry        TIMESTAMPTZ NOT NULL,
  plan                VARCHAR(20) NOT NULL DEFAULT 'free',
  monthly_send_count  INT NOT NULL DEFAULT 0,
  send_count_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fluxion_users_email ON fluxion_users(email);

-- Down Migration
-- DROP INDEX idx_fluxion_users_email;
-- DROP TABLE fluxion_users;
