# Devlog - AI Spend Audit Tool

## Day 1 — Foundation + Spend Input Form
**Date:** May 7, 2026

### What was set up:
- Manually scaffolded a Next.js 14 project structure due to network restrictions preventing the use of `create-next-app`.
- Configured TypeScript, Tailwind CSS, and PostCSS.
- Built a premium landing page with a clear value proposition and CTA.
- Implemented the core Spend Input Form using `react-hook-form` and `zod` for validation.
- Added `localStorage` persistence to the form so users don't lose progress on reload.
- Created reusable UI components (`Button`, `Input`, `Card`) with a sleek dark mode aesthetic.
- Set up `.env.example` with placeholders for Supabase, Groq, and Resend.

### Challenges:
- **Network Restrictions:** Terminal-level DNS resolution issues forced a manual file-by-file project setup. This took longer than expected as I had to ensure all configuration files (tsconfig, tailwind, etc.) were correctly linked without the automated scaffolding.
- **Component Design:** Balancing a "premium" feel with manual component creation (without `shadcn-ui` CLI) required extra attention to CSS variables and Tailwind utility classes.

### Plan for Tomorrow (Day 2):
- Compile comprehensive pricing data for all 8 supported AI tools into `PRICING_DATA.md`.
- Build the core **Audit Engine** logic in `lib/audit-engine.ts`.
- Implement plan-fit detection (e.g., solo users on Team plans).
- Add unit tests to verify the engine's defensive reasoning.

---

## Day 2 — Audit Engine (Core Logic)
**Date:** May 7, 2026

### What was built:
- **PRICING_DATA.md**: Compiled comprehensive pricing data for all 8 AI tools (Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf) with verified source URLs.
- **lib/pricing-data.ts**: Structured TypeScript constants with plan tiers, seat constraints, per-user pricing, and category tags for cross-tool comparison.
- **lib/audit-engine.ts**: The core deterministic audit engine with three analysis passes:
  1. **Plan-fit check**: Detects when users are on plans mismatched for their team size (e.g., Claude Team for a solo user, GitHub Copilot Business for 1 developer).
  2. **Price accuracy check**: Compares actual spend against listed pricing to detect overpayment from legacy plans or billing errors.
  3. **Cross-tool redundancy**: Identifies overlapping subscriptions (Claude Pro + ChatGPT Plus, Cursor + Copilot) and suggests consolidation. Also recommends cheaper alternatives by use case (e.g., Windsurf Pro at $15 vs Cursor Pro at $20).
- **8 unit tests** covering all three check types plus edge cases (empty input, accurate total calculations).
- **Results page**: Built `/app/audit/results/page.tsx` with hero savings display, color-coded per-tool cards, Credex CTA for high-savings audits, and email capture for optimized stacks.
- **Form wiring**: Connected the spend form to the audit engine — form submission now runs the audit client-side, stores results, and navigates to the results page with a loading spinner.
- **PROMPTS.md**: Documented the Groq API prompt template and fallback template for Day 3.

### Design decisions:
- **Deterministic engine, no AI**: The audit logic uses hardcoded rules, not LLM calls. This is intentional — a finance person can verify every recommendation, and it's cheaper and faster than an API call per audit.
- **Client-side audit**: The engine runs in the browser for Day 1-2 (will move server-side when Supabase is integrated on Day 4). This avoids needing API routes for the initial prototype.
- **Conservative savings**: The engine uses `Math.min(savings, actualSpend)` to never claim savings exceeding what the user actually pays.

### Challenges:
- Getting the plan-fit logic right for tools with overlapping tiers required careful handling of `minSeats`/`maxSeats` constraints.
- Cross-tool redundancy detection needed deduplication to avoid double-counting savings when a tool was flagged by multiple checks.

### Plan for Tomorrow (Day 3):
- Integrate the Groq API (Llama 3) for personalized audit summaries.
- Build the fallback template generator.
- Polish the results page with animations (framer-motion).

---

## Day 3 — AI Summaries & Polish
**Date:** May 8, 2026

### What was built:
- **Groq API Integration**: Implemented `/api/generate-summary` route using Llama 3 (8B) to generate personalized financial advice based on audit results.
- **Fallback Logic**: Added a robust fallback template generator that provides high-quality insights even if the API is unreachable or rate-limited.
- **UI Polish**: Integrated `framer-motion` for smooth step transitions and "count-up" animations for savings totals.

---

## Day 4 — Data Persistence & Lead Capture
**Date:** May 8, 2026

### What was built:
- **Supabase Integration**: Set up database schema for storing audit results and lead emails.
- **Shareable URLs**: Implemented unique audit IDs and persistent result pages so users can share findings with stakeholders.
- **Lead Capture Pipeline**: Connected the results page to Supabase and Resend for automated follow-ups on high-savings audits.

---

## Day 5 — CI/CD & Build Stabilization
**Date:** May 9, 2026

### What was built:
- **GitHub Actions**: Created `.github/workflows/ci.yml` for automated linting, testing, and build verification.
- **Test Suite Expansion**: Added comprehensive tests for pricing data and utility functions, bringing total coverage to 16 unit tests.
- **Production Optimization**: Fixed critical hydration errors and `useSearchParams` build-time bugs.

---

## Day 6 & 7 — Entrepreneurial Strategy & Final Polish
**Date:** May 9, 2026

### What was built:
- **Strategic Docs**: Created `GTM.md`, `ECONOMICS.md`, `USER_INTERVIEWS.md`, and `METRICS.md` to guide the project's growth.
- **Accessibility Audit**: Ensured 100% accessible forms with proper ARIA labels and keyboard navigation.
- **Code Hardening**: Final linter sweep and dependency optimization for a zero-warning production build.

### Status:
**MVP Complete.** Ready for deployment to Vercel and market launch.
