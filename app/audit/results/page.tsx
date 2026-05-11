"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ResultsHero from "@/components/results/results-hero";
import AuditCard from "@/components/results/audit-card";
import LeadCaptureBanner from "@/components/results/results-sidebar";
import AuditSummary from "@/components/results/audit-summary";
import { AuditResult } from "@/lib/audit-engine";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [data, setData] = useState<{ result: AuditResult } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        {/* CTA Banner */}
        <div className="mt-12 animate-step-in" style={{ animationDelay: '400ms' }}>
          <LeadCaptureBanner
            totalMonthlySavings={result.totalMonthlySavings}
            totalAnnualSavings={result.totalAnnualSavings}
            auditId={id!}
          />
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
