"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsSidebarProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  auditId: string;
}

export default function ResultsSidebar({
  totalMonthlySavings,
  totalAnnualSavings,
  auditId,
}: ResultsSidebarProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Lead capture failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="sticky top-24 w-full md:w-sidebar space-y-6">
      {/* Summary Card */}
      <div className="rounded-xl border border-border-strong bg-bg-surface p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Total Monthly Savings
            </span>
            <div className="font-serif text-[32px] text-positive">
              {formatCurrency(totalMonthlySavings)}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Projected Annual Savings
            </span>
            <div className="font-serif text-[24px] text-text-primary">
              {formatCurrency(totalAnnualSavings)}
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border-subtle" />

        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-sans text-[15px] font-semibold text-text-primary">
              Capture these savings
            </h4>
            <p className="font-sans text-[13px] leading-relaxed text-text-secondary">
              Credex helps teams buy AI credits at up to 40% off. Get a custom transition plan to realize these savings.
            </p>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-positive/10 p-6 text-center animate-step-in">
              <CheckCircle2 className="h-8 w-8 text-positive" />
              <div>
                <p className="font-sans text-[14px] font-semibold text-text-primary">
                  Request Received
                </p>
                <p className="font-sans text-[12px] text-text-secondary">
                  We&apos;ll be in touch shortly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Work email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-elevated px-3 py-2.5 font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-accent font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Talk to Credex
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="rounded-xl border border-border-subtle bg-bg-base/50 p-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
          Secured by Credex Protocol
        </p>
      </div>
    </div>
  );
}
