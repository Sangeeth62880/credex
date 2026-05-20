import { Resend } from "resend";
import { supabase } from "./supabase";
import { getPricingSnapshot } from "./pricing-snapshot";
import { runAudit } from "./audit-engine";

const resend = new Resend(process.env.RESEND_API_KEY || "mock_key");

export async function sendPricingChangeNotification(
  userEmail: string,
  affectedAudits: any[],
  pricingSnapshotId: string,
  toolsChanged: string[]
): Promise<boolean> {
  try {
    // 1. Check if user is unsubscribed
    const { data: unsubscribe, error: unsubError } = await supabase
      .from("unsubscribes")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (unsubError) {
      console.error(`Error checking unsubscribe status for ${userEmail}:`, unsubError);
    }

    if (unsubscribe) {
      console.log(`Skipping notification for ${userEmail}: User is unsubscribed.`);
      return false;
    }

    // 2. Check if already notified for this pricing snapshot (atomic safeguard)
    const { data: existingLog, error: logError } = await supabase
      .from("notification_log")
      .select("id")
      .eq("user_email", userEmail)
      .eq("pricing_snapshot_id", pricingSnapshotId)
      .eq("email_sent", true)
      .maybeSingle();

    if (logError) {
      console.error(`Error checking notification log for ${userEmail}:`, logError);
    }

    if (existingLog) {
      console.log(`Skipping notification for ${userEmail}: Already notified for snapshot ${pricingSnapshotId}.`);
      return false;
    }

    // Fetch the new snapshot to re-run the audits
    const snapshot = await getPricingSnapshot(pricingSnapshotId);
    if (!snapshot) {
      console.error(`Cannot send emails, pricing snapshot ${pricingSnapshotId} not found.`);
      return false;
    }

    // 3. Compute audit changes and prepare content
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let auditListHtml = "";
    const auditIds: string[] = [];

    for (const audit of affectedAudits) {
      auditIds.push(audit.id);

      // Re-run the audit engine with the new pricing snapshot data
      const oldResult = audit.result_data;
      const newResult = runAudit(audit.input_data, snapshot.data);

      const oldSavings = oldResult.totalMonthlySavings;
      const newSavings = newResult.totalMonthlySavings;
      const diffSavings = newSavings - oldSavings;

      const diffText = diffSavings >= 0 
        ? `<span style="color: #10B981; font-weight: bold;">+ $${diffSavings.toFixed(2)}/mo more savings!</span>`
        : `<span style="color: #EF4444; font-weight: bold;">- $${Math.abs(diffSavings).toFixed(2)}/mo less savings</span>`;

      auditListHtml += `
        <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-family: sans-serif; color: #E2E8F0;">
          <h4 style="margin: 0 0 8px 0; color: #F8FAFC; font-size: 16px;">Audit Stack (Created: ${new Date(audit.created_at).toLocaleDateString()})</h4>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #94A3B8;">
            Tools evaluated: ${audit.input_data.tools.map((t: any) => t.id).join(", ")}
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94A3B8;">Original Monthly Savings:</td>
              <td style="padding: 4px 0; font-size: 13px; color: #F1F5F9; text-align: right; font-weight: bold;">$${oldSavings.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94A3B8;">New Estimated Savings:</td>
              <td style="padding: 4px 0; font-size: 13px; color: #F1F5F9; text-align: right; font-weight: bold;">$${newSavings.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94A3B8;">Impact:</td>
              <td style="padding: 4px 0; font-size: 13px; text-align: right;">${diffText}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 16px;">
            <a href="${appUrl}/audit/${audit.id}/diff" style="background-color: #6366F1; color: #FFFFFF; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">
              View Side-by-Side Diff
            </a>
          </div>
        </div>
      `;
    }

    const unsubscribeUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(userEmail)}`;

    // Create notification log row as pending
    const { data: logEntry, error: insertError } = await supabase
      .from("notification_log")
      .insert([
        {
          user_email: userEmail,
          audit_ids_affected: auditIds,
          pricing_snapshot_id: pricingSnapshotId,
          tools_changed: toolsChanged,
          email_sent: false,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error(`Failed to create notification log for ${userEmail}:`, insertError);
      return false;
    }

    // 4. Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      const emailHtml = `
        <div style="background-color: #0F172A; padding: 32px 16px; min-height: 100%; color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #111827; border: 1px solid #1E293B; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: bold; background: linear-gradient(to right, #818CF8, #C084FC); -webkit-background-clip: text; color: #818CF8; letter-spacing: -0.025em;">Credex AI Spend Auditor</span>
            </div>
            
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; text-align: center; color: #F8FAFC;">
              Important: AI Pricing Changes Detected!
            </h2>
            
            <p style="font-size: 15px; line-height: 1.5; color: #94A3B8; margin-bottom: 24px; text-align: center;">
              We detected pricing changes for tools in your stack: 
              <strong style="color: #F1F5F9;">${toolsChanged.join(", ")}</strong>. 
              We've automatically recalculated your potential savings.
            </p>
            
            <!-- Audit cards -->
            ${auditListHtml}
            
            <!-- Footer -->
            <div style="margin-top: 32px; border-top: 1px solid #1E293B; padding-top: 16px; text-align: center; font-size: 12px; color: #64748B;">
              <p style="margin: 0 0 8px 0;">This is an automated spend optimization alert from Credex.</p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #6366F1; text-decoration: underline;">Unsubscribe from all pricing alerts</a>
              </p>
            </div>
          </div>
        </div>
      `;

      const { error: sendError } = await resend.emails.send({
        from: "Credex Spend Auditor <alerts@credex.com>",
        to: [userEmail],
        subject: `[Re-Audit Alert] AI Pricing Shifts: Your Savings Have Changed`,
        html: emailHtml,
      });

      if (sendError) {
        console.error(`Error sending Resend email to ${userEmail}:`, sendError);
        return false;
      }
    } else {
      console.warn(`Resend API Key is missing. Mock-sent email alert to ${userEmail}.`);
    }

    // 5. Update notification log as sent
    const { error: updateError } = await supabase
      .from("notification_log")
      .update({ email_sent: true, sent_at: new Date().toISOString() })
      .eq("id", logEntry.id);

    if (updateError) {
      console.error(`Failed to update notification log status for ${userEmail}:`, updateError);
    }

    return true;
  } catch (err) {
    console.error(`Failed to notify ${userEmail}:`, err);
    return false;
  }
}
