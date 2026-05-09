"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressSteps from "@/components/progress-steps";
import ToolCard from "@/components/tool-card";
import { useFormContext } from "@/context/form-context";
import { TOOLS } from "@/lib/tools-config";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AuditStep1Page() {
  const { state, updateTool, isStep1Valid } = useFormContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleContinue = () => {
    router.push("/audit/details");
  };

  // We render a simple skeleton or the navbar while hydrating to avoid layout shift
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
        <ProgressSteps currentStep={1} />

        <div className="mt-8 animate-step-in">
          <h1 className="font-sans text-[28px] font-semibold text-text-primary">
            Which AI tools does your team pay for?
          </h1>
          <p className="mt-2 font-sans text-[15px] text-text-secondary">
            Toggle on the tools you&apos;re currently paying for. We&apos;ll do the rest.
          </p>

          <div className="mt-10 space-y-4">
            {TOOLS.map((tool) => {
              const toolValue = state.tools[tool.id] || {
                enabled: false,
                plan: tool.plans[0].label,
                seats: 1,
                monthlySpend: 0,
              };

              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  value={toolValue}
                  onChange={(val) => updateTool(tool.id, val)}
                />
              );
            })}
          </div>

          <div className="mt-10 flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={!isStep1Valid}
              className="h-12 rounded-md bg-accent px-8 font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover disabled:bg-bg-elevated disabled:text-text-muted"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sticky button container */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border-subtle bg-bg-base/80 p-4 backdrop-blur-md md:hidden">
        <Button
          onClick={handleContinue}
          disabled={!isStep1Valid}
          className="h-12 w-full rounded-md bg-accent font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
