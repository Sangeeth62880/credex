"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ToolAudit } from "@/lib/audit-engine";
import { TOOLS } from "@/lib/tools-config";

interface AuditCardProps {
  audit: ToolAudit;
}

const BADGE_STYLES = {
  'OVERSPENDING': 'text-negative bg-negative/10 border-negative/20',
  'DOWNGRADE PLAN': 'text-warning bg-warning/10 border-warning/20',
  'SWITCH TOOL': 'text-negative bg-negative/10 border-negative/20',
  'CONSIDER CREDITS': 'text-warning bg-warning/10 border-warning/20',
  'OPTIMAL': 'text-positive bg-positive/10 border-positive/20',
};

export default function AuditCard({ audit }: AuditCardProps) {
  const toolConfig = TOOLS.find(t => t.id === audit.toolId);
  const badgeStyle = BADGE_STYLES[audit.badge] || BADGE_STYLES.OPTIMAL;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-xl border border-border-strong bg-bg-surface overflow-hidden transition-all duration-200 hover:border-text-muted/50">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Header & Logo */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated p-1.5">
                {toolConfig?.logoSrc ? (
                  <Image
                    src={toolConfig.logoSrc}
                    alt={audit.toolName}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                ) : (
                  <div className="h-6 w-6 bg-border-default rounded" />
                )}
              </div>
              <div>
                <h3 className="font-sans text-[15px] font-semibold text-text-primary">
                  {audit.toolName}
                </h3>
                <div className={cn(
                  "mt-1 inline-block rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                  badgeStyle
                )}>
                  {audit.badge}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-sans text-[14px] leading-relaxed text-text-secondary">
                {audit.reason}
              </p>
              
              <div className="flex items-center space-x-2 rounded-lg bg-bg-elevated/50 p-3 border border-border-subtle">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="font-sans text-[13px] font-medium text-text-primary">
                  Recommendation: {audit.recommendedAction === 'already_optimal' ? 'Maintain current setup' : audit.reason.split('.')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Cost/Savings Breakdown */}
          <div className="flex flex-col items-start md:items-end md:text-right space-y-4">
            {audit.monthlySavings > 0 ? (
              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Potential Savings
                </span>
                <div className="font-serif text-[28px] text-positive">
                  {formatCurrency(audit.monthlySavings)} <span className="text-[14px] font-sans text-text-muted">/ mo</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Current Spend
                </span>
                <div className="font-serif text-[28px] text-text-primary">
                  {formatCurrency(audit.currentMonthlyCost)} <span className="text-[14px] font-sans text-text-muted">/ mo</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Current Plan
              </span>
              <div className="font-mono text-[12px] text-text-secondary">
                {audit.currentPlan}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
