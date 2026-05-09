"use client";

import React, { useState } from "react";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadCaptureProps {
  auditId: string;
  onClose: () => void;
}

export default function LeadCapture({ auditId, onClose }: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid work email.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId }),
      });

      if (!response.ok) throw new Error("Failed to save lead");

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Lead capture failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-base/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-[440px] rounded-2xl border border-border-strong bg-bg-surface p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-positive-bg">
              <CheckCircle2 className="h-8 w-8 text-positive" />
            </div>
            <h2 className="mt-6 font-serif text-[24px] text-text-primary">Audit Saved</h2>
            <p className="mt-2 text-text-secondary">
              A copy of this report has been sent to {email}.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="font-serif text-[28px] text-text-primary">Lock in these savings</h2>
              <p className="mt-2 text-text-secondary text-[15px]">
                Enter your work email to save this audit and receive a detailed implementation checklist.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ceo@yourcompany.com"
                  className={cn(
                    "w-full rounded-md border bg-bg-elevated px-4 py-3 font-sans text-[15px] text-text-primary transition-all focus:outline-none",
                    error ? "border-negative" : "border-border-default focus:border-accent"
                  )}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {error && <p className="text-xs text-negative mt-1">{error}</p>}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-12 w-full bg-accent text-text-inverse hover:bg-accent-hover font-sans font-semibold text-[15px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Audit Report
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="mt-6 text-center text-[12px] text-text-muted">
              By continuing, you agree to receive a one-time email with your audit results. No spam, ever.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
