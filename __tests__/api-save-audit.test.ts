/**
 * Integration Tests — /api/save-audit
 *
 * Tests the save-audit API route handler with mocked Supabase.
 */

// Mock Supabase before importing the route handler
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        insert: (...insertArgs: any[]) => {
          mockInsert(...insertArgs);
          return {
            select: (...selectArgs: any[]) => {
              mockSelect(...selectArgs);
              return {
                single: () => mockSingle(),
              };
            },
          };
        },
      };
    },
  },
}));

import { POST } from "../app/api/save-audit/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/save-audit", {
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
      reason: "Your current Pro plan for Cursor is well-optimized.",
      badge: "OPTIMAL",
    },
  ],
  totalMonthlySavings: 0,
  totalAnnualSavings: 0,
  toolCount: 1,
  highSavingsThreshold: false,
  formInput: VALID_INPUT,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("/api/save-audit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
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
    const body = await res.json();
    expect(body.error).toBe("Missing required data");
  });

  test("returns 400 when body is empty", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns mock ID when Supabase is not configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("mock-id-123");
  });

  test("inserts into 'audits' table with correct data shape", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "uuid-abc-123" },
      error: null,
    });

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);

    expect(mockFrom).toHaveBeenCalledWith("audits");
    expect(mockInsert).toHaveBeenCalledWith([
      {
        input_data: VALID_INPUT,
        result_data: VALID_RESULT,
        total_monthly_savings: VALID_RESULT.totalMonthlySavings,
        pricing_snapshot_id: "00000000-0000-0000-0000-000000000000",
      },
    ]);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("uuid-abc-123");
  });

  test("returns 500 when Supabase insert fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: "42P01", message: "Table not found" },
    });

    const req = makeRequest({ input: VALID_INPUT, result: VALID_RESULT });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to save audit");
  });
});
