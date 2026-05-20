import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Starting test-setup script...");

  // 1. Fetch latest two snapshots
  const { data: snapshots, error: snapError } = await supabase
    .from("pricing_snapshots")
    .select("id, version, created_at")
    .order("created_at", { ascending: false })
    .limit(2);

  if (snapError || !snapshots || snapshots.length < 2) {
    console.error("Error fetching snapshots or not enough snapshots (need at least 2). Error:", snapError);
    process.exit(1);
  }

  const newSnapshot = snapshots[0];
  const oldSnapshot = snapshots[1];

  console.log(`Found snapshots:\n- Newest: ${newSnapshot.version} (ID: ${newSnapshot.id})\n- Older: ${oldSnapshot.version} (ID: ${oldSnapshot.id})`);

  // 2. Fetch the latest lead for sps62880@gmail.com
  const { data: leads, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("email", "sps62880@gmail.com")
    .order("created_at", { ascending: false })
    .limit(1);

  if (leadError || !leads || leads.length === 0) {
    console.error("No lead found for sps62880@gmail.com. Error:", leadError);
    process.exit(1);
  }

  const latestLead = leads[0];
  console.log(`Found lead for sps62880@gmail.com (Audit ID: ${latestLead.audit_id})`);

  // 3. Update that audit to have the older snapshot ID
  const { data: updatedAudit, error: updateError } = await supabase
    .from("audits")
    .update({ pricing_snapshot_id: oldSnapshot.id })
    .eq("id", latestLead.audit_id)
    .select();

  if (updateError || !updatedAudit || updatedAudit.length === 0) {
    console.error("Failed to update audit's pricing_snapshot_id. Error:", updateError);
    process.exit(1);
  }

  console.log(`Success! Updated audit ${latestLead.audit_id} to point to old snapshot ${oldSnapshot.version} (${oldSnapshot.id}).`);
  console.log("\nNow you can run the detect-changes pipeline, and it will see this audit as affected!");
}

run();
