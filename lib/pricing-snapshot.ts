import { supabase } from "./supabase";
import { PRICING_DATA, PRICING_VERSION, ToolPricing } from "./pricing-data";

export type PricingSnapshot = {
  id: string;
  created_at: string;
  version: string;
  data: ToolPricing[];
  notes: string | null;
};

// Cached in-memory to avoid redundant DB queries per request if we want
let cachedLatestSnapshot: PricingSnapshot | null = null;

export async function getLatestPricingSnapshot(): Promise<PricingSnapshot> {
  if (cachedLatestSnapshot) {
    return cachedLatestSnapshot;
  }

  try {
    // Check if any snapshots exist in Supabase
    const { data: snapshots, error } = await supabase
      .from("pricing_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching latest pricing snapshot from Supabase:", error);
      throw error;
    }

    if (snapshots && snapshots.length > 0) {
      const latest = snapshots[0] as PricingSnapshot;
      cachedLatestSnapshot = latest;
      return latest;
    }

    // If none exists, write the initial hardcoded PRICING_DATA snapshot
    console.log("No pricing snapshots found. Inserting initial snapshot from PRICING_DATA...");
    const { data: newSnapshot, error: insertError } = await supabase
      .from("pricing_snapshots")
      .insert([
        {
          version: PRICING_VERSION,
          data: PRICING_DATA,
          notes: "Initial hardcoded pricing snapshot from PRICING_DATA",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting initial pricing snapshot:", insertError);
      // Fallback: return temporary mock object so the app doesn't crash
      const mockSnapshot: PricingSnapshot = {
        id: "00000000-0000-0000-0000-000000000000",
        created_at: new Date().toISOString(),
        version: PRICING_VERSION,
        data: PRICING_DATA,
        notes: "Fallback mock pricing snapshot (db insert failed)",
      };
      return mockSnapshot;
    }

    const created = newSnapshot as PricingSnapshot;
    cachedLatestSnapshot = created;
    return created;
  } catch (e) {
    console.error("Failed to load latest pricing snapshot:", e);
    // Fallback: return mock snapshot
    return {
      id: "00000000-0000-0000-0000-000000000000",
      created_at: new Date().toISOString(),
      version: PRICING_VERSION,
      data: PRICING_DATA,
      notes: "Fallback mock pricing snapshot (exception caught)",
    };
  }
}

export async function getPricingSnapshot(id: string): Promise<PricingSnapshot | null> {
  if (id === "00000000-0000-0000-0000-000000000000") {
    return {
      id: "00000000-0000-0000-0000-000000000000",
      created_at: new Date().toISOString(),
      version: PRICING_VERSION,
      data: PRICING_DATA,
      notes: "Fallback mock pricing snapshot",
    };
  }

  try {
    const { data, error } = await supabase
      .from("pricing_snapshots")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching pricing snapshot ${id}:`, error);
      return null;
    }

    return data as PricingSnapshot;
  } catch (e) {
    console.error(`Exception fetching pricing snapshot ${id}:`, e);
    return null;
  }
}

// Helper to clear snapshot cache if new version is uploaded
export function clearSnapshotCache() {
  cachedLatestSnapshot = null;
}
