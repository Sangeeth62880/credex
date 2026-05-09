"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { id: 1, label: "TOOLS" },
  { id: 2, label: "DETAILS" },
  { id: 3, label: "YOUR AUDIT" },
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] py-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isFuture = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                    isCompleted && "bg-accent",
                    isActive && "border-2 border-accent text-accent",
                    isFuture && "border-2 border-border-default text-text-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-text-inverse" />
                  ) : (
                    <span className="font-mono text-[11px] font-medium">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-3 font-mono text-[10px] uppercase tracking-[0.1em]",
                    isCompleted && "text-accent",
                    isActive && "text-text-primary",
                    isFuture && "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-[1px] flex-grow self-start mt-3 mx-4",
                    currentStep > step.id ? "bg-accent" : "bg-border-default"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
