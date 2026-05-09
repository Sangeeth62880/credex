"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ResultsHero from "@/components/results/results-hero";
import AuditCard from "@/components/results/audit-card";
import ResultsSidebar from "@/components/results/results-sidebar";
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

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      {/* Hero Section */}
      <ResultsHero
        totalMonthlySavings={result.totalMonthlySavings}
        totalAnnualSavings={result.totalAnnualSavings}
        toolCount={result.toolCount}
        teamSize={result.formInput.teamSize}
        useCase={result.formInput.useCase}
      />

      {/* Content Grid */}
      <div className="mx-auto max-w-results px-6 pt-12">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* AI Summary */}
            <AuditSummary auditResult={result} />

            {/* Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-1 w-1 rounded-full bg-text-muted" />
                <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Tool-by-Tool Analysis
                </h2>
              </div>
              <div className="space-y-4">
                {result.toolAudits.map((audit, idx) => (
                  <div key={idx} className="animate-step-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <AuditCard audit={audit} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <ResultsSidebar
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
