# Round 2 PR — Persistent Re-Audit System

## What this PR does

Extends the AI spend auditor with a persistent re-audit system. Every audit
now saves a snapshot of the pricing data used at the time. A detection job
identifies when pricing changes invalidate stored audits and sends a
consolidated email per user linking to a diff view showing old vs new
recommendations side by side.

## Why

AI tool pricing changes constantly — Cursor, Claude, and Copilot have all
changed tiers in the last 18 months. A one-time audit decays. This feature
makes the tool's value persistent: users get notified the moment their audit
becomes stale, and can see exactly what changed and why with one click.

Assumption: users have captured email via Round 1 lead capture. Audits with
no associated email are silently skipped in detection.

## How it works

Data flow:
1. User submits audit → POST /api/audit saves result + current pricing_snapshot_id
2. GitHub Actions runs daily at 09:00 UTC → POST /api/detect-changes (Bearer auth)
3. Detection engine fetches all audits, diffs their snapshot data vs current PRICING
4. Affected users get one consolidated email (not one per audit)
5. Email contains change summary + link to /audit/[id]/diff
6. Diff page renders before/after per tool with savings delta headline
7. Page load fires POST /api/track-reaudit-click for admin analytics

Code locations:
- Detection: lib/detect-pricing-changes.ts
- Emails: lib/send-pricing-emails.ts
- Diff data: lib/get-audit-diff.ts
- API trigger: app/api/detect-changes/route.ts
- Diff UI: app/audit/[id]/diff/page.tsx + diff-client.tsx
- Unsubscribe: app/api/unsubscribe/route.ts
- Admin: app/admin/page.tsx
- Schedule: .github/workflows/pricing-check.yml

New DB tables: pricing_snapshots, unsubscribes, notification_log
Modified: audits table (pricing_snapshot_id, reaudit_count columns)

## What I cut

- Real-time price scraping: detection compares JSON snapshots, not live
  vendor page scraping. Scraping is fragile; admin endpoint makes manual
  updates trivial. Right call for a 36h window.

- Unsubscribe in Round 1 confirmation emails: only added to new pricing
  change emails. Retroactive addition to existing emails not worth the time.

- Audit versioning: re-runs compute fresh results from stored form_data on
  demand rather than storing each re-run as a new row. Simpler, acceptable
  for this scope.

- Auth on /admin: HTTP Basic via middleware. Not production-grade but
  appropriate for an internal tool in 36 hours.

- "Save this re-audit" button on diff page: scoped out in favour of the
  re-run CTA which sends users back through the full fresh flow.

## How to test it manually

1. Submit an audit at / with Cursor Pro, 2 seats, $40/mo
2. Capture email in the lead modal
3. Temporarily edit lib/pricing-data.ts: change Cursor Pro pricePerSeat
   from 20 to 25, update PRICING_VERSION to today's date, redeploy
4. Trigger detection:
   ```
   curl -X POST https://[your-url]/api/detect-changes \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
5. Check inbox — pricing change email should arrive
6. Click "See updated audit →" in the email
7. Verify /audit/[id]/diff shows Before vs Now columns
8. Check /admin for updated click-through stats

## What's tested

Added:
- Existing audit engine tests still pass (no regression)
- lib/detect-pricing-changes.ts: diffPricingData and isAuditAffected unit tests

Skipped (would do next):
- Full email integration test (requires Resend sandbox)
- Playwright E2E for the diff page render
- Rate limiting on detect-changes endpoint

## Open questions / risks

- Email volume: Resend free tier caps at 100 emails/day. A pricing change
  affecting many users could hit this before we upgrade. Needs monitoring.

- Pre-Round-2 audits: audits created before this PR have no pricing_snapshot_id
  and are silently skipped by detection. Users from Round 1 won't receive
  notifications until they re-run. Acceptable — documented here.

- Detection false negatives: if a price changes and reverts before the daily
  cron fires, the change is missed entirely. A changelog approach would solve
  this but was out of scope for 36 hours.
