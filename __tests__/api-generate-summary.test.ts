/**
 * Integration Tests — /api/generate-summary
 *
 * Tests the AI summary generation route with mocked Groq API.
 */

// Mock global fetch for Groq API calls
const originalFetch = global.fetch;

import { POST } from "../app/api/generate-summary/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_INPUT = {
  tools: [{ id: "cursor", plan: "Pro", seats: 1, monthlySpend: 20 }],
  teamSize: "Small (2–5)",
  useCase: "coding",
};

const VALID_RESULT = {
  toolAudits: [
    {
      toolId: "cursor",
      toolName: "Cursor",
      currentPlan: "Pro",
      currentMonthlyCost: 20,
      recommendedAction: "already_optimal",
      estimatedMonthlyCost: 20,
      monthlySavings: 0,
      annualSavings: 0,
      reason: "Your current Pro plan is well-optimized.",
      badge: "OPTIMAL",
    },
  ],
  totalMonthlySavings: 0,
  totalAnnualSavings: 0,
  toolCount: 1,
  highSavingsThreshold: false,
  formInput: VALID_INPUT,
};

const RESULT_WITH_SAVINGS = {
  ...VALID_RESULT,
  totalMonthlySavings: 50,
  totalAnnualSavings: 600,
  toolAudits: [
    {
      ...VALID_RESULT.toolAudits[0],
      monthlySavings: 50,
      annualSavings: 600,
      recommendedAction: "downgrade",
      reason: "Downgrade to save money.",
    },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("/api/generate-summary", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  test("returns 400 when input is missing", async () => {
    const req = makeRequest({ result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing required data");
  });

  test("returns 400 when result is missing", async () => {
    const req = makeRequest({ input: VALID_INPUT });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns fallback text when GROQ_API_KEY is not set", async () => {
    delete process.env.GROQ_API_KEY;

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.summary).toBeDefined();
    expect(body.summary.length).toBeGreaterThan(0);
    // Should contain reference to team size and use case
    expect(body.summary).toContain("Small (2–5)");
    expect(body.summary).toContain("coding");
  });

  test("fallback text for zero savings mentions optimal stack", async () => {
    delete process.env.GROQ_API_KEY;

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    const body = await res.json();

    expect(body.summary).toContain("optimal");
  });

  test("fallback text for non-zero savings includes dollar amounts", async () => {
    delete process.env.GROQ_API_KEY;

    const req = makeRequest({ input: VALID_INPUT, result: RESULT_WITH_SAVINGS });
    const res = await POST(req);
    const body = await res.json();

    expect(body.summary).toContain("$50");
    expect(body.summary).toContain("$600");
  });

  test("calls Groq API when API key is set and returns AI summary", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Your team is doing great. Consider downgrading Cursor.",
            },
          },
        ],
      }),
    }) as jest.Mock;

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.summary).toBe("Your team is doing great. Consider downgrading Cursor.");

    // Verify the Groq API was called
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer gsk_test_key",
        }),
      })
    );
  });

  test("returns fallback when Groq API returns error", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key";

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => "Rate limit exceeded",
    }) as jest.Mock;

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    // Should return fallback, not error
    expect(body.summary).toBeDefined();
    expect(body.summary.length).toBeGreaterThan(0);
  });

  test("returns fallback when Groq returns empty choices", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    }) as jest.Mock;

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.summary).toBeDefined();
    expect(body.summary.length).toBeGreaterThan(0);
  });
});
