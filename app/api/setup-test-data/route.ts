import { NextResponse } from "next/server";
// anon client — fine for reading public data (pricing_snapshots has no RLS)
import { supabase } from "@/lib/supabase";
// admin client (service_role key) — bypasses RLS for lead & audit writes
import { supabaseAdmin } from "@/lib/supabase-admin";

const TEST_EMAIL = "sps62880@gmail.com";

// Realistic dummy audit that WILL be affected by a Cursor pricing diff
const DUMMY_AUDIT_INPUT = {
  tools: [
    { id: "cursor", plan: "Pro", monthlySpend: 25, seats: 1 },
    { id: "github-copilot", plan: "Business", monthlySpend: 19, seats: 1 },
  ],
  teamSize: "Small (2–5)",
  useCase: "coding",
};

const DUMMY_AUDIT_RESULT = {
  totalMonthlySavings: 15,
  toolAudits: [
    { toolId: "cursor", currentPlan: "Pro", recommendedPlan: "Hobby", monthlySavings: 25 },
    { toolId: "github-copilot", currentPlan: "Business", recommendedPlan: "Individual", monthlySavings: 9 },
  ],
};

export async function GET() {
  try {
    console.log("Starting setup-test-data via API...");

    // ── 1. Read snapshots via anon client (no RLS on pricing_snapshots) ──────
    const { data: snapshots, error: snapError } = await supabase
      .from("pricing_snapshots")
      .select("id, version, created_at")
      .order("created_at", { ascending: false })
      .limit(2);

    if (snapError || !snapshots || snapshots.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Need at least 2 snapshots in the DB. Bump PRICING_VERSION in pricing-data.ts and restart to auto-seed.",
          details: snapError,
          snapshotsFound: snapshots?.length ?? 0,
        },
        { status: 400 }
      );
    }

    const newSnapshot = snapshots[0];
    const oldSnapshot = snapshots[1];
    console.log(`Snapshots: new=${newSnapshot.version} (${newSnapshot.id}) | old=${oldSnapshot.version} (${oldSnapshot.id})`);

    // ── 2. Always create a FRESH dummy audit pinned to the OLD snapshot ───────
    // This guarantees the audit uses Cursor Pro (which IS in the pricing diff)
    // regardless of what tools the user's real audits contain.
    console.log("Creating fresh dummy audit pinned to old snapshot...");
    const { data: newAudit, error: auditError } = await supabaseAdmin
      .from("audits")
      .insert([
        {
          input_data: DUMMY_AUDIT_INPUT,
          result_data: DUMMY_AUDIT_RESULT,
          total_monthly_savings: DUMMY_AUDIT_RESULT.totalMonthlySavings,
          pricing_snapshot_id: oldSnapshot.id,
        },
      ])
      .select()
      .single();

    if (auditError || !newAudit) {
      return NextResponse.json(
        { success: false, error: "Failed to create dummy audit.", details: auditError },
        { status: 500 }
      );
    }

    const auditId = newAudit.id;
    console.log(`Fresh dummy audit created: ${auditId}`);

    // ── 3. Upsert lead → point it at the new dummy audit ─────────────────────
    // Using supabaseAdmin to bypass RLS on the leads table.
    const { error: leadError } = await supabaseAdmin
      .from("leads")
      .upsert([{ email: TEST_EMAIL, audit_id: auditId }], { onConflict: "email" });

    if (leadError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upsert lead. Check SUPABASE_SERVICE_ROLE_KEY.",
          details: leadError,
          auditId,
        },
        { status: 500 }
      );
    }
    console.log(`Lead for ${TEST_EMAIL} now points to audit ${auditId}`);

    // ── 4. Clear dedup log so the notification can fire ───────────────────────
    const { error: deleteLogError } = await supabaseAdmin
      .from("notification_log")
      .delete()
      .eq("user_email", TEST_EMAIL)
      .eq("pricing_snapshot_id", newSnapshot.id);

    if (deleteLogError) {
      console.warn("Notification log clear failed (benign if no row exists):", deleteLogError);
    }

    // ── 5. Clean up ALL previous orphaned dummy audits (except this new one) ──
    // These are audits with no lead, using the dummy Cursor Pro input.
    await supabaseAdmin
      .from("audits")
      .delete()
      .neq("id", auditId)
      .eq("pricing_snapshot_id", oldSnapshot.id)
      .eq("total_monthly_savings", 15);

    console.log("setup-test-data complete ✓");

    return NextResponse.json({
      success: true,
      message: `Ready! Fresh dummy audit ${auditId} created & lead pinned. Now call /api/detect-changes.`,
      auditId,
      testEmail: TEST_EMAIL,
      oldSnapshot,
      newSnapshot,
    });
  } catch (err: any) {
    console.error("Exception in setup-test-data:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
