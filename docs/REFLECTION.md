# Project Reflection: AI Spend Audit Tool

## What Went Well
- **Core Engine:** The logic to compare plans and find overlap works beautifully and is easily extensible.
- **UI/UX:** Shadcn and Tailwind allowed us to build a very premium-looking interface (dark mode, glassmorphism) in a short time.
- **End-to-End Flow:** We successfully connected the React frontend to the backend API, Supabase, Groq for summaries, and Resend for emails.

## Lessons Learned
- **Pricing Data Volatility:** AI tools change pricing rapidly. Keeping `pricing-data.ts` up to date will be an ongoing operational challenge.
- **Edge Cases:** Some companies have enterprise agreements that don't match public pricing. The tool should eventually allow for custom inputs for enterprise pricing.

## Next Steps
- Promote the tool on Product Hunt and LinkedIn.
- Begin capturing leads and iterating on the sales pitch.
- Add more tools (e.g., Perplexity, Midjourney) to the audit engine.
