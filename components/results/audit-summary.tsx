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
    <div className="rounded-xl border border-dashed border-border-strong bg-bg-elevated p-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          Financial Intelligence Summary
        </span>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2 text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-sans text-[14px]">Analyzing tool stack redundancy...</span>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-bg-overlay" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-bg-overlay" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-bg-overlay" />
            </div>
          </div>
        ) : (
          <div className="font-sans text-[16px] leading-relaxed text-text-primary">
            {summary ? (
              <p className="whitespace-pre-line">{summary}</p>
            ) : (
              <p className="text-text-muted italic">No summary available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
