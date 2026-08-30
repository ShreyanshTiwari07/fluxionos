-- Up Migration
CREATE TYPE follow_up_status AS ENUM ('pending', 'checking', 'sent', 'cancelled', 'failed');

CREATE TABLE fluxion_follow_ups (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id          UUID NOT NULL REFERENCES fluxion_emails(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES fluxion_users(id) ON DELETE CASCADE,
  delay_hours       INT NOT NULL,
  follow_up_body    TEXT NOT NULL,
  check_at          TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  status            follow_up_status NOT NULL DEFAULT 'pending',
  gmail_message_id  VARCHAR(255),
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fluxion_followups_status_check ON fluxion_follow_ups(status, check_at) WHERE status = 'pending';
CREATE INDEX idx_fluxion_followups_email ON fluxion_follow_ups(email_id);

-- Down Migration
-- DROP TABLE fluxion_follow_ups;
-- DROP TYPE follow_up_status;
