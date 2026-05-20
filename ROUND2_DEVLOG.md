# Round 2 Spend Auditor Devlog

## Day 1 — Storage & Detection (May 20, 2026)

### 2026-05-20 10:45 AM — Start
- Fully audited Round 2 assignment requirements for the continuous AI pricing audit pipeline.
- Formulated data model and schema changes with `pricing_snapshots`, `unsubscribes`, and `notification_log` tables.
- Decided on atomic triggers and consolidate-by-user email patterns to keep costs low and optimize UX.
- Initiated planning phase and set up project timeline.

### 2026-05-20 11:30 AM — Database Schema Design & Migration
- Configured and executed Supabase migration (`supabase/migrations.sql`) creating three core tables:
  - `pricing_snapshots` to archive historical pricing matrices as JSON.
  - `unsubscribes` to manage opt-outs dynamically.
  - `notification_log` to block duplicate alerts.
- Configured Row-Level Security (RLS) policies for secure anonymous select access on snapshots/unsubscribes.

### 2026-05-20 12:15 PM — Versioned Pricing Snapshots
- Implemented `lib/pricing-snapshot.ts` supporting automatic database seeding. If the codebase `PRICING_VERSION` updates, a new DB snapshot is auto-seeded dynamically from `PRICING_DATA`.
- Integrated snapshots into the core audit creation pipeline so that every newly computed audit records the active `pricing_snapshot_id`.

### 2026-05-20 01:30 PM — Pricing Diff & Change Detection Engine
- Developed `lib/detect-pricing-changes.ts` comparing two versioned pricing snapshots.
- Formulated delta calculation matching specific tools/tiers and identifying exactly which audits contain the tools that experienced shifts in pricing.

### 2026-05-20 02:45 PM — Consolidated Mailer with Rich Layout
- Created `lib/send-pricing-emails.ts` supporting full consolidation. Rather than multiple emails, a user receives exactly one summary presenting recalculations for all affected tools.
- Styled a responsive email template that details side-by-side price shifts (Old Per-Seat vs New Per-Seat) and shows a dynamic recalculated annual savings summary (e.g. increase or decrease in potential optimizations).

### 2026-05-20 04:00 PM — Detect Changes Endpoint
- Developed `app/api/detect-changes/route.ts` designed to run in background cron contexts.
- Added authorization layer checking for `CRON_SECRET` in production headers, while allowing local triggering for developer validation.

### 2026-05-20 07:30 PM — Pipeline Stabilization & End-to-End Success
- **Implemented Security Layer (`lib/supabase-admin.ts`)**: Introduced a secure server-side admin client using `service_role` to bypass Supabase's strict Row-Level Security (RLS) constraints for internal background pipeline tasks.
- **Refactored Testing Utility (`app/api/setup-test-data/route.ts`)**:
  - Implemented a hybrid client strategy (anon for reading public snapshots, admin client for writing data).
  - Modified data setup to consistently spawn fresh dummy audits containing a known pricing shift (e.g. `Cursor Pro` plan bumped from $20 to $25) alongside required context fields (`teamSize`, `useCase`) to satisfy the deterministic `runAudit` calculations.
  - Automatically cleaned up orphaned dummy structures from prior executions to prevent clutter.
- **Resolved Change Detection Routing Issues (`app/api/detect-changes/route.ts`)**:
  - Replaced the anonymous client leads fetch with `supabaseAdmin` to query user contact records. This resolves an silent failure where RLS blocked anon lookups and caused the pipeline to skip notifications.
- **Enabled Robust Notifications (`lib/send-pricing-emails.ts`)**:
  - Migrated email logs writing and unsubscribe status tracking to the admin client context.
  - Added multi-point execution debug loggers (`[notify:OK-x]`, `[notify:FAIL-x]`) to make deep tracing effortless.
  - Standardized sender fallbacks (`onboarding@resend.dev`) and app redirects for local development.
- **Verification**: Ran complete pipeline curl sequences and successfully confirmed:
  - Detection of changed tools: `["Cursor"]`
  - Re-calculation of impacted monthly and annual savings values.
  - Dispatching of custom transactional emails via Resend (`notifiedCount: 1`).
