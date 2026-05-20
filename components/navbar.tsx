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
          <Link href="/" className="flex items-center font-sans text-[18px] font-bold text-text-primary tracking-tight">
            <svg width="22" height="23" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-positive">
              <path d="M29.1273 9.94472C31.5201 11.5758 32.3367 14.4527 32.1936 17.2658C32.0483 20.1199 30.928 23.2817 28.9699 26.1543C27.0117 29.027 24.4777 31.226 21.8741 32.4045C19.3079 33.5658 16.3315 33.8572 13.9388 32.2262C11.5461 30.5952 10.7294 27.7182 10.8725 24.9051C11.0178 22.0509 12.1385 18.8885 14.0967 16.0158C16.055 13.1432 18.5885 10.9449 21.192 9.76646C23.7582 8.60497 26.7345 8.31367 29.1273 9.94472Z" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M27.0331 4.86983C33.5605 9.31935 33.8542 18.9905 28.9713 26.154C24.0882 33.3176 14.9783 36.5796 8.45079 32.13C1.92339 27.6804 1.63001 18.0085 6.51312 10.845C11.3963 3.68178 20.5057 0.420458 27.0331 4.86983Z" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
            <span>credex</span>
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
