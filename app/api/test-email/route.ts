export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get("to");

    if (!toEmail) {
      return NextResponse.json(
        {
          error: "Missing recipient",
          message: "Please add '?to=your-email@example.com' to the URL parameters to test delivery.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "placeholder" || apiKey.startsWith("mock_")) {
      return NextResponse.json(
        {
          error: "Invalid API Key",
          message: "The RESEND_API_KEY is not configured or is a placeholder in .env.local",
          apiKeyUsed: apiKey || "None",
        },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    console.log(`Testing Resend with API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`Sending test email to: ${toEmail}`);

    // Standard free Resend accounts can only send from onboarding@resend.dev
    const { data, error } = await resend.emails.send({
      from: "Credex Test <onboarding@resend.dev>",
      to: [toEmail],
      subject: "Credex Resend Integration Test",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #6366f1;">Resend Integration Working! 🎉</h2>
          <p>If you are reading this email, your <strong>RESEND_API_KEY</strong> configuration is 100% correct.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Credex AI Spend Auditor - Local Development Environment</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error,
          hint: "If you have a free Resend account, remember you can ONLY send emails to the email address you signed up with.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      resendData: data,
    });
  } catch (err: any) {
    console.error("Exception in test-email route:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
