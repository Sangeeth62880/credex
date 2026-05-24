export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { type AuditResult, type FormInput } from "@/lib/audit-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, result } = body as {
      input: FormInput;
      result: AuditResult;
    };

    if (!input || !result) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const toolList = result.toolAudits.map((a) => a.toolName).join(", ");
    const recommendations = result.toolAudits
      .filter((a) => a.monthlySavings > 0)
      .map((a) => `${a.toolName}: ${a.reason}`)
      .join("; ");

    // Determine fallback text
    let fallbackText = "";
    if (result.totalMonthlySavings > 0) {
      const topAudit = [...result.toolAudits].sort(
        (a, b) => b.monthlySavings - a.monthlySavings
      )[0];
      fallbackText = `Based on your team size of ${input.teamSize} focused on ${
        input.useCase
      }, we analyzed your usage of ${toolList}. ${
        topAudit?.reason || "There are significant optimizations available."
      } Making this change alone could save you $${
        topAudit?.monthlySavings || 0
      }/month. Overall, we found $${
        result.totalMonthlySavings
      }/month in potential savings across your AI tool stack — that's $${
        result.totalAnnualSavings
      }/year. We recommend starting with your highest-impact change and reviewing your subscriptions quarterly as pricing evolves.`;
    } else {
      fallbackText = `Based on your team size of ${input.teamSize} focused on ${input.useCase}, we analyzed your usage of ${toolList}. You are currently running an optimal stack with no obvious redundancies or overpriced plans. Great job keeping your AI costs efficient!`;
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If no API key is present or we are offline, just return the fallback.
    if (!apiKey) {
      return NextResponse.json({ summary: fallbackText });
    }

    const prompt = `You are an AI spend advisor. A startup has completed an AI tool audit.

Here is their audit data:
- Team size: ${input.teamSize}
- Primary use case: ${input.useCase}
- Tools they use: ${toolList}
- Total potential monthly savings: $${result.totalMonthlySavings}
- Key recommendations: ${recommendations}

Write a 100-word personalized summary paragraph that:
1. Acknowledges their specific use case and stack
2. Highlights the most impactful change they can make
3. Gives one concrete next step
4. Ends with an encouraging but realistic note

Be direct, not salesy. Speak like a knowledgeable peer, not a vendor. Return ONLY the paragraph text without any markdown or conversational filler.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Standard fast Llama 3.1 model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error("Groq API error", await res.text());
      return NextResponse.json({ summary: fallbackText });
    }

    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json({ summary: fallbackText });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    // Return a generic error message, or fallback if preferred.
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
