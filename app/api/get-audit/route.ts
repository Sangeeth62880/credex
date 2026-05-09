import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing audit ID" }, { status: 400 });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({
      input: data.input_data,
      result: data.result_data,
      createdAt: data.created_at,
    });
  } catch (e) {
    console.error("Get audit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
