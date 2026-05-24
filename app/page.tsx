"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingDown, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const InfiniteSlider = dynamic(() => import("@/components/ui/infinite-slider").then(mod => mod.InfiniteSlider), {
  ssr: false,
});

const TOOL_LOGOS = [
  { id: "cursor",         name: "Cursor",         src: "/logos/cursor.svg"   },
  { id: "claude",         name: "Claude",         src: "/logos/claude.svg"   },
  { id: "github-copilot", name: "GitHub Copilot", src: "/logos/github.svg"   },
  { id: "openai",         name: "ChatGPT",        src: "/logos/openai.svg"   },
  { id: "gemini",         name: "Gemini",         src: "/logos/gemini-color.svg"   },
  { id: "windsurf",       name: "Windsurf",       src: "/logos/windsurf.svg" },
  { id: "anthropic",      name: "Anthropic API",  src: "/logos/anthropic.svg"},
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg-base text-text-primary overflow-hidden">

      {/* ── Full-page background ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Crisp Slate Grid Pattern */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Radial glow top-right */}
        <div className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-accent/[0.04] blur-[150px]" />
        {/* Radial glow bottom-left */}
        <div className="absolute -bottom-[30%] -left-[15%] h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[130px]" />
      </div>
 
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1200px] flex-col justify-center px-6 py-20 md:py-24">
 
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
 
            {/* Left column — Copy */}
            <div className="space-y-8 animate-step-in">
              <div className="inline-flex items-center space-x-1.5 rounded-full border border-border-default bg-bg-surface px-3 py-1 shadow-sm">
                <span className="font-sans text-[11px] font-semibold tracking-wider text-text-muted">
                  Financial Intelligence for AI Stacks
                </span>
              </div>
 
              <h1 className="font-serif text-[44px] md:text-[64px] lg:text-[72px] leading-[1.05] tracking-tight">
                Stop overpaying for{" "}
                <span className="savings-gradient">AI Tooling.</span>
              </h1>
 
              <p className="max-w-lg font-sans text-[17px] md:text-[19px] text-text-secondary leading-relaxed">
                Get a precise, data-backed audit of your AI tool spend in under 2 minutes. We find plan mismatches and redundancies you didn&apos;t know existed.
              </p>
 
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                <Link href="/audit">
                  <Button className="h-14 rounded-lg bg-accent px-8 font-sans text-[16px] font-bold text-text-inverse hover:bg-accent-hover shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    Run my free audit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                    Audited to date
                  </span>
                  <span className="font-sans text-[16px] font-semibold text-text-primary">
                    $4.2M+ in AI Spend
                  </span>
                </div>
              </div>
            </div>

            {/* Right column — Visual dashboard mockup */}
            <div className="relative hidden lg:block animate-step-in" style={{ animationDelay: "150ms" }}>
              <div className="relative mx-auto w-full max-w-[480px]">
                {/* Glow behind the cards */}
                <div className="absolute inset-0 rounded-3xl bg-accent/[0.06] blur-[60px]" />

                {/* Floating audit result cards */}
                <div className="relative space-y-4">
                  {/* Card 1 — Savings found */}
                  <div className="rounded-xl border border-border-strong bg-bg-surface p-5 shadow-xl shadow-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 border border-warning/20">
                          <TrendingDown className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-sans text-[14px] font-semibold text-text-primary">GitHub Copilot</p>
                          <p className="font-mono text-[11px] text-text-muted">Business → Individual</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-[24px] text-positive">$27</p>
                        <p className="font-mono text-[10px] text-text-muted uppercase">saved/mo</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-bg-elevated px-3 py-2 border border-border-subtle">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="font-sans text-[12px] text-text-secondary">Downgrade to Individual — identical AI features</span>
                    </div>
                  </div>

                  {/* Card 2 — Redundancy */}
                  <div className="ml-6 rounded-xl border border-border-strong bg-bg-surface p-5 shadow-xl shadow-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-negative/10 border border-negative/20">
                          <TrendingDown className="h-5 w-5 text-negative" />
                        </div>
                        <div>
                          <p className="font-sans text-[14px] font-semibold text-text-primary">Windsurf</p>
                          <p className="font-mono text-[11px] text-text-muted">Redundant with Cursor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-[24px] text-positive">$75</p>
                        <p className="font-mono text-[10px] text-text-muted uppercase">saved/mo</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 — Optimal */}
                  <div className="ml-2 rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-xl shadow-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-positive/10 border border-positive/20">
                          <Shield className="h-4 w-4 text-positive" />
                        </div>
                        <div>
                          <p className="font-sans text-[13px] font-medium text-text-primary">Claude Pro</p>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-positive" />
                            <span className="font-mono text-[10px] text-positive">Optimized</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-serif text-[18px] text-text-secondary">$20<span className="text-[11px] font-sans text-text-muted">/mo</span></p>
                    </div>
                  </div>
                </div>

                {/* Floating total savings badge */}
                <div className="absolute -top-12 right-6 z-10 rounded-xl border border-accent/30 bg-credex-cta-bg px-5 py-3 shadow-md shadow-accent/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-accent">Total Savings</p>
                  <p className="font-serif text-[22px] savings-gradient leading-tight">$102/mo</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Key stats bar ──────────────────────────────────────────────── */}
          <div className="mt-16 grid grid-cols-3 gap-4 rounded-xl border border-border-subtle bg-bg-surface p-4 md:p-6 lg:mt-20 shadow-sm">
            <div className="flex items-center gap-3 md:justify-center">
              <Clock className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="font-sans text-[14px] md:text-[15px] font-semibold text-text-primary">Under 2 min</p>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Audit time</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-center">
              <Shield className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="font-sans text-[14px] md:text-[15px] font-semibold text-text-primary">100% Private</p>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">No API keys</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-center">
              <TrendingDown className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="font-sans text-[14px] md:text-[15px] font-semibold text-text-primary">Real pricing</p>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">No estimates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tools Slider ───────────────────────────────────────────────────── */}
      <div className="relative py-8 md:py-10">
        <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
          Supported Tools
        </p>
        <div className="relative mx-auto max-w-[1000px]">
          <InfiniteSlider
            className="flex h-[60px] w-full items-center"
            duration={30}
            gap={56}
          >
            {TOOL_LOGOS.map((tool) => (
              <div
                key={tool.id}
                className="flex w-36 items-center justify-center gap-2.5 opacity-50 transition-opacity hover:opacity-80"
              >
                <Image
                  src={tool.src}
                  alt={tool.name}
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span className="font-mono text-[12px] font-medium text-text-muted whitespace-nowrap">
                  {tool.name}
                </span>
              </div>
            ))}
          </InfiniteSlider>
          <ProgressiveBlur
            className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
            direction="left"
            blurIntensity={1}
          />
          <ProgressiveBlur
            className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
            direction="right"
            blurIntensity={1}
          />
        </div>
      </div>

      {/* Footer Link */}
      <div className="pb-12 text-center relative z-10">
        <Link href="/changes" className="font-mono text-[12px] text-text-muted hover:text-text-secondary transition-colors underline decoration-border-default hover:decoration-border-strong underline-offset-4">
          AI pricing changes →
        </Link>
      </div>
    </main>
  );
}
