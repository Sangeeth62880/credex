import { runAudit, type FormInput, type AuditResult } from "../lib/audit-engine";

function makeInput(overrides: Partial<FormInput> = {}): FormInput {
  return {
    teamSize: "11-50",
    useCase: "coding",
    tools: [
      { id: "cursor",         plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { id: "github-copilot",  plan: "Individual", monthlySpend: 0, seats: 1 },
      { id: "claude",         plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { id: "chatgpt",        plan: "Plus",     monthlySpend: 0,  seats: 1 },
      { id: "anthropic-api",  plan: "Usage-Based", monthlySpend: 0, seats: 1 },
      { id: "openai-api",     plan: "Usage-Based", monthlySpend: 0, seats: 1 },
      { id: "gemini",         plan: "Pro",      monthlySpend: 0,  seats: 1 },
      { id: "windsurf",       plan: "Pro",      monthlySpend: 0,  seats: 1 },
    ],
    ...overrides,
  };
}

function activateTool(
  input: FormInput,
  toolId: string,
  opts: { plan?: string; spend?: number; seats?: number } = {}
): FormInput {
  return {
    ...input,
    tools: input.tools.map((t) =>
      t.id === toolId
        ? {
            ...t,
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
    let input = makeInput({ teamSize: "1" });
    input = activateTool(input, "claude", {
      plan: "Team",
      spend: 30,
      seats: 1,
    });

    const result = runAudit(input);
    const claudeAudit = result.toolAudits.find((a) => a.toolId === "claude");

    expect(claudeAudit).toBeDefined();
    expect(claudeAudit!.recommendedAction).toBe("downgrade");
    expect(claudeAudit!.monthlySavings).toBeGreaterThan(0);
    expect(claudeAudit!.reason).toContain("3+ seats");
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Cross-tool redundancy detected (Claude Pro + ChatGPT Plus)
  // ──────────────────────────────────────────────────────────────────────────
  test("detects redundant Claude + ChatGPT subscriptions", () => {
    let input = makeInput({ useCase: "writing" });
    input = activateTool(input, "claude", { plan: "Pro", spend: 20, seats: 1 });
    input = activateTool(input, "chatgpt", {
      plan: "Plus",
      spend: 20,
      seats: 1,
    });

    const result = runAudit(input);

    // At least one of them should be flagged as redundant
    const switchAudits = result.toolAudits.filter(
      (a) => a.recommendedAction === "switch_tool"
    );
    expect(switchAudits.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Already-optimal spend returns no false savings
  // ──────────────────────────────────────────────────────────────────────────
  test("returns zero savings for an already-optimal setup", () => {
    let input = makeInput({ teamSize: "1", useCase: "data" });
    input = activateTool(input, "gemini", {
      plan: "Pro",
      spend: 20,
      seats: 1,
    });

    const result = runAudit(input);
    const geminiAudit = result.toolAudits.find((a) => a.toolId === "gemini");

    expect(geminiAudit).toBeDefined();
    expect(geminiAudit!.recommendedAction).toBe("already_optimal");
    expect(geminiAudit!.monthlySavings).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Total savings calculation is accurate
  // ──────────────────────────────────────────────────────────────────────────
  test("total savings calculation is accurate", () => {
    let input = makeInput({ teamSize: "1", useCase: "coding" });
    // Claude Team for solo user → downgrade
    input = activateTool(input, "claude", {
      plan: "Team",
      spend: 30,
      seats: 1,
    });

    const result = runAudit(input);
    const calculatedTotal = result.toolAudits.reduce(
      (sum, a) => sum + a.monthlySavings,
      0
    );

    expect(result.totalMonthlySavings).toBe(calculatedTotal);
    expect(result.totalAnnualSavings).toBe(calculatedTotal * 12);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: GitHub Copilot Business flagged for small team
  // ──────────────────────────────────────────────────────────────────────────
  test("flags GitHub Copilot Business for a small team", () => {
    let input = makeInput({ teamSize: "3", useCase: "coding" });
    input = activateTool(input, "github-copilot", {
      plan: "Business",
      spend: 19 * 3,
      seats: 3,
    });

    const result = runAudit(input);
    const copilotAudit = result.toolAudits.find(
      (a) => a.toolId === "github-copilot"
    );

    expect(copilotAudit).toBeDefined();
    expect(copilotAudit!.recommendedAction).toBe("downgrade");
    expect(copilotAudit!.monthlySavings).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Detects overpayment vs listed price
  // ──────────────────────────────────────────────────────────────────────────
  test("flags Cursor Business redundancy for writing teams", () => {
    let input = makeInput({ teamSize: "2", useCase: "writing" });
    input = activateTool(input, "cursor", {
      plan: "Business",
      spend: 80,
      seats: 2,
    });

    const result = runAudit(input);
    const cursorAudit = result.toolAudits.find((a) => a.toolId === "cursor");

    expect(cursorAudit).toBeDefined();
    expect(cursorAudit!.recommendedAction).toBe("downgrade");
    expect(cursorAudit!.monthlySavings).toBe(40);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Multiple coding tools detected as redundant
  // ──────────────────────────────────────────────────────────────────────────
  test("flags redundant coding tools (Cursor + Copilot)", () => {
    let input = makeInput({ useCase: "coding" });
    input = activateTool(input, "cursor", {
      plan: "Pro",
      spend: 200,
      seats: 10,
    });
    input = activateTool(input, "github-copilot", {
      plan: "Business",
      spend: 190,
      seats: 10,
    });

    const result = runAudit(input);
    const switchAudits = result.toolAudits.filter(
      (a) => a.recommendedAction === "switch_tool"
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

    expect(result.toolAudits).toHaveLength(0); // Only active tools are returned
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });
});
