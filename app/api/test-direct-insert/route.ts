import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Create a dummy audit first to ensure we have a valid foreign key target
    console.log("Testing direct audit insert...");
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert([
        {
          input_data: { tools: [{ id: "cursor", plan: "pro", monthlySpend: 100 }] },
          result_data: { totalMonthlySavings: 20 },
          total_monthly_savings: 20,
        },
      ])
      .select()
      .single();

    if (auditError) {
      console.error("Direct audit insert error:", auditError);
      return NextResponse.json({
        success: false,
        stage: "audit_insert",
        error: auditError,
      });
    }

    console.log("Dummy audit created:", audit.id);

    // 2. Try inserting a lead for this audit
    console.log("Testing direct lead insert...");
    const testEmail = `test_${Date.now()}@gmail.com`;
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert([
        {
          email: testEmail,
          audit_id: audit.id,
        },
      ])
      .select();

    if (leadError) {
      console.error("Direct lead insert error:", leadError);
      return NextResponse.json({
        success: false,
        stage: "lead_insert",
        error: leadError,
        auditIdCreated: audit.id,
      });
    }

    console.log("Direct lead insert succeeded!");

    // 3. Try to query the inserted lead
    console.log("Testing direct lead query...");
    const { data: queriedLeads, error: queryError } = await supabase
      .from("leads")
      .select("*")
      .eq("email", testEmail);

    return NextResponse.json({
      success: true,
      auditInserted: audit,
      leadInserted: lead,
      queriedLeads: queriedLeads,
      queryError: queryError,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
