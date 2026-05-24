export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Missing or invalid email parameter" },
      { status: 400 }
    );
  }

  try {
    // Upsert into unsubscribes table — ignore conflict on duplicate email
    const { error } = await supabaseAdmin
      .from("unsubscribes")
      .upsert(
        { email: email.toLowerCase().trim() },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[unsubscribe] Supabase upsert error:", error);
      // Still redirect — don't leave the user hanging
    }
  } catch (err) {
    console.error("[unsubscribe] Exception:", err);
  }

  // Always redirect to confirmation page
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(`${baseUrl}/unsubscribed`);
}
