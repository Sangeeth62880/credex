"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmbedAuditPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-surface p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-accent shadow-[0_0_15px_rgba(0,200,150,0.1)]">
        <Sparkles className="h-5 w-5" />
      </div>
      
      <h1 className="mt-4 font-serif text-[24px] text-text-primary">
        AI Spend Audit
      </h1>
      <p className="mt-2 max-w-[280px] font-sans text-[14px] text-text-secondary">
        Identify overspend and redundancies in your AI tool stack.
      </p>
      
      <div className="mt-8 w-full space-y-4">
        <div className="rounded-lg border border-border-default bg-bg-base p-4 text-left">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Average Savings</p>
          <p className="mt-1 font-serif text-[20px] text-accent">$2,400 / yr</p>
        </div>
        
        <Button 
          onClick={() => window.open('/audit', '_blank')}
          className="h-12 w-full bg-accent font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover shadow-[0_4px_12px_rgba(0,200,150,0.2)]"
        >
          Start Free Audit
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        Powered by Credex
      </p>
    </div>
  );
}
