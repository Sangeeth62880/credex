"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CheckCircle2, Shield } from "lucide-react";

interface LeadCaptureBannerProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  auditId: string;
}

export default function LeadCaptureBanner({
  totalMonthlySavings,
  totalAnnualSavings,
  auditId,
}: LeadCaptureBannerProps) {
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-positive/20 bg-positive/5 p-6 md:p-8 animate-step-in">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 className="h-8 w-8 text-positive" />
          <div>
            <p className="font-sans text-[16px] font-semibold text-text-primary">Request Received</p>
            <p className="mt-1 font-sans text-[13px] text-text-secondary">
              We&apos;ll be in touch shortly with your personalized savings plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-credex-cta-border bg-credex-cta-bg p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left — Value prop */}
        <div className="flex-1 space-y-2">
          <h3 className="font-sans text-[18px] font-semibold text-text-primary">
            Ready to capture {totalMonthlySavings > 0 ? formatCurrency(totalAnnualSavings) : "these"} in annual savings?
          </h3>
          <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
            Credex helps teams buy AI credits at up to 40% off. Get a custom transition plan to realize these savings.
          </p>
        </div>

        {/* Right — Form */}
        <form onSubmit={handleSubmit} className="flex w-full gap-2 md:w-auto md:min-w-[340px]">
          <input
            type="email"
            required
            placeholder="Work email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[42px] shrink-0 bg-accent px-5 font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Get Plan
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-text-muted">
        <Shield className="h-3 w-3" />
        <span className="font-mono text-[10px] uppercase tracking-wider">
          No spam · One-time email · Secured by Credex Protocol
        </span>
      </div>
    </div>
  );
}
