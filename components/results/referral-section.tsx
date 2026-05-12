"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralSectionProps {
  referralCode: string;
}

export default function ReferralSection({ referralCode }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `https://audit.credex.rocks/?ref=${referralCode}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-bg-surface to-bg-base p-8 shadow-[0_8px_32px_rgba(0,200,150,0.05)]">
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-3xl" />
      
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
          <Gift className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-serif text-[20px] text-text-primary">Share the Audit, Unlock Perks</h3>
          <p className="mt-1 font-sans text-[14px] text-text-secondary">
            Refer another team. If they run an audit, both of you get <strong>$50 Credex Credits</strong> for your next transition.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-0 overflow-hidden rounded-md border border-border-strong bg-bg-base">
            <code className="px-4 font-mono text-[13px] text-accent">{referralCode}</code>
            <button 
              onClick={handleCopy}
              className="flex h-full items-center border-l border-border-strong bg-bg-elevated px-3 transition-colors hover:bg-bg-overlay"
            >
              {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4 text-text-muted" />}
            </button>
          </div>
          
          <Button 
            className="bg-accent text-text-inverse hover:bg-accent-hover"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'AI Spend Audit | Credex',
                  text: 'Identify overspend in your AI tool stack. Get a precise transition plan in under 2 minutes.',
                  url: shareLink,
                });
              } else {
                handleCopy();
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
      </div>
    </div>
  );
}
