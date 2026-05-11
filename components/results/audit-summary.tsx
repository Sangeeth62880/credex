"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AuditResult } from "@/lib/audit-engine";

interface AuditSummaryProps {
  auditResult: AuditResult;
}

export default function AuditSummary({ auditResult }: AuditSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            input: auditResult.formInput, 
            result: auditResult 
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.summary) setSummary(data.summary);
        }
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setSummary("We were unable to generate a detailed summary at this time. Please refer to the tool-by-tool breakdown below.");
      } finally {
        setIsLoading(false);
      }
    };

    if (auditResult) {
      fetchSummary();
    }
  }, [auditResult]);

  return (
    <div className="rounded-xl border border-dashed border-accent/20 bg-gradient-to-br from-bg-surface to-bg-elevated/80 p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          AI Analysis
        </span>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="font-sans text-[13px]">Generating insights...</span>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-bg-overlay" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-bg-overlay" />
              <div className="h-3.5 w-4/6 animate-pulse rounded bg-bg-overlay" />
            </div>
          </div>
        ) : (
          <p className="font-sans text-[14px] leading-relaxed text-text-secondary">
            {summary || <span className="italic text-text-muted">No summary available.</span>}
          </p>
        )}
      </div>
    </div>
  );
}
