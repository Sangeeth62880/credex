"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid password");
      }

      // On success, redirect to admin dashboard
      router.push("/admin");
      router.refresh(); // Force refresh to ensure middleware picks up the new cookie
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-text-primary">
      <div className="w-full max-w-[360px] animate-step-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <h1 className="font-serif text-[28px] font-normal mb-2">
            Admin Access
          </h1>
          <p className="font-sans text-[14px] text-text-secondary">
            Enter the master password to view dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full rounded-lg border border-border-default bg-bg-surface px-4 py-3 font-sans text-[15px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50"
            />
            {error && (
              <p className="font-sans text-[13px] text-negative ml-1 animate-step-in">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full h-11 rounded-lg bg-accent font-sans text-[14px] font-semibold text-text-inverse hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="font-sans text-[13px] text-text-muted hover:text-text-primary transition-colors no-underline"
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
