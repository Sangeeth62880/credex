import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribed — Credex",
  description: "You've been removed from pricing change notifications.",
};

export default function UnsubscribedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0B0D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        {/* Checkmark icon */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ margin: "0 auto 24px" }}
        >
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke="#00C896"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M20 33L28 41L44 25"
            stroke="#00C896"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1
          style={{
            fontFamily: "var(--font-dm-serif), Georgia, serif",
            fontSize: "28px",
            color: "#FFFFFF",
            marginBottom: "12px",
            fontWeight: 400,
          }}
        >
          Unsubscribed
        </h1>

        <p
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#8B92A5",
            marginBottom: "32px",
          }}
        >
          You&apos;ve been removed from pricing change notifications.
          <br />
          Your audit is still saved and accessible.
        </p>

        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono), Menlo, monospace",
            fontSize: "13px",
            color: "#00C896",
            textDecoration: "none",
            borderBottom: "1px solid rgba(0, 200, 150, 0.3)",
            paddingBottom: "2px",
          }}
        >
          ← Back to Credex
        </Link>
      </div>
    </div>
  );
}
