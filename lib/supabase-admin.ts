/**
 * Server-side only admin Supabase client.
 * Uses the service_role key which bypasses Row Level Security (RLS).
 *
 * IMPORTANT: Never expose this client or the service_role key to the browser.
 * Only import this in API routes (app/api/**) or server-side code.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!serviceRoleKey || serviceRoleKey === "REPLACE_WITH_YOUR_SERVICE_ROLE_KEY") {
  console.warn(
    "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Admin operations (bypassing RLS) will fail. " +
      "Set it in .env.local from Supabase Dashboard → Settings → API → service_role."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
