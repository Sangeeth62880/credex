"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ToolAudit } from "@/lib/audit-engine";
import { TOOLS } from "@/lib/tools-config";
import { ArrowDown, ArrowRightLeft, Check, Sparkles } from "lucide-react";

interface AuditCardProps {
  audit: ToolAudit;
}

const BADGE_CONFIG: Record<string, { style: string; icon: React.ReactNode }> = {
  'OVERSPENDING':     { style: 'text-negative bg-negative/10 border-negative/20', icon: <ArrowDown className="h-3 w-3" /> },
  'DOWNGRADE PLAN':   { style: 'text-warning bg-warning/10 border-warning/20', icon: <ArrowDown className="h-3 w-3" /> },
  'SWITCH TOOL':      { style: 'text-negative bg-negative/10 border-negative/20', icon: <ArrowRightLeft className="h-3 w-3" /> },
  'CONSIDER CREDITS': { style: 'text-warning bg-warning/10 border-warning/20', icon: <Sparkles className="h-3 w-3" /> },
  'OPTIMAL':          { style: 'text-positive bg-positive/10 border-positive/20', icon: <Check className="h-3 w-3" /> },
};

export default function AuditCard({ audit }: AuditCardProps) {
  const toolConfig = TOOLS.find(t => t.id === audit.toolId);
  const badge = BADGE_CONFIG[audit.badge] || BADGE_CONFIG.OPTIMAL;
  const hasSavings = audit.monthlySavings > 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  // Get the short recommendation text
  const getActionLabel = () => {
    if (audit.recommendedAction === "already_optimal") return "No action needed";
    if (audit.recommendedAction === "downgrade" && audit.recommendedPlan) return `Downgrade to ${audit.recommendedPlan}`;
    if (audit.recommendedAction === "switch_tool" && audit.recommendedTool) return `Switch to ${audit.recommendedTool}`;
    return audit.reason.split('.')[0];
  };

  return (
    <div className={cn(
      "group relative flex flex-col rounded-xl border bg-bg-surface transition-all duration-200",
      hasSavings
        ? "border-border-strong hover:border-accent/40"
        : "border-border-subtle hover:border-border-strong"
    )}>
      {/* Top bar — Tool identity + Badge */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated p-1.5">
            {toolConfig?.logoSrc ? (
              <Image src={toolConfig.logoSrc} alt={audit.toolName} width={24} height={24} className="object-contain" />
            ) : (
              <div className="h-5 w-5 rounded bg-border-default" />
            )}
          </div>
          <div>
            <h3 className="font-sans text-[15px] font-semibold text-text-primary leading-tight">{audit.toolName}</h3>
            <span className="font-mono text-[11px] text-text-muted">{audit.currentPlan} plan</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
          badge.style
        )}>
          {badge.icon}
          {audit.badge}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-[1px] bg-border-subtle" />

      {/* Content area — Savings + Action */}
      <div className="flex flex-1 flex-col justify-between px-5 pt-4 pb-5">
        {/* Savings row */}
        <div className="flex items-baseline justify-between">
          {hasSavings ? (
            <>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Save</span>
                <div className="font-serif text-[28px] leading-tight text-positive">
                  {formatCurrency(audit.monthlySavings)}
                  <span className="text-[12px] font-sans text-text-muted"> /mo</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Current</span>
                <div className="font-mono text-[14px] text-text-secondary line-through decoration-text-muted/40">
                  {formatCurrency(audit.currentMonthlyCost)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Spend</span>
                <div className="font-serif text-[28px] leading-tight text-text-primary">
                  {formatCurrency(audit.currentMonthlyCost)}
                  <span className="text-[12px] font-sans text-text-muted"> /mo</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-positive/8 px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-positive" />
                <span className="font-mono text-[10px] font-medium text-positive">Optimized</span>
              </div>
            </>
          )}
        </div>

        {/* Action recommendation */}
        {hasSavings && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-bg-elevated/60 px-3 py-2.5 border border-border-subtle">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span className="font-sans text-[12px] font-medium text-text-primary leading-tight">
              {getActionLabel()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
