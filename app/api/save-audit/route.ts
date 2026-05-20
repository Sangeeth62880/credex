import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLatestPricingSnapshot } from "@/lib/pricing-snapshot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, result } = body;

    if (!input || !result) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Rate Limiting Mock (In production, use Redis/Upstash)
    // We are trusting the client for the MVP but would add rate limits here.

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Mock mode if Supabase isn't configured
      console.warn("Supabase not configured, returning mock ID");
      return NextResponse.json({ id: "mock-id-123" });
    }

    let pricingSnapshotId = null;
    try {
      const snapshot = await getLatestPricingSnapshot();
      pricingSnapshotId = snapshot?.id || null;
    } catch (e) {
      console.warn("Failed to retrieve latest pricing snapshot during insert:", e);
    }

    const { data, error } = await supabase
      .from("audits")
      .insert([
        {
          input_data: input,
          result_data: result,
          total_monthly_savings: result.totalMonthlySavings,
          pricing_snapshot_id: pricingSnapshotId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("Save audit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
