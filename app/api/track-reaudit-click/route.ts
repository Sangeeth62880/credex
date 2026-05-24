export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  try {
    const body = await request.json();
    const { auditId } = body;

    if (auditId) {
      // Update notification_log: set reaudit_clicked_at = now()
      // WHERE audit_ids_affected contains auditId AND reaudit_clicked_at IS NULL
      const { error } = await supabaseAdmin
        .from("notification_log")
        .update({ reaudit_clicked_at: new Date().toISOString() })
        .contains("audit_ids_affected", [auditId])
        .is("reaudit_clicked_at", null);

      if (error) {
        console.error("[track-reaudit-click] Update error:", error);
      }
    }
  } catch (err) {
    // Tracking failure must never break the user experience
    console.error("[track-reaudit-click] Exception:", err);
  }

  // Always return ok — never fail
  return NextResponse.json({ ok: true });
}
