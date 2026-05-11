"use client";

import React, { useEffect, useState } from "react";
import { Share2, RotateCcw, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultsHeroProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  toolCount: number;
  teamSize: string;
  useCase: string;
  optimizedCount: number;
  actionableCount: number;
}

export default function ResultsHero({
  totalMonthlySavings,
  totalAnnualSavings,
  toolCount,
  teamSize,
  useCase,
  optimizedCount,
  actionableCount,
}: ResultsHeroProps) {
  const [count, setCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * totalMonthlySavings));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setIsReady(true);
      }
    };

    window.requestAnimationFrame(step);
  }, [totalMonthlySavings]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleNewAudit = () => {
    window.location.href = "/audit";
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const hasSavings = totalMonthlySavings > 0;

  return (
    <div className="relative overflow-hidden border-b border-border-subtle">
      {/* Background glow */}
      {hasSavings && (
        <div className="pointer-events-none absolute inset-0 hero-glow" />
      )}

      <div className="mx-auto max-w-[1080px] px-6 py-10 md:py-14">
        {/* Top row — headline + actions */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
              Audit Complete
            </p>
            {hasSavings ? (
              <h1 className="savings-gradient font-serif text-[48px] md:text-[64px] leading-[1.05]">
                {formatCurrency(count)}
                <span className="text-[24px] md:text-[32px]"> /mo</span>
              </h1>
            ) : (
              <h1 className="font-serif text-[36px] md:text-[48px] text-text-primary leading-[1.1]">
                Stack Optimized
              </h1>
            )}
            {hasSavings && (
              <p className={cn(
                "font-serif text-[20px] md:text-[28px] text-text-secondary transition-all duration-500",
                isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
                {formatCurrency(totalAnnualSavings)} / year
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleNewAudit}
              className="h-9 border-border-strong px-3 font-sans text-[12px] font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              New audit
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-9 border-border-strong px-3 font-sans text-[12px] font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              <Share2 className="mr-1.5 h-3 w-3" />
              {isCopied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border-subtle bg-bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-text-muted">
              <BarChart3 className="h-3 w-3" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Tools Audited</span>
            </div>
            <div className="mt-1 font-serif text-[24px] text-text-primary">{toolCount}</div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Zap className="h-3 w-3" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Actions Found</span>
            </div>
            <div className="mt-1 font-serif text-[24px] text-warning">{actionableCount}</div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-text-muted">
              <TrendingUp className="h-3 w-3" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Already Optimal</span>
            </div>
            <div className="mt-1 font-serif text-[24px] text-positive">{optimizedCount}</div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-1.5 text-text-muted">
              <BarChart3 className="h-3 w-3" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Profile</span>
            </div>
            <div className="mt-1 font-mono text-[12px] text-text-secondary leading-tight">
              <span className="text-text-primary">{teamSize}</span>
              <span className="mx-1 text-text-muted">·</span>
              {useCase}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
