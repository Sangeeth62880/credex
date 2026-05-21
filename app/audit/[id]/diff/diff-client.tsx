"use client";

import { useEffect } from "react";
import { ToolDiff } from "@/lib/get-audit-diff";
import { TOOLS } from "@/lib/tools-config";

// ─── Track Diff View ─────────────────────────────────────────────────────────

export function TrackDiffView({ auditId }: { auditId: string }) {
  useEffect(() => {
    fetch("/api/track-reaudit-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId }),
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }, [auditId]);

  return null;
}

// ─── Tool Logo ───────────────────────────────────────────────────────────────

function ToolLogo({ toolId, size = 22 }: { toolId: string; size?: number }) {
  const toolDef = TOOLS.find((t) => t.id === toolId);
  if (!toolDef?.logoSrc) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "4px",
          backgroundColor: "#1E2229",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "#4E5568",
        }}
      >
        {toolId.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={toolDef.logoSrc}
      alt={toolDef.name}
      width={size}
      height={size}
      style={{ borderRadius: "4px", filter: "invert(1)" }}
    />
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ToolDiff["status"] }) {
  const config = {
    changed: {
      text: "Updated",
      color: "#F5A623",
      bg: "rgba(245, 166, 35, 0.2)",
    },
    new: {
      text: "New",
      color: "#00C896",
      bg: "rgba(0, 200, 150, 0.2)",
    },
    same: {
      text: "Unchanged",
      color: "#4E5568",
      bg: "transparent",
    },
  };

  const c = config[status];
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), Menlo, monospace",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: c.color,
        backgroundColor: c.bg,
        padding: "2px 8px",
        borderRadius: "4px",
      }}
    >
      {c.text}
    </span>
  );
}

// ─── Diff Card ───────────────────────────────────────────────────────────────

function DiffCard({ tool }: { tool: ToolDiff }) {
  const savingsDelta = tool.old
    ? tool.new.monthlySavings - tool.old.monthlySavings
    : tool.new.monthlySavings;

  return (
    <div
      style={{
        border: "1px solid #1E2229",
        borderRadius: "12px",
        marginBottom: "16px",
        overflow: "hidden",
        backgroundColor: "#0F1114",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "16px 20px",
          borderBottom: "1px solid #1E2229",
        }}
      >
        <ToolLogo toolId={tool.toolId} size={22} />
        <span
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: "15px",
            color: "#FFFFFF",
            fontWeight: 500,
            flex: 1,
          }}
        >
          {tool.toolName}
        </span>
        <StatusBadge status={tool.status} />
      </div>

      {/* Two-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* BEFORE column */}
        <div
          style={{
            padding: "20px",
            borderRight: "1px solid #1E2229",
            opacity: tool.status === "changed" ? 0.6 : 1,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "9px",
              color: "#4E5568",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}
          >
            Before
          </div>

          {tool.old ? (
            <>
              <div
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "11px",
                  color: "#8B92A5",
                  marginBottom: "8px",
                  display: "inline-block",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  backgroundColor: "rgba(139, 146, 165, 0.1)",
                }}
              >
                {tool.old.badge}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-serif), Georgia, serif",
                  fontSize: "22px",
                  color: "#FFFFFF",
                  marginBottom: "8px",
                }}
              >
                ${tool.old.monthlySavings.toFixed(0)}
                <span
                  style={{
                    fontFamily: "var(--font-mono), Menlo, monospace",
                    fontSize: "11px",
                    color: "#4E5568",
                  }}
                >
                  /mo
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "11px",
                  color: "#4E5568",
                  lineHeight: "1.5",
                }}
              >
                {tool.old.reason}
              </div>
            </>
          ) : (
            <div
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "11px",
                color: "#4E5568",
                fontStyle: "italic",
              }}
            >
              Not in original audit
            </div>
          )}
        </div>

        {/* AFTER column */}
        <div style={{ padding: "20px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "9px",
              color: "#00C896",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}
          >
            Now
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#8B92A5",
              marginBottom: "8px",
              display: "inline-block",
              padding: "2px 6px",
              borderRadius: "3px",
              backgroundColor: "rgba(139, 146, 165, 0.1)",
            }}
          >
            {tool.new.badge}
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-serif), Georgia, serif",
              fontSize: "22px",
              color: tool.new.monthlySavings > 0 ? "#00C896" : "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            ${tool.new.monthlySavings.toFixed(0)}
            <span
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "11px",
                color: "#4E5568",
              }}
            >
              /mo
            </span>
          </div>

          {/* Savings delta line */}
          {tool.old && savingsDelta !== 0 && (
            <div
              style={{
                fontFamily: "var(--font-mono), Menlo, monospace",
                fontSize: "11px",
                color: savingsDelta > 0 ? "#00C896" : "#FF5C5C",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {savingsDelta > 0 ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
              {savingsDelta > 0 ? "+" : ""}${savingsDelta.toFixed(0)}/mo
            </div>
          )}

          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#8B92A5",
              lineHeight: "1.5",
            }}
          >
            {tool.new.reason}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ───────────────────────────────────────────────────

interface DiffClientProps {
  changedTools: ToolDiff[];
  sameTools: ToolDiff[];
  auditId: string;
}

export function DiffClient({ changedTools, sameTools, auditId }: DiffClientProps) {
  return (
    <>
      {/* Changed tools section */}
      {changedTools.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#F5A623",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "20px",
            }}
          >
            {changedTools.length} Recommendation{changedTools.length !== 1 ? "s" : ""}{" "}
            changed
          </div>
          {changedTools.map((tool) => (
            <DiffCard key={tool.toolId} tool={tool} />
          ))}
        </section>
      )}

      {/* Same tools section */}
      {sameTools.length > 0 && (
        <section style={{ marginBottom: "48px", opacity: 0.5 }}>
          <div
            style={{
              fontFamily: "var(--font-mono), Menlo, monospace",
              fontSize: "11px",
              color: "#4E5568",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "20px",
            }}
          >
            {sameTools.length} Unchanged
          </div>
          {sameTools.map((tool) => (
            <div
              key={tool.toolId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderBottom: "1px solid #1E2229",
              }}
            >
              <ToolLogo toolId={tool.toolId} size={20} />
              <span
                style={{
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: "14px",
                  color: "#8B92A5",
                  flex: 1,
                }}
              >
                {tool.toolName}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono), Menlo, monospace",
                  fontSize: "11px",
                  color: "#4E5568",
                }}
              >
                No change
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Re-run CTA */}
      <div
        style={{
          border: "1px solid #1E2229",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          backgroundColor: "#0F1114",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: "16px",
            color: "#FFFFFF",
            fontWeight: 500,
            marginBottom: "8px",
          }}
        >
          Want to start fresh with current pricing?
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "12px",
            color: "#4E5568",
            marginBottom: "20px",
          }}
        >
          Your form data is saved. Re-run in under a minute.
        </div>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            backgroundColor: "#00C896",
            color: "#0A0B0D",
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Run new audit →
        </a>
      </div>
    </>
  );
}
