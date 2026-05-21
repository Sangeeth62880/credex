"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ResultsHero from "@/components/results/results-hero";
import AuditCard from "@/components/results/audit-card";
import LeadCaptureBanner from "@/components/results/results-sidebar";
import AuditSummary from "@/components/results/audit-summary";
import BenchmarkSection from "@/components/results/benchmark-section";
import ReferralSection from "@/components/results/referral-section";
import { AuditResult } from "@/lib/audit-engine";
import { Loader2, AlertCircle, FileDown, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [data, setData] = useState<{ result: AuditResult } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (!id) {
      setError("No audit ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/get-audit?id=${id}`);
        if (!res.ok) throw new Error("Audit not found");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Fetch audit failed:", err);
        setError("We couldn't find that audit. It may have expired or the link is incorrect.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="mt-4 font-mono text-[14px] uppercase tracking-widest text-text-muted">
          Loading Financial Audit...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6 text-center text-text-primary">
        <AlertCircle className="h-12 w-12 text-warning" />
        <h1 className="mt-6 font-serif text-[32px]">Audit Not Found</h1>
        <p className="mt-2 max-w-md font-sans text-[16px] text-text-secondary">
          {error}
        </p>
        <Button
          onClick={() => router.push("/audit")}
          className="mt-8 bg-accent text-text-inverse hover:bg-accent-hover"
        >
          Run New Audit
        </Button>
      </div>
    );
  }

  const { result } = data;

  // Split audits into actionable and optimal for visual grouping
  const actionableAudits = result.toolAudits.filter(a => a.monthlySavings > 0);
  const optimalAudits = result.toolAudits.filter(a => a.monthlySavings === 0);
  const optimizedCount = optimalAudits.length;
  const actionableCount = actionableAudits.length;

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      {/* Hero Section */}
      <ResultsHero
        totalMonthlySavings={result.totalMonthlySavings}
        totalAnnualSavings={result.totalAnnualSavings}
        toolCount={result.toolCount}
        teamSize={result.formInput.teamSize}
        useCase={result.formInput.useCase}
        optimizedCount={optimizedCount}
        actionableCount={actionableCount}
      />

      {/* Main Content — full width, no sidebar */}
      <div className="mx-auto max-w-[1080px] px-6">
        
        {/* Actions Bar */}
        <div className="no-print mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">Report Actions</h3>
            <div className="h-4 w-px bg-border-subtle" />
            <p className="font-sans text-[13px] text-text-secondary">Audit ID: <span className="font-mono text-text-primary">{id?.slice(0, 8)}</span></p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`/audit/${id}/diff`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 border-border-strong bg-bg-surface text-[12px] text-text-primary hover:bg-bg-elevated" })}
            >
              Pricing diff
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 border-border-strong bg-bg-surface text-[12px] text-text-primary hover:bg-bg-elevated"
              onClick={handlePrint}
            >
              <FileDown className="mr-2 h-3.5 w-3.5" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 border-border-strong bg-bg-surface text-[12px] text-text-primary hover:bg-bg-elevated"
              onClick={() => {
                navigator.share?.({
                  title: 'Credex AI Audit Report',
                  url: window.location.href
                });
              }}
            >
              <Share2 className="mr-2 h-3.5 w-3.5" />
              Share Report
            </Button>
          </div>
        </div>

        {/* Benchmark Section */}
        <div className="mt-8 animate-step-in">
          <BenchmarkSection benchmarks={result.benchmarks} />
        </div>

        {/* AI Summary */}
        <div className="mt-8 animate-step-in">
          <AuditSummary auditResult={result} />
        </div>

        {/* Actionable recommendations */}
        {actionableAudits.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-warning" />
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                Recommended Actions
                <span className="ml-2 text-warning">({actionableCount})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 stagger-children">
              {actionableAudits.map((audit, idx) => (
                <AuditCard key={audit.toolId} audit={audit} />
              ))}
            </div>
          </div>
        )}

        {/* Already optimal */}
        {optimalAudits.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-positive" />
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                Already Optimized
                <span className="ml-2 text-positive">({optimizedCount})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              {optimalAudits.map((audit, idx) => (
                <AuditCard key={audit.toolId} audit={audit} />
              ))}
            </div>
          </div>
        )}

        {/* Referral Section */}
        <div className="mt-12 no-print animate-step-in" style={{ animationDelay: '300ms' }}>
          <ReferralSection referralCode={result.referralCode} />
        </div>

        {/* CTA Banner */}
        <div className="mt-12 no-print animate-step-in" style={{ animationDelay: '400ms' }}>
          <LeadCaptureBanner
            totalMonthlySavings={result.totalMonthlySavings}
            totalAnnualSavings={result.totalAnnualSavings}
            auditId={id!}
          />
        </div>

        {/* Footer Link */}
        <div className="mt-16 pb-8 text-center no-print">
          <Link href="/changes" className="font-mono text-[12px] text-text-muted hover:text-text-secondary transition-colors underline decoration-border-default hover:decoration-border-strong underline-offset-4">
            See what&apos;s changed in AI pricing this week →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuditResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
