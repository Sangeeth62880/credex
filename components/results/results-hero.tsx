"use client";

import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultsHeroProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  toolCount: number;
  teamSize: string;
  useCase: string;
}

export default function ResultsHero({
  totalMonthlySavings,
  totalAnnualSavings,
  toolCount,
  teamSize,
  useCase,
}: ResultsHeroProps) {
  const [count, setCount] = useState(0);
  const [showAnnual, setShowAnnual] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOut curve: progress = 1 - Math.pow(1 - t, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * totalMonthlySavings));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setTimeout(() => setShowAnnual(true), 300);
      }
    };

    window.requestAnimationFrame(step);
  }, [totalMonthlySavings]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (totalMonthlySavings === 0) {
    return (
      <div className="border-b border-border-subtle bg-bg-base py-12">
        <div className="mx-auto max-w-results px-6 text-center">
          <h1 className="font-serif text-[36px] text-text-primary">
            Your AI spend looks well-optimized.
          </h1>
          <p className="mt-4 font-sans text-[15px] text-text-secondary">
            Based on current pricing, you&apos;re on the right plans for your team.
          </p>
          <div className="mt-6 font-mono text-[13px] text-text-muted">
            Across {toolCount} tools · {teamSize} team · {useCase}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border-subtle bg-bg-base pt-12 pb-10">
      <div className="mx-auto max-w-results px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <span className="font-sans text-[18px] text-text-secondary">
              Your audit found
            </span>
            <h1 className="savings-gradient font-serif text-[48px] md:text-[72px] leading-tight">
              {formatCurrency(count)} / mo
            </h1>
            <div
              className={cn(
                "transition-all duration-500",
                showAnnual ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              )}
            >
              <h2 className="font-serif text-[24px] md:text-[36px] text-text-secondary">
                {formatCurrency(totalAnnualSavings)} / year
              </h2>
            </div>
            <div className="mt-4 flex flex-wrap items-center font-mono text-[13px] text-text-muted">
              <span>Potential savings in AI tool stack</span>
              <span className="mx-2">·</span>
              <span>Across {toolCount} tools · {teamSize} team · {useCase}</span>
            </div>
          </div>

          <div className="mt-6 md:mt-0">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-9 border-border-strong px-3 font-sans text-[13px] font-medium text-text-primary hover:bg-bg-elevated"
            >
              <Share2 className="mr-2 h-[14px] w-[14px]" />
              {isCopied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
