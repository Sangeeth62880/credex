import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AI Pricing Changes — Credex",
  description:
    "Track changes in AI tooling pricing automatically. See every pricing version that has affected stored audits.",
};

interface PricingSnapshot {
  id: string;
  version: string;
  created_at: string;
  notes: string | null;
}

async function getSnapshots(): Promise<PricingSnapshot[]> {
  try {
    const { data, error } = await supabase
      .from("pricing_snapshots")
      .select("id, version, created_at, notes")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[/changes] Error fetching snapshots:", error);
      return [];
    }

    return (data as PricingSnapshot[]) || [];
  } catch {
    return [];
  }
}

async function getRecentEmailCount(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { count, error } = await supabase
      .from("notification_log")
      .select("*", { count: "exact", head: true })
      .eq("email_sent", true)
      .gte("sent_at", sevenDaysAgo);

    if (error) {
      console.error("[/changes] Error fetching email count:", error);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

export default async function ChangesPage() {
  const [snapshots, emailCount] = await Promise.all([
    getSnapshots(),
    getRecentEmailCount(),
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0B0D",
        color: "#E5E7EB",
        padding: "60px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "12px",
            color: "#00C896",
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            marginBottom: "12px",
          }}
        >
          Market intelligence
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: "var(--font-dm-serif), Georgia, serif",
            fontSize: "36px",
            color: "#FFFFFF",
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: "12px",
          }}
        >
          What changed in AI tooling pricing
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "13px",
            color: "#8B92A5",
            lineHeight: "1.6",
            marginBottom: "40px",
            maxWidth: "540px",
          }}
        >
          Tracked automatically. Every pricing version that has affected stored
          audits.
        </p>

        {/* Stats row */}
        {emailCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              border: "1px solid #1E2229",
              borderRadius: "999px",
              marginBottom: "32px",
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#8B92A5",
            }}
          >
            <span style={{ color: "#00C896", fontWeight: 600 }}>
              {emailCount}
            </span>{" "}
            notifications sent in last 7 days
          </div>
        )}

        {/* Snapshots list */}
        {snapshots.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "13px",
              color: "#4E5568",
            }}
          >
            No pricing changes tracked yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            {snapshots.map((snapshot) => {
              const date = new Date(snapshot.created_at).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={snapshot.id}
                  style={{
                    border: "1px solid #1E2229",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#0F1114",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: snapshot.notes ? "12px" : "0",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono), Menlo, monospace",
                          fontSize: "13px",
                          color: "#00C896",
                          fontWeight: 500,
                        }}
                      >
                        v{snapshot.version}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono), Menlo, monospace",
                        fontSize: "11px",
                        color: "#4E5568",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {date}
                    </div>
                  </div>
                  {snapshot.notes && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono), Menlo, monospace",
                        fontSize: "12px",
                        color: "#8B92A5",
                        lineHeight: "1.5",
                      }}
                    >
                      {snapshot.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "13px",
              color: "#00C896",
              textDecoration: "none",
              borderBottom: "1px solid rgba(0, 200, 150, 0.3)",
              paddingBottom: "2px",
            }}
          >
            Run your free audit →
          </Link>
        </div>
      </div>
    </div>
  );
}
