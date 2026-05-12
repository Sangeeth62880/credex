# User Interviews — Credex AI Audit

## Interview 1: A.K., CTO of a Series A Fintech Startup (35 employees)
**Context**: Reached out via a mutual connection on LinkedIn. 15-minute Zoom call.

### Direct Quotes
*   *"I actually have no idea how many Cursor seats we have. I think everyone just put it on their corporate card and filed it as 'Work Expense'."*
*   *"We use Claude for our internal RAG, but half the team still has personal Claude Pro subs. I'm definitely paying twice for the same compute."*
*   *"I don't care about saving $20. I care about the bill being 20 lines long instead of 200."*

### Surprising Moment
A.K. wasn't as excited about the "savings" as he was about the **"Audit Log."** He mentioned that his finance team yells at him every month because they can't reconcile the OpenAI API bill with the actual feature usage. He wanted a tool that didn't just save money but *explained* the spend to non-technical people.

### Design Change
I added the **AI-powered Strategic Summary** section specifically to provide "Non-Technical Explanations" that a CTO can copy-paste into an email to their CFO.

---

## Interview 2: M.S., Founder of an Early-Stage AI Agency
**Context**: Met at a local AI meetup in SF. 10-minute coffee chat.

### Direct Quotes
*   *"Windsurf is cheaper than Cursor right now, but my devs will revolt if I make them switch. Is the $5/mo saving really worth the 'dev-debt'?"*
*   *"We're burning through Anthropic credits like crazy. I didn't know there was a 'Tier 5' for pricing."*
*   *"The biggest waste is people using the ChatGPT UI when they could just use the API playground. It's like 10x cheaper for simple tasks."*

### Surprising Moment
M.S. mentioned that he actually *wants* to spend more on some tools if they are high-performing, but he lacks a **Benchmark**. He asked, "Is $600/mo a lot for a team of 10?" He didn't have a baseline for "good" vs. "bad" AI spend.

### Design Change
I implemented **Benchmark Mode** (the "Your Spend / Dev vs. Average" section) to provide that missing baseline.

---

## Interview 3: J.L., Operations Manager at a Content Agency (15 employees)
**Context**: Cold DM on X. J.L. manages subscriptions for a team of 15 writers.

### Direct Quotes
*   *"We have Claude Team because it said 'Collaboration,' but honestly we just share docs in Google Drive anyway. We probably don't need the Team features."*
*   *"I hate that every tool has a different billing cycle. I'd pay a premium just to have one 'AI Bill'."*
*   *"The 'Switch Tool' recommendation is scary. How do I know the other tool is actually as good?"*

### Surprising Moment
J.L. was very skeptical of the "Switch Tool" recommendation. She felt that switching from ChatGPT to Claude (or vice-versa) might break her team's "prompts" and cause a loss in productivity that far outweighs the $200/mo savings.

### Design Change
I updated the **Audit Card** logic to include a "Reason" field that explicitly mentions "No meaningful capability loss" or "Identical model access" to alleviate the fear of productivity drops.
