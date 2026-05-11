/**
 * Integration Tests — /api/capture-lead
 *
 * Tests the lead capture API route handler with mocked Supabase and Resend.
 */

// Mock Supabase
const mockLeadInsert = jest.fn();
const mockLeadFrom = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: any[]) => {
      mockLeadFrom(...args);
      return {
        insert: (...insertArgs: any[]) => {
          mockLeadInsert(...insertArgs);
          return mockLeadInsert();
        },
      };
    },
  },
}));

// Mock Resend
const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: (...args: any[]) => mockSend(...args),
    },
  })),
}));

import { POST } from "../app/api/capture-lead/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/capture-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("/api/capture-lead", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
      RESEND_API_KEY: "re_test_key",
    };
    // Default mock responses
    mockLeadInsert.mockResolvedValue({ error: null });
    mockSend.mockResolvedValue({ error: null });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("returns 400 when email is missing", async () => {
    const req = makeRequest({ auditId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email is required");
  });

  test("returns success with mock=true when services not configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    delete process.env.RESEND_API_KEY;

    const req = makeRequest({ email: "test@example.com", auditId: "test-id" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.mock).toBe(true);
  });

  test("inserts lead into 'leads' table with correct data", async () => {
    const req = makeRequest({ email: "user@company.com", auditId: "uuid-123" });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockLeadFrom).toHaveBeenCalledWith("leads");
    expect(mockLeadInsert).toHaveBeenCalledWith([
      { email: "user@company.com", audit_id: "uuid-123" },
    ]);
  });

  test("sends email via Resend with correct shape", async () => {
    const req = makeRequest({ email: "user@company.com", auditId: "uuid-123" });
    await POST(req);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["user@company.com"],
        subject: "Your AI Spend Audit Results",
      })
    );
  });

  test("email body contains the audit link when auditId is provided", async () => {
    const req = makeRequest({ email: "user@company.com", auditId: "uuid-123" });
    await POST(req);

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("uuid-123");
    expect(callArgs.html).toContain("Your Audit Link");
  });

  test("returns 500 when Resend email send fails", async () => {
    mockSend.mockResolvedValue({ error: { message: "Invalid API key" } });

    const req = makeRequest({ email: "user@company.com", auditId: "test" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to send email");
  });

  test("ignores duplicate email (unique constraint violation)", async () => {
    mockLeadInsert.mockResolvedValue({ error: { code: "23505", message: "duplicate" } });

    const req = makeRequest({ email: "existing@company.com", auditId: "test" });
    const res = await POST(req);
    // Should still succeed (ignores unique violation)
    expect(res.status).toBe(200);
  });
});
