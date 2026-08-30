-- Up Migration
-- Add AI-powered + absolute-time follow-up support.
ALTER TABLE fluxion_follow_ups ADD COLUMN mode TEXT NOT NULL DEFAULT 'manual';            -- 'manual' | 'ai'
ALTER TABLE fluxion_follow_ups ADD COLUMN follow_up_at TIMESTAMPTZ;                        -- absolute custom send time (null => use delay_hours)
ALTER TABLE fluxion_follow_ups ADD COLUMN ai_regenerate BOOLEAN NOT NULL DEFAULT false;   -- regenerate body via AI at send time
ALTER TABLE fluxion_follow_ups ALTER COLUMN delay_hours DROP NOT NULL;                     -- null when an absolute time is used
ALTER TABLE fluxion_follow_ups ALTER COLUMN follow_up_body DROP NOT NULL;                  -- null until an AI body is generated

-- Down Migration
-- ALTER TABLE fluxion_follow_ups ALTER COLUMN follow_up_body SET NOT NULL;
-- ALTER TABLE fluxion_follow_ups ALTER COLUMN delay_hours SET NOT NULL;
-- ALTER TABLE fluxion_follow_ups DROP COLUMN ai_regenerate;
-- ALTER TABLE fluxion_follow_ups DROP COLUMN follow_up_at;
-- ALTER TABLE fluxion_follow_ups DROP COLUMN mode;
