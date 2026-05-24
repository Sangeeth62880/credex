-- Round 2 DB Migration

-- 1. Pricing snapshots — versioned record of what pricing was used
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  version     text NOT NULL,           -- e.g. "2026-05-20"
  data        jsonb NOT NULL,          -- full PRICING object
  notes       text                     -- what changed in this version
);

-- 2. Add pricing version to audits table
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS pricing_snapshot_id uuid REFERENCES pricing_snapshots(id),
  ADD COLUMN IF NOT EXISTS reaudit_count integer DEFAULT 0;

-- 3. Unsubscribes table
CREATE TABLE IF NOT EXISTS unsubscribes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- 4. Notification log — tracks what was sent, prevents duplicate sends
CREATE TABLE IF NOT EXISTS notification_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at             timestamptz DEFAULT now(),
  user_email          text NOT NULL,
  audit_ids_affected  uuid[] NOT NULL,
  pricing_snapshot_id uuid REFERENCES pricing_snapshots(id),
  tools_changed       text[] NOT NULL,
  email_sent          boolean DEFAULT false,
  opened_at           timestamptz,
  reaudit_clicked_at  timestamptz
);

-- 5. Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_audits_snapshot ON audits(pricing_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_notification_email ON notification_log(user_email);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email);

-- 6. RLS policies
ALTER TABLE pricing_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON pricing_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON pricing_snapshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON unsubscribes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON unsubscribes
  FOR SELECT USING (true);

CREATE POLICY "Enable all for anonymous users" ON notification_log
  USING (true) WITH CHECK (true);

-- 7. Allow anonymous users to read leads (needed for change detection user lookup)
CREATE POLICY "Enable select for all users" ON leads
  FOR SELECT USING (true);

