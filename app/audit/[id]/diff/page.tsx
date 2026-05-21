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
  const diff = await getAuditDiff(params.id);
  if (!diff) {
    return { title: "Audit diff — not found" };
  }
  const sign = diff.savingsDelta >= 0 ? "+" : "";
  return {
    title: `Audit diff — ${sign}$${Math.abs(diff.savingsDelta).toFixed(0)}/mo change`,
    description: "Compare your original audit against updated pricing",
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
    createdAt,
  } = diff;

  const changedTools = toolDiffs.filter((t) => t.status !== "same");
  const sameTools = toolDiffs.filter((t) => t.status === "same");

  const deltaSign = savingsDelta > 0 ? "+" : savingsDelta < 0 ? "" : "";
  const deltaColor =
    savingsDelta > 0 ? "#00C896" : savingsDelta < 0 ? "#FF5C5C" : "#4E5568";

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0B0D",
        color: "#E5E7EB",
      }}
    >
      <TrackDiffView auditId={params.id} />

      {/* ─── HEADER ─── */}
      <header
        style={{
          borderBottom: "1px solid #1E2229",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "13px",
            }}
          >
            <a
              href={`/audit/results?id=${params.id}`}
              style={{ color: "#8B92A5", textDecoration: "none" }}
            >
              ← Original audit
            </a>
            <span style={{ color: "#4E5568" }}>/</span>
            <span style={{ color: "#00C896" }}>Pricing update</span>
          </div>

          {/* Warning badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              border: "1px solid rgba(245, 166, 35, 0.3)",
              borderRadius: "999px",
              marginBottom: "28px",
              color: "#F5A623",
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F5A623"
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            {/* Savings delta headline */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "11px",
                  color: "#8B92A5",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  marginBottom: "4px",
                }}
              >
                Savings delta
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-dm-serif), Georgia, serif",
                    fontSize: "56px",
                    color: deltaColor,
                    lineHeight: 1,
                  }}
                >
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
                    stroke={deltaColor}
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
              <span
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "11px",
                  color: "#4E5568",
                }}
              >
                /month
              </span>
            </div>

            {/* Before / After stat boxes */}
            <div style={{ display: "flex", gap: "16px" }}>
              {/* Before box */}
              <div
                style={{
                  opacity: 0.5,
                  padding: "16px 20px",
                  border: "1px solid #1E2229",
                  borderRadius: "8px",
                  minWidth: "140px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono), Menlo, monospace",
                    fontSize: "9px",
                    color: "#4E5568",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  Before
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-serif), Georgia, serif",
                    fontSize: "28px",
                    color: "#FFFFFF",
                    lineHeight: 1,
                  }}
                >
                  ${oldResult.totalMonthlySavings.toFixed(0)}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), Menlo, monospace",
                    fontSize: "9px",
                    color: "#4E5568",
                  }}
                >
                  /mo savings
                </div>
              </div>

              {/* After box */}
              <div
                style={{
                  padding: "16px 20px",
                  border: "1px solid #1E2229",
                  borderRadius: "8px",
                  minWidth: "140px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono), Menlo, monospace",
                    fontSize: "9px",
                    color: "#00C896",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  Now
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-serif), Georgia, serif",
                    fontSize: "28px",
                    color: "#FFFFFF",
                    lineHeight: 1,
                  }}
                >
                  ${newResult.totalMonthlySavings.toFixed(0)}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), Menlo, monospace",
                    fontSize: "9px",
                    color: "#4E5568",
                  }}
                >
                  /mo savings
                </div>
              </div>
            </div>
          </div>

          {/* Version info */}
          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#4E5568",
              marginTop: "20px",
            }}
          >
            Audit created: {formattedDate} · Pricing: {snapshotVersion} →
            current ({PRICING_VERSION})
          </div>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <DiffClient
          changedTools={changedTools}
          sameTools={sameTools}
          auditId={params.id}
        />
      </main>
    </div>
  );
}
