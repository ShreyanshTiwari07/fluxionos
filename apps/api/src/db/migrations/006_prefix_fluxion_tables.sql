-- Up Migration
-- This database is shared with another application (a social network: posts,
-- comments, followers, ...) which also defines a "users" table. That table is
-- THEIRS: FluxionOS's original users table was dropped when their schema was
-- loaded, which is why login failed with 'column "name" of relation "users"
-- does not exist'. Every table this project owns now carries a fluxion_ prefix.
--
-- public.users is deliberately NOT renamed or altered here. Renaming it would
-- hand another application's production data to FluxionOS.
--
-- Every statement is idempotent, so this is a no-op on a fresh database where
-- migrations 001-004 already created the prefixed tables.

ALTER TABLE IF EXISTS emails     RENAME TO fluxion_emails;
ALTER TABLE IF EXISTS follow_ups RENAME TO fluxion_follow_ups;
ALTER TABLE IF EXISTS drafts     RENAME TO fluxion_drafts;

ALTER INDEX IF EXISTS idx_emails_user_id          RENAME TO idx_fluxion_emails_user_id;
ALTER INDEX IF EXISTS idx_emails_status_scheduled RENAME TO idx_fluxion_emails_status_scheduled;
ALTER INDEX IF EXISTS idx_emails_gmail_thread     RENAME TO idx_fluxion_emails_gmail_thread;
ALTER INDEX IF EXISTS idx_followups_status_check  RENAME TO idx_fluxion_followups_status_check;
ALTER INDEX IF EXISTS idx_followups_email         RENAME TO idx_fluxion_followups_email;
ALTER INDEX IF EXISTS idx_drafts_user_category    RENAME TO idx_fluxion_drafts_user_category;

-- Recreated rather than renamed: the original was destroyed along with the old
-- users table.
CREATE TABLE IF NOT EXISTS fluxion_users (
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

CREATE INDEX IF NOT EXISTS idx_fluxion_users_email ON fluxion_users(email);

-- The user_id foreign keys were dropped along with the old users table (the
-- email_id one survived, since it points at a table that was only renamed).
-- Refuse to proceed rather than silently discarding rows if any are orphaned.
DO $do$
DECLARE
  t      text;
  orphan int;
BEGIN
  FOREACH t IN ARRAY ARRAY['fluxion_emails', 'fluxion_follow_ups', 'fluxion_drafts'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_user_id_fkey') THEN
      CONTINUE;
    END IF;

    -- EXECUTE does not set FOUND, so capture the result explicitly.
    EXECUTE format(
      'SELECT 1 FROM %I x LEFT JOIN fluxion_users u ON u.id = x.user_id
         WHERE u.id IS NULL LIMIT 1', t) INTO orphan;

    IF orphan IS NOT NULL THEN
      RAISE EXCEPTION
        '% has rows whose user_id is absent from fluxion_users; resolve before adding the foreign key', t;
    END IF;

    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (user_id)
         REFERENCES fluxion_users(id) ON DELETE CASCADE', t, t || '_user_id_fkey');
  END LOOP;
END
$do$;

-- Down Migration
-- ALTER TABLE IF EXISTS fluxion_drafts RENAME TO drafts;
-- ALTER TABLE IF EXISTS fluxion_follow_ups RENAME TO follow_ups;
-- ALTER TABLE IF EXISTS fluxion_emails RENAME TO emails;
-- DROP TABLE IF EXISTS fluxion_users;
