import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "mock_key");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, auditId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let isMock = false;

    // 1. Save Lead to Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured, skipping lead db insert");
      isMock = true;
    } else {
      const { error } = await supabase.from("leads").insert([{ email, audit_id: auditId }]);
      if (error && error.code !== "23505") { // Ignore unique violation if they already signed up
        console.error("Supabase lead insert error:", error);
      }
    }

    // 2. Send Email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.warn("Resend not configured, skipping email send");
      isMock = true;
    } else {
      const { error } = await resend.emails.send({
        from: "Credex Audit <audit@credex.com>", // Replace with verified domain in production
        to: [email],
        subject: "Your AI Spend Audit Results",
        html: `
          <div>
            <h1>Your AI Spend Audit is ready!</h1>
            <p>Thank you for using the Credex AI Spend Audit tool.</p>
            ${auditId ? `<p>You can review your results anytime at: <a href="https://credex.com/audit/results?id=${auditId}">Your Audit Link</a></p>` : ""}
            <p>If you're ready to capture these savings, reply to this email to talk to our team.</p>
            <br />
            <p>Best,</p>
            <p>The Credex Team</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, mock: isMock });
  } catch (e) {
    console.error("Capture lead error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
