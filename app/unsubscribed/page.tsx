import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribed — Credex",
  description: "You've been removed from pricing change notifications.",
};

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="text-center max-w-[420px]">
        {/* Checkmark icon */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-6"
        >
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke="#00C896"
            strokeWidth="2"
            className="opacity-20"
          />
          <path
            d="M20 33L28 41L44 25"
            stroke="#00C896"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="font-serif text-[28px] text-text-primary mb-3 font-normal">
          Unsubscribed
        </h1>

        <p className="font-mono text-[13px] leading-relaxed text-text-secondary mb-8">
          You&apos;ve been removed from pricing change notifications.
          <br />
          Your audit is still saved and accessible.
        </p>

        <Link
          href="/"
          className="font-mono text-[13px] text-[#00C896] no-underline border-b border-[#00C896]/30 pb-0.5 hover:border-[#00C896] transition-colors"
        >
          ← Back to Credex
        </Link>
      </div>
    </div>
  );
}
