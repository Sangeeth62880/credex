/**
 * Integration Tests — /api/get-audit
 *
 * Tests the get-audit API route handler with mocked Supabase.
 */

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: (...selectArgs: any[]) => {
          mockSelect(...selectArgs);
          return {
            eq: (...eqArgs: any[]) => {
              mockEq(...eqArgs);
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

import { GET } from "../app/api/get-audit/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(id?: string): Request {
  const url = id
    ? `http://localhost:3000/api/get-audit?id=${id}`
    : "http://localhost:3000/api/get-audit";
  return new Request(url, { method: "GET" });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("/api/get-audit", () => {
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

  test("returns 400 when id is missing", async () => {
    const req = makeRequest();
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing audit ID");
  });

  test("returns 500 when Supabase is not configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    const req = makeRequest("test-id");
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Supabase not configured");
  });

  test("returns audit data when found", async () => {
    const mockData = {
      input_data: { tools: [], teamSize: "1", useCase: "coding" },
      result_data: { totalMonthlySavings: 50, toolAudits: [] },
      created_at: "2026-05-10T12:00:00Z",
    };

    mockSingle.mockResolvedValue({ data: mockData, error: null });

    const req = makeRequest("uuid-123");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.input).toEqual(mockData.input_data);
    expect(body.result).toEqual(mockData.result_data);
    expect(body.createdAt).toBe(mockData.created_at);

    expect(mockFrom).toHaveBeenCalledWith("audits");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "uuid-123");
  });

  test("returns 404 when audit is not found", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });

    const req = makeRequest("nonexistent-id");
    const res = await GET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Audit not found");
  });
});
