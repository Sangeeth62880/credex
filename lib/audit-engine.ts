/**
 * Audit Engine — Core Logic
 *
 * Given a user's form data (team size, use case, tool subscriptions),
 * produces a defensible audit with concrete savings recommendations.
 *
 * Three checks per tool:
 *   1. Plan-fit: Is the user on a plan that doesn't match their team size?
 *   2. Price check: Are they paying more than the listed price for their plan?
 *   3. Cross-tool alternatives: Are there cheaper tools for their use case?
 */

import { PRICING_DATA, type ToolPricing, type PlanTier } from "./pricing-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecommendedAction =
  | "downgrade"
  | "switch"
  | "optimal"
  | "consider_credits";

export type ToolAudit = {
  tool: string;
  currentPlan: string;
  currentMonthlyCost: number;
  recommendation: string;
  recommendedAction: RecommendedAction;
  savings: number;
  reason: string;
};

export type AuditResult = {
  toolAudits: ToolAudit[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  auditId: string;
};

export type ToolInput = {
  name: string;
  active: boolean;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  primaryUseCase: string;
  tools: ToolInput[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findToolPricing(toolName: string): ToolPricing | undefined {
  return PRICING_DATA.find(
    (t) => t.tool.toLowerCase() === toolName.toLowerCase()
  );
}

function findPlan(
  toolPricing: ToolPricing,
  planName: string
): PlanTier | undefined {
  return toolPricing.plans.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase()
  );
}

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Check 1: Plan-fit analysis ───────────────────────────────────────────────
/**
 * Checks if the user is on a plan that doesn't match their team size.
 * e.g. Claude Team at 1-2 users → downgrade to Pro
 */
function checkPlanFit(
  tool: ToolInput,
  toolPricing: ToolPricing,
  teamSize: number
): ToolAudit | null {
  const currentPlan = findPlan(toolPricing, tool.plan);
  if (!currentPlan) return null;

  // Check if user is on a team/business plan with too few users
  if (currentPlan.minSeats && tool.seats < currentPlan.minSeats) {
    // Find the best plan for their seat count
    const betterPlan = toolPricing.plans
      .filter((p) => {
        const fitsMax = !p.maxSeats || tool.seats <= p.maxSeats;
        const fitsMin = !p.minSeats || tool.seats >= p.minSeats;
        return fitsMax && fitsMin && p.pricePerUser < currentPlan.pricePerUser;
      })
      .sort((a, b) => b.pricePerUser - a.pricePerUser)[0]; // highest price that's still cheaper

    if (betterPlan) {
      const currentCost = currentPlan.pricePerUser * tool.seats;
      const newCost = betterPlan.pricePerUser * tool.seats;
      const savings = currentCost - newCost;

      if (savings > 0) {
        return {
          tool: tool.name,
          currentPlan: tool.plan,
          currentMonthlyCost: tool.monthlySpend,
          recommendation: `Downgrade to ${betterPlan.name} plan`,
          recommendedAction: "downgrade",
          savings: Math.min(savings, tool.monthlySpend), // can't save more than you spend
          reason: `With only ${tool.seats} seat(s), the ${betterPlan.name} plan ($${betterPlan.pricePerUser}/user) covers your needs — no need for ${currentPlan.name} ($${currentPlan.pricePerUser}/user).`,
        };
      }
    }
  }

  // Check if user is on an individual plan but has too many seats
  if (currentPlan.maxSeats && tool.seats > currentPlan.maxSeats) {
    const betterPlan = toolPricing.plans.find(
      (p) =>
        p.minSeats &&
        tool.seats >= p.minSeats &&
        p.pricePerUser > currentPlan.pricePerUser
    );
    // This is an upgrade suggestion, but may have compliance/management benefits
    // Don't flag as savings — it's actually more expensive
  }

  return null;
}

// ─── Check 2: Price check ─────────────────────────────────────────────────────
/**
 * Compares actual spend vs listed pricing to detect overpayment
 * (e.g. legacy plan pricing, billing errors)
 */
function checkPriceAccuracy(
  tool: ToolInput,
  toolPricing: ToolPricing
): ToolAudit | null {
  const currentPlan = findPlan(toolPricing, tool.plan);
  if (!currentPlan) return null;

  const expectedCost = currentPlan.pricePerUser * tool.seats;

  // If they're paying more than the listed price, flag it
  if (tool.monthlySpend > expectedCost && expectedCost > 0) {
    const overpayment = tool.monthlySpend - expectedCost;

    // Only flag meaningful overpayment (>10% or >$5)
    if (overpayment > 5 || overpayment / tool.monthlySpend > 0.1) {
      return {
        tool: tool.name,
        currentPlan: tool.plan,
        currentMonthlyCost: tool.monthlySpend,
        recommendation: `You may be overpaying — the listed price is $${expectedCost}/mo for ${tool.seats} seat(s)`,
        recommendedAction: "downgrade",
        savings: overpayment,
        reason: `${tool.name} ${currentPlan.name} should cost $${currentPlan.pricePerUser}/user × ${tool.seats} seats = $${expectedCost}/mo, but you're paying $${tool.monthlySpend}/mo. Check for legacy pricing or unused add-ons.`,
      };
    }
  }

  return null;
}

// ─── Check 3: Cross-tool alternatives ─────────────────────────────────────────
/**
 * Detects redundancy across tools for the same use case and suggests
 * cheaper alternatives.
 */
function checkCrossToolAlternatives(
  activeTools: ToolInput[],
  useCase: string
): ToolAudit[] {
  const results: ToolAudit[] = [];

  // Detect redundant LLM chat subscriptions
  const chatTools = activeTools.filter((t) =>
    ["claude", "chatgpt"].includes(t.name.toLowerCase())
  );

  if (chatTools.length > 1) {
    // Both Claude Pro + ChatGPT Plus is redundant for most use cases
    const totalSpend = chatTools.reduce((sum, t) => sum + t.monthlySpend, 0);
    const cheapest = chatTools.reduce((min, t) =>
      t.monthlySpend < min.monthlySpend ? t : min
    );
    const mostExpensive = chatTools.reduce((max, t) =>
      t.monthlySpend > max.monthlySpend ? t : max
    );

    if (mostExpensive.monthlySpend > 0) {
      results.push({
        tool: mostExpensive.name,
        currentPlan: mostExpensive.plan,
        currentMonthlyCost: mostExpensive.monthlySpend,
        recommendation: `Consider dropping ${mostExpensive.name} — you already have ${cheapest.name}`,
        recommendedAction: "switch",
        savings: mostExpensive.monthlySpend,
        reason: `Running both ${chatTools.map((t) => t.name).join(" and ")} is redundant for ${useCase}. Pick one and cancel the other to save $${mostExpensive.monthlySpend}/mo.`,
      });
    }
  }

  // Detect redundant coding tools
  const codingTools = activeTools.filter((t) =>
    ["cursor", "github copilot", "windsurf"].includes(t.name.toLowerCase())
  );

  if (codingTools.length > 1) {
    // Sort by spend, suggest dropping the most expensive redundant one
    const sorted = [...codingTools].sort(
      (a, b) => b.monthlySpend - a.monthlySpend
    );
    const expensive = sorted[0];
    const cheaper = sorted[1];

    if (expensive.monthlySpend > 0 && cheaper.monthlySpend >= 0) {
      results.push({
        tool: expensive.name,
        currentPlan: expensive.plan,
        currentMonthlyCost: expensive.monthlySpend,
        recommendation: `Consolidate to ${cheaper.name} — you have ${codingTools.length} overlapping coding assistants`,
        recommendedAction: "switch",
        savings: expensive.monthlySpend,
        reason: `${codingTools.map((t) => t.name).join(", ")} serve the same purpose. Consolidating to one tool saves $${expensive.monthlySpend}/mo.`,
      });
    }
  }

  // Coding use case: suggest Windsurf Pro ($15) as cheaper alternative to Cursor Pro ($20) or Copilot Business ($19)
  if (useCase === "coding") {
    const cursorTool = activeTools.find(
      (t) => t.name.toLowerCase() === "cursor" && t.monthlySpend >= 20
    );
    const hasWindsurf = activeTools.some(
      (t) => t.name.toLowerCase() === "windsurf"
    );

    if (cursorTool && !hasWindsurf && codingTools.length === 1) {
      const windSurfSavingsPerSeat = cursorTool.monthlySpend / cursorTool.seats - 15;
      if (windSurfSavingsPerSeat > 0) {
        results.push({
          tool: cursorTool.name,
          currentPlan: cursorTool.plan,
          currentMonthlyCost: cursorTool.monthlySpend,
          recommendation: `Consider Windsurf Pro ($15/user) as a lower-cost alternative`,
          recommendedAction: "consider_credits",
          savings: windSurfSavingsPerSeat * cursorTool.seats,
          reason: `Windsurf Pro at $15/user is $${windSurfSavingsPerSeat}/user cheaper than your current ${cursorTool.plan} plan. Evaluate if the feature set meets your team's needs.`,
        });
      }
    }
  }

  // Check if API usage could replace a subscription
  const apiTools = activeTools.filter((t) =>
    ["anthropic api", "openai api"].includes(t.name.toLowerCase())
  );
  const subscriptionCounterparts: Record<string, string> = {
    "anthropic api": "claude",
    "openai api": "chatgpt",
  };

  for (const apiTool of apiTools) {
    const counterpartName = subscriptionCounterparts[apiTool.name.toLowerCase()];
    if (!counterpartName) continue;

    const counterpart = activeTools.find(
      (t) => t.name.toLowerCase() === counterpartName
    );

    if (counterpart && counterpart.monthlySpend > 0 && apiTool.monthlySpend > 0) {
      // If they're paying for both the API AND the subscription, that might be intentional
      // but worth flagging
      results.push({
        tool: counterpart.name,
        currentPlan: counterpart.plan,
        currentMonthlyCost: counterpart.monthlySpend,
        recommendation: `You're paying for both ${counterpart.name} subscription and ${apiTool.name} — consider consolidating`,
        recommendedAction: "consider_credits",
        savings: Math.min(counterpart.monthlySpend, apiTool.monthlySpend),
        reason: `Paying for both ${counterpart.name} ($${counterpart.monthlySpend}/mo) and ${apiTool.name} ($${apiTool.monthlySpend}/mo) is often redundant. For heavy API use, the API alone may suffice; for casual use, the subscription is more cost-effective.`,
      });
    }
  }

  return results;
}

// ─── Main Audit Function ─────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const activeTools = input.tools.filter(
    (t) => t.active && t.monthlySpend > 0
  );
  const allAudits: ToolAudit[] = [];
  const processedTools = new Set<string>();

  // Run checks 1 & 2 for each active tool
  for (const tool of activeTools) {
    const toolPricing = findToolPricing(tool.name);
    if (!toolPricing) {
      // Unknown tool — mark as optimal since we can't audit it
      allAudits.push({
        tool: tool.name,
        currentPlan: tool.plan,
        currentMonthlyCost: tool.monthlySpend,
        recommendation: "No pricing data available for comparison",
        recommendedAction: "optimal",
        savings: 0,
        reason: `We don't have pricing data for ${tool.name}. This spend could not be audited.`,
      });
      continue;
    }

    // Check 1: Plan-fit
    const planFitResult = checkPlanFit(tool, toolPricing, input.teamSize);
    if (planFitResult) {
      allAudits.push(planFitResult);
      processedTools.add(tool.name);
    }

    // Check 2: Price accuracy
    const priceResult = checkPriceAccuracy(tool, toolPricing);
    if (priceResult && !processedTools.has(tool.name)) {
      allAudits.push(priceResult);
      processedTools.add(tool.name);
    }
  }

  // Check 3: Cross-tool alternatives
  const crossToolResults = checkCrossToolAlternatives(
    activeTools,
    input.primaryUseCase
  );
  for (const result of crossToolResults) {
    // Don't double-count savings for tools already flagged
    if (!processedTools.has(result.tool)) {
      allAudits.push(result);
      processedTools.add(result.tool);
    }
  }

  // For tools with no issues found, mark as optimal
  for (const tool of activeTools) {
    if (!processedTools.has(tool.name)) {
      allAudits.push({
        tool: tool.name,
        currentPlan: tool.plan,
        currentMonthlyCost: tool.monthlySpend,
        recommendation: "Your current plan looks optimal for your usage",
        recommendedAction: "optimal",
        savings: 0,
        reason: `${tool.name} ${tool.plan} at $${tool.monthlySpend}/mo is well-matched for a team of ${input.teamSize} focused on ${input.primaryUseCase}.`,
      });
    }
  }

  const totalMonthlySavings = allAudits.reduce((sum, a) => sum + a.savings, 0);

  return {
    toolAudits: allAudits,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    auditId: generateId(),
  };
}
