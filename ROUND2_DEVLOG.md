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

### 2026-05-20 08:30 PM — UI/UX Redesign & Brand Integration
- **Scraped and Extracted Brand Identity**: Scraped `https://credex.rocks/` with Firecrawl and extracted its design language: light-mode theme, PP Mori typography fallbacks, `#ADFBDB` primary mint color, `#0FF395` neon green accent, `#086841` forest green positive semantic accents, and deep navy-slate (`#19363F`) primary text.
- **Theme Migration & CSS Variables Overhaul (`app/globals.css`)**:
  - Re-mapped background tokens (`--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-overlay`) to a stunning light glassmorphic palette.
  - Set text and border tokens to deep slate and mint-slate boundaries.
  - Replaced semantic status colors to match the extracted deep green and neon-emerald accents.
  - Updated the `.savings-gradient` and `.hero-glow` gradient utility variables to seamlessly blend from `#086841` to `#0FF395`.
- **Navbar Redesign & Logo Integration (`components/navbar.tsx`)**:
  - Integrated the official SVG brand emblem from `credex.rocks` inline as the brand logo with responsive stroke rendering.
  - Styled with high-contrast text layers and optimized alignment.
- **Partner Slider Optimization (`app/page.tsx`)**:
  - De-inverted partner logos to render in a clean, professional dark-gray/slate contrast color scheme matching standard industry practices for premium light-theme marketing headers.
- **Validation**:
  - Verified and validated component compatibility across all stages.

### 2026-05-20 09:15 PM — Flat Design Reversion & High Contrast Theme
- **Reverted Neumorphic UI**: Stripped out the experimental neumorphic soft-shadows and utility classes to resolve widespread readability and contrast issues.
- **High-Contrast Slate/Emerald Theme**: Remapped the CSS variables in `app/globals.css` to a crisp, high-contrast flat design. Implemented Slate background depths (`#F8FAFC`, `#F1F5F9`) and distinct Emerald (`#059669`) accents with near-black primary text (`#0F172A`) ensuring accessibility and strict component boundaries.
- **External Tool Logos**: Migrated the core `lib/tools-config.ts` data definitions to load high-quality external tool logos from `icons8.com` (ChatGPT, Windsurf, Cursor, Claude).
- **Next.js Image Host Configuration**: Updated `next.config.mjs` to whitelist `img.icons8.com` via `remotePatterns` to safely support external `next/image` domain fetches across the Audit tool selection page.

### 2026-05-20 10:00 PM — De-AI-fication & Premium SaaS Polish
- **Dark Icons for High Contrast**: Replaced white/light SVG logos for GitHub and Gemini with high-contrast, premium filled/line dark icons from `icons8.com` in both `lib/tools-config.ts` and `app/page.tsx`'s InfiniteSlider, ensuring full visibility on the light Slate-50 background.
- **Removed Pulsing AI Badges**: Reworked the hero capsule badge on the homepage by removing the generic "generative AI" pulsing green dot (`animate-pulse`) and monospace uppercase layout. Replaced it with a sleek, minimalist, non-pulsing title-case border badge in line with high-end SaaS designs (e.g. Stripe, Linear).
- **Background Simplification**: Reworked the background by replacing the generic neon-green mesh grid and repeating diagonal stripe patterns with a highly elegant, crisp Slate grid (`rgba(148, 163, 184, 0.12)`) at 12% opacity. Paired with soft ambient radial glows (`bg-accent/[0.04]`), it establishes a highly professional, structured editorial SaaS aesthetic.
- **Refined Text Gradients**: Transitioned the text gradient (`.savings-gradient`) from a cheap neon-green gradient to a highly sophisticated Slate-900 to Emerald-600 transition.
- **Eliminated Glow Shadows**: Removed all futuristic neon-green shadows (`shadow-[0_0_30px_...]` and `shadow-[0_4px_12px_...]`) from buttons and active selector elements across the homepage and audit details page, establishing a strict, premium flat visual layout.

### 2026-05-20 10:15 PM — Test Alignment & Pipeline Certification
- **Aligned Test Assertions (`__tests__/api-save-audit.test.ts`)**: Updated `/api/save-audit` unit test expectations to account for the newly integrated database pricing snapshot seeding (`pricing_snapshot_id` mapping to the fallback UUID).
- **Certified Test Suite**: Executed the complete Jest testing suite and achieved 100% test coverage stability across all 9 test suites (80/80 tests passing successfully).

---

## Day 2 — Frontend Diff & Observability (May 21, 2026)

### 2026-05-21 09:30 AM — Day 2 start
Day 1 backend pipeline confirmed working on deployed URL. Triggered
/api/detect-changes manually with curl — returned 200 with affected count.
Today: unsubscribe flow, diff view UI, GitHub Actions schedule.
The diff view is what evaluators will actually click from the email —
spending the most time here.

### 2026-05-21 10:00 AM — Unsubscribe
Built /api/unsubscribe and /unsubscribed page. Simple upsert into
unsubscribes table with redirect. Tested the full flow — link in email
→ upsert → confirmation page. 25 minutes total.

### 2026-05-21 10:45 AM — Diff data layer
Built lib/get-audit-diff.ts. The ToolDiff status logic needed a second
pass — initially I was comparing strict equality on monthlySavings which
broke on floating point. Added a >0.50 threshold check. Cleaner.

### 2026-05-21 01:00 PM — Diff view UI
This took the longest of Day 2. The before/after card layout went through
three iterations. Settled on a two-column grid inside each card divided
by a 1px border, with the Before column at opacity-60. The savings delta
headline in DM Serif with TrendingDown/Up icons reads exactly right.
Same-tool rows rendered dimmed at opacity-50 — visible but not distracting.

### 2026-05-21 04:30 PM — GitHub Actions + push
Wrote the pricing-check workflow. Hit a YAML indentation error on the
curl step — the run block needs consistent 2-space indent or it silently
fails. Fixed after reading the Actions error log. Manual workflow_dispatch
trigger confirmed working. Pushed Day 2. End of session.

