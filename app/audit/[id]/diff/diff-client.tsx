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
        style={{ width: size, height: size }}
        className="rounded bg-bg-elevated flex items-center justify-center text-[10px] text-text-muted border border-border-default"
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
      className="rounded object-contain"
    />
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ToolDiff["status"] }) {
  const config = {
    changed: {
      text: "Updated",
      className: "text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20",
    },
    new: {
      text: "New",
      className: "text-[#00C896] bg-[#00C896]/10 border border-[#00C896]/20",
    },
    same: {
      text: "Unchanged",
      className: "text-text-muted bg-transparent border border-transparent",
    },
  };

  const c = config[status];
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.05em] px-2 py-0.5 rounded ${c.className}`}
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
    <div className="mb-4 overflow-hidden rounded-xl border border-border-strong bg-bg-surface shadow-sm">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 border-b border-border-default p-4">
        <ToolLogo toolId={tool.toolId} size={22} />
        <span className="flex-1 font-sans text-[15px] font-medium text-text-primary">
          {tool.toolName}
        </span>
        <StatusBadge status={tool.status} />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2">
        {/* BEFORE column */}
        <div
          className={`border-r border-border-default p-5 ${
            tool.status === "changed" ? "opacity-60 bg-bg-elevated" : "bg-bg-base"
          }`}
        >
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.05em] text-text-muted">
            Before
          </div>

          {tool.old ? (
            <>
              <div className="mb-2 inline-block rounded border border-border-default bg-bg-surface px-1.5 py-0.5 font-sans text-[12px] font-medium text-text-secondary">
                {tool.old.badge}
              </div>
              <div className="mb-2 font-serif text-[22px] text-text-primary">
                ${tool.old.monthlySavings.toFixed(0)}
                <span className="font-mono text-[11px] text-text-muted ml-1">
                  /mo
                </span>
              </div>
              <div className="font-sans text-[13px] leading-relaxed text-text-muted">
                {tool.old.reason}
              </div>
            </>
          ) : (
            <div className="font-sans text-[13px] italic text-text-muted">
              Not in original audit
            </div>
          )}
        </div>

        {/* AFTER column */}
        <div className="p-5 bg-bg-base">
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.05em] text-[#00C896]">
            Now
          </div>

          <div className="mb-2 inline-block rounded border border-border-default bg-bg-surface px-1.5 py-0.5 font-sans text-[12px] font-medium text-text-secondary">
            {tool.new.badge}
          </div>
          <div
            className={`mb-2 font-serif text-[22px] ${
              tool.new.monthlySavings > 0 ? "text-[#00C896]" : "text-text-primary"
            }`}
          >
            ${tool.new.monthlySavings.toFixed(0)}
            <span className="font-mono text-[11px] text-text-muted ml-1">
              /mo
            </span>
          </div>

          {/* Savings delta line */}
          {tool.old && savingsDelta !== 0 && (
            <div
              className={`mb-2 flex items-center gap-1 font-mono text-[11px] ${
                savingsDelta > 0 ? "text-[#00C896]" : "text-[#FF5C5C]"
              }`}
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

          <div className="font-sans text-[13px] leading-relaxed text-text-secondary">
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
        <section className="mb-12">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#F5A623]">
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
        <section className="mb-12 opacity-70">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
            {sameTools.length} Unchanged
          </div>
          {sameTools.map((tool) => (
            <div
              key={tool.toolId}
              className="flex items-center gap-2.5 border border-border-default py-3 px-4 bg-bg-surface rounded-md mb-2"
            >
              <ToolLogo toolId={tool.toolId} size={20} />
              <span className="flex-1 font-sans text-[14px] text-text-secondary">
                {tool.toolName}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                No change
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Re-run CTA */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center shadow-sm">
        <div className="mb-2 font-sans text-[16px] font-medium text-text-primary">
          Want to start fresh with current pricing?
        </div>
        <div className="mb-5 font-sans text-[14px] text-text-muted">
          Your form data is saved. Re-run in under a minute.
        </div>
        <a
          href="/"
          className="inline-block rounded-md bg-[#00C896] px-6 py-2.5 font-sans text-[14px] font-semibold text-white no-underline hover:bg-[#00C896]/90 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          Run new audit →
        </a>
      </div>
    </>
  );
}
