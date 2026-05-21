export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
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
