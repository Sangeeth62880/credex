"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressSteps from "@/components/progress-steps";
import { useFormContext } from "@/context/form-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { runAudit } from "@/lib/audit-engine";

const TEAM_SIZES = [
  "Just me (1)",
  "Small (2–5)",
  "Medium (6–15)",
  "Growing (16–50)",
  "Large (50+)",
];

const USE_CASES = [
  "Coding",
  "Writing",
  "Data Analysis",
  "Research",
  "Mixed",
];

export default function AuditDetailsPage() {
  const { state, updateTeamSize, updateUseCase, isStep2Valid } = useFormContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBack = () => {
    router.push("/audit");
  };

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      // 1. Prepare input
      const toolInputs = Object.entries(state.tools)
        .filter(([_, val]) => val.enabled)
        .map(([id, val]) => ({
          id,
          plan: val.plan,
          seats: val.seats,
          monthlySpend: val.monthlySpend,
        }));

      const auditInput = {
        tools: toolInputs,
        teamSize: state.teamSize,
        useCase: state.useCase,
      };

      // 2. Run engine
      const result = runAudit(auditInput);

      // 3. Save to database
      const response = await fetch("/api/save-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: auditInput, result }),
      });

      if (!response.ok) throw new Error("Failed to save audit");
      
      const { id } = await response.json();

      // 4. Redirect
      router.push(`/audit/results?id=${id}`);
    } catch (error) {
      console.error("Audit run failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // We render a simple skeleton while hydrating to avoid layout shift
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="mx-auto max-w-content px-6 pt-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      <div className="mx-auto max-w-content px-6">
        <ProgressSteps currentStep={2} />

        <div className="mt-8 animate-step-in">
          <h1 className="font-sans text-[28px] font-semibold text-text-primary">
            A bit about your team
          </h1>
          <p className="mt-2 font-sans text-[15px] text-text-secondary">
            This helps us identify better plans and potential tool redundancies.
          </p>

          <div className="mt-10 space-y-10">
            {/* Field 1: Team Size */}
            <div className="space-y-4">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Team Size
              </label>
              <select
                value={state.teamSize}
                onChange={(e) => updateTeamSize(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-bg-surface px-4 py-3 font-mono text-[14px] text-text-primary focus:border-accent focus:outline-none appearance-none cursor-pointer hover:bg-bg-elevated transition-colors"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%238B92A5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              >
                <option value="" disabled className="bg-bg-surface">Select team size...</option>
                {TEAM_SIZES.map((size) => (
                  <option key={size} value={size} className="bg-bg-surface">
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Primary Use Case */}
            <div className="space-y-4">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Primary Use Case
              </label>
              <div className="flex flex-wrap gap-3">
                {USE_CASES.map((useCase) => (
                  <button
                    key={useCase}
                    onClick={() => updateUseCase(useCase)}
                    className={cn(
                      "rounded-lg px-4 py-2 font-sans text-[14px] transition-all duration-150 border",
                      state.useCase === useCase
                        ? "bg-accent-dim border-accent text-accent shadow-[0_0_12px_rgba(0,200,150,0.1)]"
                        : "bg-bg-surface border-border-default text-text-secondary hover:border-border-strong hover:bg-bg-elevated"
                    )}
                  >
                    {useCase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              className="h-12 border-border-strong px-6 font-sans text-[14px] font-semibold text-text-primary hover:bg-bg-elevated"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleRunAudit}
              disabled={!isStep2Valid || isLoading}
              className="h-12 rounded-md bg-accent px-8 font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover disabled:bg-bg-elevated disabled:text-text-muted shadow-[0_4px_12px_rgba(0,200,150,0.2)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running audit...
                </>
              ) : (
                <>
                  Run my audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
