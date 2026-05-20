import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: audits, error: auditError } = await supabase
      .from("audits")
      .select("id, created_at, pricing_snapshot_id")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: leads, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: snapshots, error: snapError } = await supabase
      .from("pricing_snapshots")
      .select("id, version, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      audits,
      auditError,
      leads,
      leadError,
      snapshots,
      snapError,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
