"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminStats {
  totalAudits: number;
  totalLeads: number;
  emailsSent: number;
  clickThroughs: number;
  clickThroughRate: string;
  unsubscribes: number;
  recentSnapshots: Array<{
    id: string;
    version: string;
    created_at: string;
    notes: string | null;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const curlCommand = `curl -X POST "https://YOUR_URL/api/detect-changes" \\
  -H "Authorization: Bearer YOUR_CRON_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{}'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans text-[14px] text-text-muted">
        Loading admin stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans text-[14px] text-negative">
        Error loading stats: {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total audits", value: stats.totalAudits },
    { label: "Emails captured", value: stats.totalLeads },
    { label: "Notifications sent", value: stats.emailsSent },
    {
      label: "Click-through rate",
      value: `${stats.clickThroughRate}%`,
      highlight: true,
    },
    { label: "Unsubscribes", value: stats.unsubscribes },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary px-6 py-12 pb-20">
      <div className="mx-auto max-w-[860px]">
        {/* Header */}
        <div className="mb-9 flex items-start justify-between">
          <div>
            <div className="mb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[#00C896]">
              Admin
            </div>
            <h1 className="font-serif text-[32px] text-text-primary font-normal">
              Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-border-default px-4 py-2 font-sans text-[13px] font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>

        {/* Stat Cards */}
        <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-border-default bg-bg-surface p-5"
            >
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.05em] text-text-muted">
                {card.label}
              </div>
              <div
                className={`font-serif text-[28px] leading-none ${
                  card.highlight ? "text-[#00C896]" : "text-text-primary"
                }`}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Pricing Snapshots */}
        <section className="mb-12">
          <h2 className="mb-4 font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary">
            Recent pricing snapshots
          </h2>

          {stats.recentSnapshots.length === 0 ? (
            <div className="rounded-lg border border-border-default p-6 text-center font-sans text-[14px] text-text-muted">
              No snapshots yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recentSnapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="flex items-center gap-4 rounded-md border border-border-default bg-bg-surface px-4 py-3"
                >
                  <span className="min-w-[100px] font-mono text-[13px] text-[#00C896]">
                    v{snapshot.version}
                  </span>
                  <span className="flex-1 font-sans text-[13px] text-text-secondary">
                    {snapshot.notes || "—"}
                  </span>
                  <span className="whitespace-nowrap font-sans text-[12px] text-text-muted">
                    {new Date(snapshot.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Manual Trigger */}
        <section>
          <h2 className="mb-4 font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary">
            Manual trigger
          </h2>

          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <div className="mb-3 font-sans text-[14px] text-text-secondary">
              Run this to trigger pricing change detection manually:
            </div>

            <pre className="mb-3 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border-subtle bg-bg-base p-4 font-mono text-[12px] text-text-primary">
              {curlCommand}
            </pre>

            <button
              onClick={handleCopy}
              className={`rounded-md border border-border-default bg-transparent px-3 py-1.5 font-sans text-[13px] font-medium transition-colors cursor-pointer ${
                copied ? "text-[#00C896]" : "text-text-secondary"
              }`}
            >
              {copied ? "✓ Copied" : "Copy to clipboard"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
