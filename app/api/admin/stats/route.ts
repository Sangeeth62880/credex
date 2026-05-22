import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const sessionCookie = cookies().get("credex_admin_session");

  if (!sessionCookie || sessionCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Total audits
    const { count: totalAudits } = await supabaseAdmin
      .from("audits")
      .select("*", { count: "exact", head: true });

    // Total leads (emails captured)
    const { count: totalLeads } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Emails sent (notifications)
    const { count: emailsSent } = await supabaseAdmin
      .from("notification_log")
      .select("*", { count: "exact", head: true })
      .eq("email_sent", true);

    // Click-throughs
    const { count: clickThroughs } = await supabaseAdmin
      .from("notification_log")
      .select("*", { count: "exact", head: true })
      .not("reaudit_clicked_at", "is", null);

    // Unsubscribes
    const { count: unsubscribes } = await supabaseAdmin
      .from("unsubscribes")
      .select("*", { count: "exact", head: true });

    // Recent snapshots
    const { data: recentSnapshots } = await supabaseAdmin
      .from("pricing_snapshots")
      .select("id, version, created_at, notes")
      .order("created_at", { ascending: false })
      .limit(10);

    const sent = emailsSent || 0;
    const clicks = clickThroughs || 0;
    const clickThroughRate = sent > 0 ? ((clicks / sent) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      totalAudits: totalAudits || 0,
      totalLeads: totalLeads || 0,
      emailsSent: sent,
      clickThroughs: clicks,
      clickThroughRate,
      unsubscribes: unsubscribes || 0,
      recentSnapshots: recentSnapshots || [],
    });
  } catch (error: any) {
    console.error("[admin/stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error.message },
      { status: 500 }
    );
  }
}
