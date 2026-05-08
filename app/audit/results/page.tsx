"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AuditResult, AuditInput } from "@/lib/audit-engine";

type ActionColor = {
  bg: string;
  text: string;
  label: string;
  icon: string;
};

const ACTION_STYLES: Record<string, ActionColor> = {
  downgrade: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    label: "Downgrade",
    icon: "↓",
  },
  switch: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    label: "Switch",
    icon: "⇄",
  },
  optimal: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    label: "Optimal",
    icon: "✓",
  },
  consider_credits: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    label: "Consider",
    icon: "💡",
  },
};
export default function AuditResultsPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input, setInput] = useState<AuditInput | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("credex-audit-result");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed.result);
        setInput(parsed.input);
      } catch (e) {
        console.error("Failed to load audit result", e);
      }
    }
  }, []);

  // Save audit automatically
  useEffect(() => {
    if (result && input && !auditId) {
      const saveAudit = async () => {
        try {
          const res = await fetch("/api/save-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input, result }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.id) setAuditId(data.id);
          }
        } catch (e) {
          console.error("Error saving audit", e);
        }
      };
      saveAudit();
    }
  }, [result, input, auditId]);

  useEffect(() => {
    if (result && input && !summary && !isGeneratingSummary) {
      const fetchSummary = async () => {
        setIsGeneratingSummary(true);
        try {
          const res = await fetch("/api/generate-summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ input, result }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.summary) {
              setSummary(data.summary);
            }
          }
        } catch (e) {
          console.error("Error fetching summary", e);
        } finally {
          setIsGeneratingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [result, input, summary, isGeneratingSummary]);

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmittingLead(true);
    try {
      const res = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId }),
      });
      if (res.ok) {
        setLeadSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting lead", error);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (!mounted) return null;

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No audit results found</h2>
          <p className="text-muted-foreground">
            Run an audit first to see your results.
          </p>
          <Link href="/audit">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Start Audit
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasSavings = result.totalMonthlySavings > 0;
  const highSavings = result.totalMonthlySavings >= 500;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <header className="py-16 text-center space-y-6">
          <div className="inline-block px-4 py-1.5 text-sm font-medium tracking-tight text-emerald-400 border border-emerald-400/30 rounded-full bg-emerald-400/10">
            Audit Complete
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            {hasSavings ? (
              <>
                Save{" "}
                <span className="text-emerald-400">
                  ${result.totalMonthlySavings.toLocaleString()}
                </span>
                /mo
              </>
            ) : (
              <span className="gradient-text">Your stack is optimized</span>
            )}
          </h1>
          {hasSavings && (
            <p className="text-2xl text-muted-foreground">
              That's{" "}
              <span className="text-white font-semibold">
                ${result.totalAnnualSavings.toLocaleString()}
              </span>{" "}
              per year in potential savings
            </p>
          )}
          {!hasSavings && (
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              We checked your AI tool subscriptions and everything looks
              well-matched for your team. Nice work.
            </p>
          )}
        </header>

        {/* AI Summary Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400">✨</span>
            </div>
            <h2 className="text-xl font-bold">Your Audit Summary</h2>
          </div>
          {isGeneratingSummary || !summary ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              <div className="h-4 bg-slate-800 rounded w-4/6"></div>
            </div>
          ) : (
            <p className="text-lg text-slate-300 leading-relaxed">
              {summary}
            </p>
          )}
        </section>

        {/* Per-tool breakdown */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Tool-by-Tool Breakdown
          </h2>

          <div className="grid gap-4">
            {result.toolAudits.map((audit, index) => {
              const style =
                ACTION_STYLES[audit.recommendedAction] ||
                ACTION_STYLES.optimal;
              return (
                <Card
                  key={index}
                  className={`${style.bg} border transition-all hover:scale-[1.01]`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{style.icon}</span>
                          <h3 className="text-xl font-bold">{audit.tool}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Currently: <span className="text-white">{audit.currentPlan}</span>{" "}
                          at{" "}
                          <span className="text-white">
                            ${audit.currentMonthlyCost}/mo
                          </span>
                        </p>
                        <p className="text-sm">{audit.reason}</p>
                      </div>

                      <div className="text-right shrink-0">
                        {audit.savings > 0 ? (
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-emerald-400">
                              -${audit.savings}
                              <span className="text-sm font-normal">/mo</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {audit.recommendation}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-emerald-400 font-medium">
                            ✓ No changes needed
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Credex CTA for high savings */}
        {highSavings && (
          <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-slate-900 p-8 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
            <div className="relative space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold">
                Ready to capture these savings?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Credex sells discounted AI credits at up to{" "}
                <span className="text-purple-400 font-semibold">
                  40% off retail
                </span>
                . Your audit identified $
                {result.totalMonthlySavings.toLocaleString()}/mo in potential
                savings — we can help you realize them.
              </p>
              {leadSuccess ? (
                <div className="pt-4 text-emerald-400 font-medium">
                  Thanks! We've sent you an email. Our team will be in touch shortly.
                </div>
              ) : (
                <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your work email"
                    className="flex-1 max-w-sm h-12 rounded-md border border-input bg-background px-4 text-sm"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmittingLead}
                    className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-lg"
                  >
                    {isSubmittingLead ? "Sending..." : "Talk to Credex"}
                  </Button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Low/no savings message */}
        {!hasSavings && (
          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">
              Your AI stack is already well-optimized 🎯
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Want to be notified when prices change or new savings
              opportunities arise?
            </p>
            {leadSuccess ? (
              <p className="text-emerald-400 font-medium pt-2">
                You're on the list! We'll keep you updated.
              </p>
            ) : (
              <form onSubmit={handleLeadCapture} className="flex justify-center gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" disabled={isSubmittingLead} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmittingLead ? "..." : "Notify Me"}
                </Button>
              </form>
            )}
          </section>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-12">
          {auditId && (
            <Button 
              variant="outline" 
              className="border-slate-700 hover:bg-slate-800"
              onClick={() => {
                const url = `${window.location.origin}/audit/results?id=${auditId}`;
                navigator.clipboard.writeText(url);
                alert("Share link copied to clipboard!");
              }}
            >
              Copy Share Link
            </Button>
          )}
          <Link
            href="/audit"
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            ← Run another audit
          </Link>
        </div>
      </div>
    </div>
  );
}
