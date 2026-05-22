import { notFound } from "next/navigation";
import { getAuditDiff, AuditDiffView } from "@/lib/get-audit-diff";
import { PRICING_VERSION } from "@/lib/pricing-data";
import { DiffClient, TrackDiffView } from "./diff-client";
import type { Metadata } from "next";

interface DiffPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: DiffPageProps): Promise<Metadata> {
  return {
    title: 'Pricing update — your AI spend audit',
    description: 'See how recent pricing changes affect your AI tool recommendations.',
    openGraph: {
      title: 'Pricing update — your AI spend audit',
      description: 'See how recent pricing changes affect your AI tool recommendations.',
    }
  };
}

export default async function DiffPage({ params }: DiffPageProps) {
  const diff = await getAuditDiff(params.id);
  if (!diff) {
    notFound();
  }

  const {
    oldResult,
    newResult,
    toolDiffs,
    savingsDelta,
    snapshotVersion,
    hasSnapshot,
    createdAt,
  } = diff;

  if (!hasSnapshot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6 text-center text-text-primary">
        <h1 className="mt-6 font-serif text-[32px]">Pricing tracking not enabled</h1>
        <p className="mt-2 max-w-md font-sans text-[16px] text-text-secondary">
          This audit was created before pricing tracking was enabled. Run a new audit to enable pricing change notifications.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-accent px-8 font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover transition-colors"
        >
          Run new audit →
        </a>
      </div>
    );
  }

  const changedTools = toolDiffs.filter((t) => t.status !== "same");
  const sameTools = toolDiffs.filter((t) => t.status === "same");

  const deltaSign = savingsDelta > 0 ? "+" : savingsDelta < 0 ? "" : "";
  const deltaColorClass =
    savingsDelta > 0 ? "text-positive" : savingsDelta < 0 ? "text-negative" : "text-text-muted";

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <TrackDiffView auditId={params.id} />

      {/* ─── HEADER ─── */}
      <header className="border-b border-border-subtle px-6 py-8">
        <div className="mx-auto max-w-[960px]">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 font-sans text-[14px]">
            <a href={`/audit/results?id=${params.id}`} className="text-text-muted no-underline hover:text-text-primary transition-colors">
              ← Original audit
            </a>
            <span className="text-border-strong">/</span>
            <span className="text-accent">Pricing update</span>
          </div>

          {/* Warning badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning-bg px-3.5 py-1.5 font-sans text-[13px] font-medium text-warning">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Pricing changed since your audit
          </div>

          {/* Main stats row */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            {/* Savings delta headline */}
            <div>
              <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted">
                Savings delta
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-serif text-[56px] leading-none ${deltaColorClass}`}>
                  {savingsDelta === 0
                    ? "—"
                    : `${deltaSign}$${Math.abs(savingsDelta).toFixed(0)}`}
                </span>
                {savingsDelta !== 0 && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={deltaColorClass}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {savingsDelta > 0 ? (
                      <>
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                        <polyline points="17 18 23 18 23 12" />
                      </>
                    ) : (
                      <>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </>
                    )}
                  </svg>
                )}
              </div>
              <span className="font-mono text-[11px] text-text-muted">
                /month
              </span>
            </div>

            {/* Before / After stat boxes */}
            <div className="flex gap-4">
              {/* Before box */}
              <div className="min-w-[140px] rounded-lg border border-border-default bg-bg-surface p-4 opacity-75">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.05em] text-text-muted">
                  Before
                </div>
                <div className="font-serif text-[28px] leading-none text-text-primary">
                  ${oldResult.totalMonthlySavings.toFixed(0)}
                </div>
                <div className="font-mono text-[9px] text-text-muted">
                  /mo savings
                </div>
              </div>

              {/* After box */}
              <div className="min-w-[140px] rounded-lg border border-accent/20 bg-accent-dim p-4">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.05em] text-accent">
                  Now
                </div>
                <div className="font-serif text-[28px] leading-none text-text-primary">
                  ${newResult.totalMonthlySavings.toFixed(0)}
                </div>
                <div className="font-mono text-[9px] text-text-muted">
                  /mo savings
                </div>
              </div>
            </div>
          </div>

          {/* Version info */}
          <div className="mt-5 font-sans text-[13px] text-text-muted">
            Audit created: {formattedDate} · Pricing: {snapshotVersion} → current ({PRICING_VERSION})
          </div>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <main className="mx-auto max-w-[960px] px-6 py-10 pb-20">
        <DiffClient
          changedTools={changedTools}
          sameTools={sameTools}
          auditId={params.id}
        />
      </main>
    </div>
  );
}
