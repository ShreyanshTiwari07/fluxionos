-- Up Migration
CREATE TYPE email_status AS ENUM ('scheduled', 'sending', 'sent', 'failed', 'cancelled');

CREATE TABLE fluxion_emails (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES fluxion_users(id) ON DELETE CASCADE,
  "to"              TEXT[] NOT NULL,
  cc                TEXT[],
  subject           VARCHAR(998) NOT NULL,
  body              TEXT NOT NULL,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  sent_at           TIMESTAMPTZ,
  status            email_status NOT NULL DEFAULT 'scheduled',
  gmail_message_id  VARCHAR(255),
  gmail_thread_id   VARCHAR(255),
  error_message     TEXT,
  retry_count       INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fluxion_emails_user_id ON fluxion_emails(user_id);
CREATE INDEX idx_fluxion_emails_status_scheduled ON fluxion_emails(status, scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_fluxion_emails_gmail_thread ON fluxion_emails(gmail_thread_id) WHERE gmail_thread_id IS NOT NULL;

-- Down Migration
-- DROP TABLE fluxion_emails;
-- DROP TYPE email_status;
