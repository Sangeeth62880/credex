"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmbed = pathname?.startsWith("/embed");

  return (
    <>
      {!isEmbed && <Navbar />}
      {children}
    </>
  );
}
