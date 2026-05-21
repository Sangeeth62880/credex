"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    // The browser will have already handled Basic auth via the middleware
    // challenge. The credentials will be sent automatically on subsequent
    // requests within the session.
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
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A0B0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono), Menlo, monospace",
          fontSize: "13px",
          color: "#4E5568",
        }}
      >
        Loading admin stats...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A0B0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono), Menlo, monospace",
          fontSize: "13px",
          color: "#FF5C5C",
        }}
      >
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0B0D",
        color: "#E5E7EB",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "12px",
            color: "#00C896",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          Admin
        </div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif), Georgia, serif",
            fontSize: "32px",
            color: "#FFFFFF",
            fontWeight: 400,
            marginBottom: "36px",
          }}
        >
          Dashboard
        </h1>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                border: "1px solid #1E2229",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "#0F1114",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "10px",
                  color: "#4E5568",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-serif), Georgia, serif",
                  fontSize: "28px",
                  color: card.highlight ? "#00C896" : "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Pricing Snapshots */}
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "12px",
              color: "#8B92A5",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            Recent pricing snapshots
          </h2>

          {stats.recentSnapshots.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "12px",
                color: "#4E5568",
                padding: "24px",
                textAlign: "center",
                border: "1px solid #1E2229",
                borderRadius: "8px",
              }}
            >
              No snapshots yet
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {stats.recentSnapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    border: "1px solid #1E2229",
                    borderRadius: "6px",
                    backgroundColor: "#0F1114",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), Menlo, monospace",
                      fontSize: "13px",
                      color: "#00C896",
                      minWidth: "100px",
                    }}
                  >
                    v{snapshot.version}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), Menlo, monospace",
                      fontSize: "11px",
                      color: "#8B92A5",
                      flex: 1,
                    }}
                  >
                    {snapshot.notes || "—"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono), Menlo, monospace",
                      fontSize: "11px",
                      color: "#4E5568",
                      whiteSpace: "nowrap",
                    }}
                  >
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
          <h2
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "12px",
              color: "#8B92A5",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            Manual trigger
          </h2>

          <div
            style={{
              border: "1px solid #1E2229",
              borderRadius: "8px",
              padding: "20px",
              backgroundColor: "#0F1114",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "12px",
                color: "#8B92A5",
                marginBottom: "12px",
              }}
            >
              Run this to trigger pricing change detection manually:
            </div>

            <pre
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "12px",
                color: "#E5E7EB",
                backgroundColor: "#0A0B0D",
                padding: "16px",
                borderRadius: "6px",
                border: "1px solid #1E2229",
                overflow: "auto",
                marginBottom: "12px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {curlCommand}
            </pre>

            <button
              onClick={handleCopy}
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "12px",
                color: copied ? "#00C896" : "#8B92A5",
                backgroundColor: "transparent",
                border: "1px solid #1E2229",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              {copied ? "✓ Copied" : "Copy to clipboard"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
