import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[600px] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[80%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[60%] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-results px-6 pt-24 pb-32">
        {/* Hero */}
        <div className="max-w-3xl space-y-8 animate-step-in">
          <div className="inline-flex items-center space-x-2 rounded-full border border-border-strong bg-bg-surface px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Financial Intelligence for AI Stacks
            </span>
          </div>

          <h1 className="font-serif text-[48px] md:text-[80px] leading-[1.1] tracking-tight">
            Stop overpaying for <br />
            <span className="savings-gradient">AI Tooling.</span>
          </h1>

          <p className="max-w-xl font-sans text-[18px] md:text-[20px] text-text-secondary leading-relaxed">
            Get a precise, data-backed audit of your AI tool spend in under 2 minutes. We find plan mismatches and redundancies you didn&apos;t know existed.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
            <Link href="/audit">
              <Button className="h-14 rounded-md bg-accent px-8 font-sans text-[16px] font-bold text-text-inverse hover:bg-accent-hover shadow-[0_0_20px_rgba(0,200,150,0.2)]">
                Run my free audit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <span className="font-mono text-[12px] text-text-muted uppercase tracking-wider">
                Audited to date
              </span>
              <span className="font-sans text-[16px] font-semibold text-text-primary">
                $4.2M+ in AI Spend
              </span>
            </div>
          </div>
        </div>

        {/* Features / Social Proof */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border-subtle pt-16">
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-sans text-[16px] font-semibold">Deterministic Logic</h3>
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              No estimates. Our engine uses real-time pricing data and team-size constraints to find exact savings.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-sans text-[16px] font-semibold">Privacy First</h3>
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              We don&apos;t need your credit card or API keys. Your data stays local until you decide to share it.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-sans text-[16px] font-semibold">Instant Execution</h3>
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              Transition plans delivered immediately. Swap to optimized tiers and consolidate tools with one click.
            </p>
          </div>
        </div>

        {/* Tool logos */}
        <div className="mt-24 py-8 border-y border-border-subtle/50 overflow-hidden grayscale opacity-40">
          <div className="flex items-center justify-between gap-12 animate-marquee whitespace-nowrap">
            <span className="font-mono text-[14px] font-bold">CURSOR</span>
            <span className="font-mono text-[14px] font-bold">CLAUDE</span>
            <span className="font-mono text-[14px] font-bold">CHATGPT</span>
            <span className="font-mono text-[14px] font-bold">GITHUB COPILOT</span>
            <span className="font-mono text-[14px] font-bold">GEMINI</span>
            <span className="font-mono text-[14px] font-bold">WINDSURF</span>
            <span className="font-mono text-[14px] font-bold">OPENAI API</span>
          </div>
        </div>
      </div>
    </main>
  );
}
