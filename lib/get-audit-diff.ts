import { supabaseAdmin } from "./supabase-admin";
import { runAudit, AuditResult, ToolAudit, FormInput } from "./audit-engine";
import { PRICING_DATA } from "./pricing-data";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToolDiff {
  toolId: string;
  toolName: string;
  status: "changed" | "same" | "new";
  old: {
    recommendedAction: string;
    monthlySavings: number;
    annualSavings: number;
    reason: string;
    badge: string;
  } | null;
  new: {
    recommendedAction: string;
    monthlySavings: number;
    annualSavings: number;
    reason: string;
    badge: string;
  };
}

export interface AuditDiffView {
  auditId: string;
  oldResult: AuditResult;
  newResult: AuditResult;
  toolDiffs: ToolDiff[];
  savingsDelta: number;
  snapshotVersion: string;
  hasSnapshot: boolean;
  createdAt: string;
}

// ─── Main function ───────────────────────────────────────────────────────────

export async function getAuditDiff(
  auditId: string
): Promise<AuditDiffView | null> {
  try {
    // Fetch the audit with its linked pricing snapshot
    const { data: audit, error } = await supabaseAdmin
      .from("audits")
      .select("*, pricing_snapshots(*)")
      .eq("id", auditId)
      .single();

    if (error || !audit) {
      console.error("[getAuditDiff] Audit not found:", error);
      return null;
    }

    const oldResult: AuditResult = audit.result_data;
    const formData: FormInput = audit.input_data;

    // Re-run the audit with current pricing data to get new results
    const newResult = runAudit(formData, PRICING_DATA);

    // Build tool diffs
    const toolDiffs: ToolDiff[] = [];

    for (const newTool of newResult.toolAudits) {
      const oldTool = oldResult.toolAudits?.find(
        (t: ToolAudit) => t.toolId === newTool.toolId
      );

      let status: ToolDiff["status"];

      if (!oldTool) {
        status = "new";
      } else {
        const actionChanged =
          oldTool.recommendedAction !== newTool.recommendedAction;
        const savingsDiff = Math.abs(
          oldTool.monthlySavings - newTool.monthlySavings
        );
        status = actionChanged || savingsDiff > 0.5 ? "changed" : "same";
      }

      toolDiffs.push({
        toolId: newTool.toolId,
        toolName: newTool.toolName,
        status,
        old: oldTool
          ? {
              recommendedAction: oldTool.recommendedAction,
              monthlySavings: oldTool.monthlySavings,
              annualSavings: oldTool.annualSavings,
              reason: oldTool.reason,
              badge: oldTool.badge,
            }
          : null,
        new: {
          recommendedAction: newTool.recommendedAction,
          monthlySavings: newTool.monthlySavings,
          annualSavings: newTool.annualSavings,
          reason: newTool.reason,
          badge: newTool.badge,
        },
      });
    }

    // Determine snapshot version
    const snapshotVersion =
      audit.pricing_snapshots?.version || "unknown";

    const savingsDelta =
      newResult.totalMonthlySavings - oldResult.totalMonthlySavings;

    return {
      auditId,
      oldResult,
      newResult,
      toolDiffs,
      savingsDelta,
      snapshotVersion,
      hasSnapshot: !!audit.pricing_snapshot_id,
      createdAt: audit.created_at,
    };
  } catch (err) {
    console.error("[getAuditDiff] Exception:", err);
    return null;
  }
}
