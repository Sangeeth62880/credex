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
    <div className="min-h-screen bg-bg-base text-text-primary px-6 py-16 pb-20">
      <div className="mx-auto max-w-[760px]">
        {/* Eyebrow */}
        <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-[#00C896]">
          Market intelligence
        </div>

        {/* H1 */}
        <h1 className="mb-3 font-serif text-[36px] text-text-primary font-normal leading-[1.2]">
          What changed in AI tooling pricing
        </h1>

        {/* Subtext */}
        <p className="mb-10 max-w-[540px] font-mono text-[13px] leading-[1.6] text-text-secondary">
          Tracked automatically. Every pricing version that has affected stored
          audits.
        </p>

        {/* Stats row */}
        {emailCount > 0 && (
          <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border-default px-3.5 py-1.5 font-mono text-[11px] text-text-muted">
            <span className="font-semibold text-[#00C896]">{emailCount}</span>{" "}
            notifications sent in last 7 days
          </div>
        )}

        {/* Snapshots list */}
        {snapshots.length === 0 ? (
          <div className="py-16 text-center font-mono text-[13px] text-text-muted">
            No pricing changes tracked yet.
          </div>
        ) : (
          <div className="mb-12 flex flex-col gap-3">
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
                  className="rounded-lg border border-border-default bg-bg-surface p-5"
                >
                  <div className={`flex items-start justify-between gap-3 ${snapshot.notes ? 'mb-3' : 'mb-0'}`}>
                    <div>
                      <span className="font-mono text-[13px] font-medium text-[#00C896]">
                        v{snapshot.version}
                      </span>
                    </div>
                    <div className="whitespace-nowrap font-mono text-[11px] text-text-muted">
                      {date}
                    </div>
                  </div>
                  {snapshot.notes && (
                    <div className="font-mono text-[12px] leading-[1.5] text-text-secondary">
                      {snapshot.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#00C896] no-underline border-b border-[#00C896]/30 pb-0.5 hover:border-[#00C896] transition-colors"
          >
            Run your free audit →
          </Link>
        </div>
      </div>
    </div>
  );
}
