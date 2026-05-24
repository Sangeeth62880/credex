import { supabase } from "./supabase";
import { getPricingSnapshot } from "./pricing-snapshot";
import { ToolPricing, PlanTier } from "./pricing-data";

export interface PlanDiff {
  name: string;
  pricePerUserChanged: boolean;
  oldPrice: number;
  newPrice: number;
  featuresChanged: boolean;
  addedFeatures: string[];
  removedFeatures: string[];
}

export interface ToolDiff {
  tool: string;
  changed: boolean;
  plansChanged: PlanDiff[];
}

export interface PricingDiff {
  changedTools: Record<string, ToolDiff>;
}

export function normalizeToolName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Compares two pricing datasets and returns a detailed diff of changes.
 */
export function diffPricingData(oldData: ToolPricing[], newData: ToolPricing[]): PricingDiff {
  const changedTools: Record<string, ToolDiff> = {};

  for (const newTool of newData) {
    const oldTool = oldData.find(
      (t) => normalizeToolName(t.tool) === normalizeToolName(newTool.tool)
    );

    if (!oldTool) {
      // New tool added
      const plansChanged = newTool.plans.map((p) => ({
        name: p.name,
        pricePerUserChanged: true,
        oldPrice: 0,
        newPrice: p.pricePerUser,
        featuresChanged: true,
        addedFeatures: p.features,
        removedFeatures: [],
      }));

      changedTools[normalizeToolName(newTool.tool)] = {
        tool: newTool.tool,
        changed: true,
        plansChanged,
      };
      continue;
    }

    const plansChanged: PlanDiff[] = [];

    // Compare each plan tier
    for (const newPlan of newTool.plans) {
      const oldPlan = oldTool.plans.find(
        (p) => p.name.toLowerCase() === newPlan.name.toLowerCase()
      );

      if (!oldPlan) {
        // New plan tier added
        plansChanged.push({
          name: newPlan.name,
          pricePerUserChanged: true,
          oldPrice: 0,
          newPrice: newPlan.pricePerUser,
          featuresChanged: true,
          addedFeatures: newPlan.features,
          removedFeatures: [],
        });
        continue;
      }

      // Check if price or features changed
      const priceChanged = oldPlan.pricePerUser !== newPlan.pricePerUser;
      const oldFeatures = oldPlan.features || [];
      const newFeatures = newPlan.features || [];
      const addedFeatures = newFeatures.filter((f) => !oldFeatures.includes(f));
      const removedFeatures = oldFeatures.filter((f) => !newFeatures.includes(f));
      const featuresChanged = addedFeatures.length > 0 || removedFeatures.length > 0;

      if (priceChanged || featuresChanged) {
        plansChanged.push({
          name: newPlan.name,
          pricePerUserChanged: priceChanged,
          oldPrice: oldPlan.pricePerUser,
          newPrice: newPlan.pricePerUser,
          featuresChanged,
          addedFeatures,
          removedFeatures,
        });
      }
    }

    // Check if any plans were removed
    for (const oldPlan of oldTool.plans) {
      const newPlan = newTool.plans.find(
        (p) => p.name.toLowerCase() === oldPlan.name.toLowerCase()
      );
      if (!newPlan) {
        plansChanged.push({
          name: oldPlan.name,
          pricePerUserChanged: true,
          oldPrice: oldPlan.pricePerUser,
          newPrice: 0,
          featuresChanged: true,
          addedFeatures: [],
          removedFeatures: oldPlan.features || [],
        });
      }
    }

    if (plansChanged.length > 0) {
      changedTools[normalizeToolName(newTool.tool)] = {
        tool: newTool.tool,
        changed: true,
        plansChanged,
      };
    }
  }

  return { changedTools };
}

/**
 * Determines if a saved audit is affected by the pricing diff.
 */
export function isAuditAffected(audit: any, diff: PricingDiff): boolean {
  if (!audit || !audit.input_data || !audit.input_data.tools) {
    return false;
  }

  const toolsUsed = audit.input_data.tools.filter((t: any) => t.monthlySpend > 0);

  for (const tool of toolsUsed) {
    const normalizedId = normalizeToolName(tool.id);
    const toolDiff = diff.changedTools[normalizedId];

    if (toolDiff) {
      // Check if the specific plan the user was on had a price/feature change
      const planDiff = toolDiff.plansChanged.find(
        (p) => p.name.toLowerCase() === tool.plan.toLowerCase()
      );

      if (planDiff) {
        return true;
      }

      // Also check if any plan we recommended to them changed, which changes savings!
      if (audit.result_data && audit.result_data.toolAudits) {
        const recommendationsForTool = audit.result_data.toolAudits.filter(
          (ra: any) => normalizeToolName(ra.toolId) === normalizedId
        );
        for (const rec of recommendationsForTool) {
          if (rec.recommendedPlan) {
            const recommendedPlanDiff = toolDiff.plansChanged.find(
              (p) => p.name.toLowerCase() === rec.recommendedPlan.toLowerCase()
            );
            if (recommendedPlanDiff) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

export interface AffectedAuditInfo {
  auditId: string;
  userEmail: string | null;
  toolsChanged: string[];
  originalSavings: number;
  newEstimatedSavings?: number;
}

/**
 * Detects all affected audits between two pricing snapshots.
 */
export async function detectAffectedAudits(
  oldSnapshotId: string | null,
  newSnapshotId: string
): Promise<{ affected: any[]; diff: PricingDiff }> {
  // Fetch pricing snapshots
  const newSnapshot = await getPricingSnapshot(newSnapshotId);
  if (!newSnapshot) {
    throw new Error(`New snapshot not found: ${newSnapshotId}`);
  }

  let oldSnapshotData: ToolPricing[] = [];
  if (oldSnapshotId) {
    const oldSnapshot = await getPricingSnapshot(oldSnapshotId);
    if (oldSnapshot) {
      oldSnapshotData = oldSnapshot.data;
    }
  }

  // If oldSnapshotData is empty (or snapshot wasn't found/specified), load the oldest snapshot
  if (oldSnapshotData.length === 0) {
    const { data: initialSnapshots } = await supabase
      .from("pricing_snapshots")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (initialSnapshots && initialSnapshots.length > 0) {
      oldSnapshotData = initialSnapshots[0].data;
    } else {
      // If absolutely no snapshots exist, we compare against itself (no changes)
      oldSnapshotData = newSnapshot.data;
    }
  }

  const diff = diffPricingData(oldSnapshotData, newSnapshot.data);

  // Fetch all active audits. For large scales we'd paginate, but for MVP we fetch all.
  let query = supabase.from("audits").select("*");
  
  if (oldSnapshotId) {
    query = query.eq("pricing_snapshot_id", oldSnapshotId);
  } else {
    // If oldSnapshotId is null, fetch audits where pricing_snapshot_id is null or matches the oldest
    query = query.is("pricing_snapshot_id", null);
  }

  const { data: audits, error } = await query;
  if (error) {
    console.error("Failed to fetch audits for re-audit detection:", error);
    return { affected: [], diff };
  }

  if (!audits) {
    return { affected: [], diff };
  }

  const affectedAudits = audits.filter((audit) => isAuditAffected(audit, diff));

  return {
    affected: affectedAudits,
    diff,
  };
}
