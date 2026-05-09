"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-[56px] w-full border-b border-border-subtle bg-bg-base">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        {/* Left side: Logo & Tag */}
        <div className="flex items-center">
          <Link href="/" className="font-sans text-[18px] font-semibold text-text-primary">
            credex
          </Link>
          <div className="mx-3 h-4 w-[1px] bg-border-default" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
            AI Spend Auditor
          </span>
        </div>

        {/* Right side: Link back */}
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center font-sans text-[13px] text-text-muted transition-colors duration-150 hover:text-text-secondary"
        >
          <ArrowLeft className="mr-1 h-[14px] w-[14px]" />
          <span>credex.rocks</span>
        </a>
      </div>
    </nav>
  );
}
