"use client";

import React from "react";
import { BenchmarkData } from "@/lib/audit-engine";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenchmarkSectionProps {
  benchmarks: BenchmarkData;
}

export default function BenchmarkSection({ benchmarks }: BenchmarkSectionProps) {
  const isHigh = benchmarks.status === "above_average";
  const isLow = benchmarks.status === "below_average";

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Global AI Benchmark
          </h3>
          <h2 className="mt-2 font-serif text-[24px] text-text-primary">
            How your spend compares
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-sans text-[13px] text-text-secondary">Your Spend / Dev</p>
            <p className="font-mono text-[20px] font-bold text-text-primary">
              ${benchmarks.spendPerDeveloper.toFixed(2)}
            </p>
          </div>
          <div className="h-10 w-px bg-border-subtle" />
          <div className="text-left">
            <p className="font-sans text-[13px] text-text-secondary">Average</p>
            <p className="font-mono text-[20px] font-medium text-text-muted">
              ${benchmarks.averageSpendPerDeveloper.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all",
          isLow ? "bg-positive-bg border-positive/30" : "bg-bg-base border-border-subtle opacity-50"
        )}>
          <TrendingDown className={cn("h-6 w-6", isLow ? "text-positive" : "text-text-muted")} />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-text-muted">Below Average</p>
          <p className="mt-1 font-sans text-[12px] text-text-secondary">Efficiency leader</p>
        </div>

        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all",
          benchmarks.status === "average" ? "bg-accent-dim border-accent/30 shadow-[0_0_15px_rgba(0,200,150,0.05)]" : "bg-bg-base border-border-subtle opacity-50"
        )}>
          <Minus className={cn("h-6 w-6", benchmarks.status === "average" ? "text-accent" : "text-text-muted")} />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-text-muted">On Market</p>
          <p className="mt-1 font-sans text-[12px] text-text-secondary">Standard allocation</p>
        </div>

        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all",
          isHigh ? "bg-negative-bg border-negative/30" : "bg-bg-base border-border-subtle opacity-50"
        )}>
          <TrendingUp className={cn("h-6 w-6", isHigh ? "text-negative" : "text-text-muted")} />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-text-muted">Above Average</p>
          <p className="mt-1 font-sans text-[12px] text-text-secondary">Opportunity to trim</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-bg-elevated/50 p-4">
        <p className="font-sans text-[13px] leading-relaxed text-text-secondary">
          {isLow ? (
            <>Your team is <strong>{Math.abs(benchmarks.percentDiff).toFixed(0)}% more efficient</strong> than companies of your size. You have successfully minimized redundancy.</>
          ) : isHigh ? (
            <>Your AI spend is <strong>{benchmarks.percentDiff.toFixed(0)}% higher</strong> than peers. This usually indicates overlapping subscriptions or over-provisioned seats.</>
          ) : (
            <>Your spend is <strong>within 10% of the industry average</strong>. You are currently in a healthy position, but there are still small optimizations possible.</>
          )}
        </p>
      </div>
    </div>
  );
}
