import { runAudit, type AuditInput, type AuditResult } from "../lib/audit-engine";

function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    teamSize: 10,
    primaryUseCase: "coding",
    tools: [
      { name: "Cursor",         active: false, plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { name: "GitHub Copilot",  active: false, plan: "Individual", monthlySpend: 0, seats: 1 },
      { name: "Claude",         active: false, plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { name: "ChatGPT",        active: false, plan: "Plus",     monthlySpend: 0,  seats: 1 },
      { name: "Anthropic API",  active: false, plan: "Usage-Based", monthlySpend: 0, seats: 1 },
      { name: "OpenAI API",     active: false, plan: "Usage-Based", monthlySpend: 0, seats: 1 },
      { name: "Gemini",         active: false, plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { name: "Windsurf",       active: false, plan: "Pro",      monthlySpend: 0,  seats: 1 },
    ],
    ...overrides,
  };
}

function activateTool(
  input: AuditInput,
  toolName: string,
  opts: { plan?: string; spend?: number; seats?: number } = {}
): AuditInput {
  return {
    ...input,
    tools: input.tools.map((t) =>
      t.name === toolName
        ? {
            ...t,
            active: true,
            plan: opts.plan ?? t.plan,
            monthlySpend: opts.spend ?? 20,
            seats: opts.seats ?? t.seats,
          }
        : t
    ),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST 1: Team plan flagged as overspend for solo user
// ──────────────────────────────────────────────────────────────────────────────
describe("Audit Engine", () => {
  test("flags team plan for a solo user as overspend", () => {
    let input = makeInput({ teamSize: 1 });
    input = activateTool(input, "Claude", {
      plan: "Team",
      spend: 30,
      seats: 1,
    });

    const result = runAudit(input);
    const claudeAudit = result.toolAudits.find((a) => a.tool === "Claude");

    expect(claudeAudit).toBeDefined();
    expect(claudeAudit!.recommendedAction).toBe("downgrade");
    expect(claudeAudit!.savings).toBeGreaterThan(0);
    expect(claudeAudit!.reason).toContain("1 seat");
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Cross-tool redundancy detected (Claude Pro + ChatGPT Plus)
  // ──────────────────────────────────────────────────────────────────────────
  test("detects redundant Claude + ChatGPT subscriptions", () => {
    let input = makeInput({ primaryUseCase: "writing" });
    input = activateTool(input, "Claude", { plan: "Pro", spend: 20, seats: 1 });
    input = activateTool(input, "ChatGPT", {
      plan: "Plus",
      spend: 20,
      seats: 1,
    });

    const result = runAudit(input);

    // At least one of them should be flagged as redundant
    const switchAudits = result.toolAudits.filter(
      (a) => a.recommendedAction === "switch"
    );
    expect(switchAudits.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Already-optimal spend returns no false savings
  // ──────────────────────────────────────────────────────────────────────────
  test("returns zero savings for an already-optimal setup", () => {
    let input = makeInput({ teamSize: 1 });
    input = activateTool(input, "Cursor", {
      plan: "Pro",
      spend: 20,
      seats: 1,
    });

    const result = runAudit(input);
    const cursorAudit = result.toolAudits.find((a) => a.tool === "Cursor");

    expect(cursorAudit).toBeDefined();
    expect(cursorAudit!.recommendedAction).toBe("optimal");
    expect(cursorAudit!.savings).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Total savings calculation is accurate
  // ──────────────────────────────────────────────────────────────────────────
  test("total savings calculation is accurate", () => {
    let input = makeInput({ teamSize: 1, primaryUseCase: "coding" });
    // Claude Team for solo user → downgrade
    input = activateTool(input, "Claude", {
      plan: "Team",
      spend: 30,
      seats: 1,
    });

    const result = runAudit(input);
    const calculatedTotal = result.toolAudits.reduce(
      (sum, a) => sum + a.savings,
      0
    );

    expect(result.totalMonthlySavings).toBe(calculatedTotal);
    expect(result.totalAnnualSavings).toBe(calculatedTotal * 12);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: GitHub Copilot Business flagged for small team
  // ──────────────────────────────────────────────────────────────────────────
  test("flags GitHub Copilot Business for a solo developer", () => {
    let input = makeInput({ teamSize: 1 });
    input = activateTool(input, "GitHub Copilot", {
      plan: "Business",
      spend: 19,
      seats: 1,
    });

    const result = runAudit(input);
    const copilotAudit = result.toolAudits.find(
      (a) => a.tool === "GitHub Copilot"
    );

    expect(copilotAudit).toBeDefined();
    expect(copilotAudit!.recommendedAction).toBe("downgrade");
    expect(copilotAudit!.savings).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Detects overpayment vs listed price
  // ──────────────────────────────────────────────────────────────────────────
  test("flags overpayment when actual spend exceeds listed price", () => {
    let input = makeInput({ teamSize: 5 });
    // Cursor Pro is $20/user. 5 seats should be $100. Spending $150 → $50 overpay
    input = activateTool(input, "Cursor", {
      plan: "Pro",
      spend: 150,
      seats: 5,
    });

    const result = runAudit(input);
    const cursorAudit = result.toolAudits.find((a) => a.tool === "Cursor");

    expect(cursorAudit).toBeDefined();
    expect(cursorAudit!.savings).toBe(50);
    expect(cursorAudit!.reason).toContain("legacy pricing");
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Multiple coding tools detected as redundant
  // ──────────────────────────────────────────────────────────────────────────
  test("flags redundant coding tools (Cursor + Copilot)", () => {
    let input = makeInput({ primaryUseCase: "coding" });
    input = activateTool(input, "Cursor", {
      plan: "Pro",
      spend: 200,
      seats: 10,
    });
    input = activateTool(input, "GitHub Copilot", {
      plan: "Business",
      spend: 190,
      seats: 10,
    });

    const result = runAudit(input);
    const switchAudits = result.toolAudits.filter(
      (a) => a.recommendedAction === "switch"
    );

    expect(switchAudits.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Empty/no active tools returns empty audit
  // ──────────────────────────────────────────────────────────────────────────
  test("returns empty audit when no tools are active", () => {
    const input = makeInput();
    const result = runAudit(input);

    expect(result.toolAudits).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
    expect(result.auditId).toBeTruthy();
  });
});
