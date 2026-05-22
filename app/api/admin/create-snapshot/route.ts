import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PRICING_DATA, PRICING_VERSION } from "@/lib/pricing-data";
import { clearSnapshotCache } from "@/lib/pricing-snapshot";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !authHeader) return false;

  if (authHeader.startsWith("Basic ")) {
    const base64 = authHeader.split(" ")[1];
    const decoded = atob(base64);
    const [user, pass] = decoded.split(":");
    return user === "admin" && pass === adminPassword;
  }

  return false;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { version, notes, data } = body;

    if (!version) {
      return NextResponse.json(
        { error: "version is required" },
        { status: 400 }
      );
    }

    const snapshotData = data || PRICING_DATA;

    const { data: newSnapshot, error } = await supabaseAdmin
      .from("pricing_snapshots")
      .insert([
        {
          version: version || PRICING_VERSION,
          data: snapshotData,
          notes: notes || `Manual snapshot created via admin dashboard`,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[admin/create-snapshot] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to create snapshot", details: error.message },
        { status: 500 }
      );
    }

    // Clear the cached snapshot so subsequent requests use the new one
    clearSnapshotCache();

    return NextResponse.json({
      id: newSnapshot.id,
      version: newSnapshot.version,
    });
  } catch (error: any) {
    console.error("[admin/create-snapshot] Exception:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
