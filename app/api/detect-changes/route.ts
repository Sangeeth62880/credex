import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getLatestPricingSnapshot, getPricingSnapshot } from "@/lib/pricing-snapshot";
import { detectAffectedAudits } from "@/lib/detect-pricing-changes";
import { sendPricingChangeNotification } from "@/lib/send-pricing-emails";

export async function GET(request: Request) {
  return handleDetectChanges(request);
}

export async function POST(request: Request) {
  return handleDetectChanges(request);
}

async function handleDetectChanges(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const authHeader = request.headers.get("authorization");

    // 1. Authorization Check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const isAuthorized = 
        (authHeader === `Bearer ${cronSecret}`) || 
        (secret === cronSecret);
      
      if (!isAuthorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn("CRON_SECRET is not configured. Allowing unauthorized trigger for development.");
    }

    // 2. Identify Snapshots to compare
    let oldSnapshotId = searchParams.get("old_snapshot_id");
    let newSnapshotId = searchParams.get("new_snapshot_id");

    if (!newSnapshotId) {
      // Default to latest snapshot
      const latest = await getLatestPricingSnapshot();
      newSnapshotId = latest.id;
    }

    if (!oldSnapshotId) {
      // Find the second latest snapshot in DB
      const { data: snapshots, error: snapError } = await supabase
        .from("pricing_snapshots")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(2);

      if (snapError) {
        console.error("Error finding previous snapshots:", snapError);
      }

      if (snapshots && snapshots.length >= 2) {
        // If the newest matches what we are comparing to, the old one is the second
        if (snapshots[0].id === newSnapshotId) {
          oldSnapshotId = snapshots[1].id;
        } else {
          oldSnapshotId = snapshots[0].id;
        }
      }
    }

    console.log(`Detecting changes between old snapshot: ${oldSnapshotId || "Initial"} and new snapshot: ${newSnapshotId}`);

    // 3. Detect Affected Audits
    const { affected, diff } = await detectAffectedAudits(oldSnapshotId, newSnapshotId);

    const toolsChanged = Object.keys(diff.changedTools).map(
      (k) => diff.changedTools[k].tool
    );

    if (affected.length === 0 || toolsChanged.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pricing changes or no affected audits found.",
        toolsChanged,
        affectedCount: 0,
      });
    }

    // 4. Map Affected Audits to User Emails (Leads)
    // Must use supabaseAdmin — the leads table has RLS that blocks anon reads.
    const affectedAuditIds = affected.map((a) => a.id);
    console.log("[detect-changes] Affected audit IDs:", affectedAuditIds);

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("email, audit_id")
      .in("audit_id", affectedAuditIds);

    console.log("[detect-changes] Leads query result:", { leads, leadsError });

    if (leadsError) {
      console.error("Failed to fetch leads for affected audits:", leadsError);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Affected audits found but none are associated with contact emails (leads).",
        toolsChanged,
        affectedCount: affected.length,
        notifiedCount: 0,
      });
    }

    // Group affected audits by email
    const emailToAudits: Record<string, any[]> = {};
    for (const lead of leads) {
      if (!lead.email) continue;
      const audit = affected.find((a) => a.id === lead.audit_id);
      if (!audit) continue;

      if (!emailToAudits[lead.email]) {
        emailToAudits[lead.email] = [];
      }
      emailToAudits[lead.email].push(audit);
    }

    // 5. Dispatch Consolidated Email Notifications
    let notifiedCount = 0;
    const emails = Object.keys(emailToAudits);

    for (const email of emails) {
      const userAudits = emailToAudits[email];
      const success = await sendPricingChangeNotification(
        email,
        userAudits,
        newSnapshotId,
        toolsChanged
      );
      if (success) {
        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      toolsChanged,
      affectedCount: affected.length,
      notifiedCount,
      emailsNotified: emails,
    });
  } catch (error: any) {
    console.error("Change detection trigger failed:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
