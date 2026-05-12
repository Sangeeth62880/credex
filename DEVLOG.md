# Devlog - AI Spend Audit Tool

## Day 1 — 2026-05-06
**Hours worked:** 6
**What I did:** Scaffolding, landing page, and the core spend input form. Built the basic design system using CSS variables for a "premium" dark aesthetic.
**What I learned:** Next.js 14 App Router layout nesting is powerful for state management across routes if handled via Context.
**Blockers / what I'm stuck on:** Network restrictions prevented `create-next-app`, so I had to manually configure `tsconfig.json` and `tailwind.config.ts`.
**Plan for tomorrow:** Compile pricing data and build the first version of the deterministic Audit Engine.

## Day 2 — 2026-05-07
**Hours worked:** 8
**What I did:** Compiled `PRICING_DATA.md` for 8 tools. Built `audit-engine.ts` with plan-fit and redundancy logic. Wrote the first 8 unit tests.
**What I learned:** Redundancy detection (e.g., Cursor vs Copilot) requires a "source of truth" use-case mapping.
**Blockers / what I'm stuck on:** Handling "pay-per-use" API pricing alongside fixed monthly subscriptions in a single interface.
**Plan for tomorrow:** Integrate Groq API for AI-generated summaries and add polish with Framer Motion.

## Day 3 — 2026-05-08
**Hours worked:** 5
**What I did:** Connected Groq API (Llama 3 70B) for strategic summaries. Implemented a robust fallback system for when the API is down. Added animations.
**What I learned:** Prompt engineering for financial advice requires strict constraints to avoid hallucinations about "imaginary" savings.
**Blockers / what I'm stuck on:** Framer Motion layout transitions causing layout shifts on the results page.
**Plan for tomorrow:** Set up Supabase for persistence and Resend for lead capture.

## Day 4 — 2026-05-09
**Hours worked:** 7
**What I did:** Integrated Supabase for storing audits. Built unique shareable URL logic. Connected Resend to trigger emails for high-value leads.
**What I learned:** Vercel serverless functions have a 10s timeout on the hobby tier, so the AI summary needs to be fast (hence Groq).
**Blockers / what I'm stuck on:** Supabase authentication vs. public access for "shareable" audit IDs.
**Plan for tomorrow:** Take a day off to recharge before the final push.

## Day 5 — 2026-05-10
**Hours worked:** 0
**What I did:** Day off. Took a break to avoid burnout and look at the UI with fresh eyes.
**What I learned:** Stepping away helps spot obvious UX flaws (like the missing "Back" button on Step 2).
**Blockers / what I'm stuck on:** N/A.
**Plan for tomorrow:** Build the "Bonus" features: Benchmark Mode and PDF Export.

## Day 6 — 2026-05-11
**Hours worked:** 9
**What I did:** Implemented Benchmark Mode (spend-per-dev), PDF Export (print styles), and the Referral Code system. Refactored layout for the Embeddable Widget.
**What I learned:** `@media print` is still the most reliable way to generate high-fidelity PDFs from a complex React UI.
**Blockers / what I'm stuck on:** Getting the benchmark averages right for different company sizes without sounding discouraging.
**Plan for tomorrow:** Final documentation sweep, marketing strategy, and production build verification.

## Day 7 — 2026-05-12
**Hours worked:** 10
**What I did:** Created all entrepreneurial files (GTM, Economics, Metrics). Wrote `REFLECTION.md` and `ARCHITECTURE.md`. Captured final screenshots. Fixed a `ReferenceError` with the Geist font.
**What I learned:** The "GTM" part of the project is just as complex as the engineering; distribution is the real bottleneck for lead-gen tools.
**Blockers / what I'm stuck on:** Disk space issues on the local dev machine forced a temporary pause to clear cache.
**Status:** **MVP Complete.** All bonus features integrated. Green checks on CI.
