# North Star Metrics — Credex AI Audit

## The North Star Metric
**Total Identified Annual Savings (TIAS)**.

**Why?** 
This tool's value is purely financial. If we aren't finding savings, we aren't solving the problem. TIAS measures the "Value Realized" by the user. If TIAS is high, the user is wowed. If TIAS is zero, the user has an "optimized" badge, which is a different kind of value (peace of mind).

## 3 Input Metrics
1. **Audit Completion Rate (ACR)**: The % of users who start the form and reach the results page. This measures the UX efficiency of our 2-step process.
2. **Lead Capture Conversion (LCC)**: The % of "High Savings" reports that result in a consultation booking. This measures the "Revenue Potential" of the tool.
3. **Report Share Rate (RSR)**: The % of users who click "Share" or "Export PDF." This measures the "Stakeholder Value"—how often the tool is used as a formal document for internal decision-making.

## Initial Instrumentation
We will first instrument **ACR per Step**. 
*   **Drop-off at Step 1 (Tools)**: Indicates the tool list is too long or confusing.
*   **Drop-off at Step 2 (Details)**: Indicates the team size/use-case questions are too intrusive.

## Pivot Trigger
If **TIAS per Audit drops below $500** for more than 30 consecutive days, we will pivot. 
**Reasoning**: If we aren't finding at least $500/year in savings, the "pain" isn't high enough for a VP of Eng to care. We would pivot the tool to focus on **"AI Performance Benchmarking"** (Which tool is fastest/smartest for your use case?) rather than pure cost optimization.
