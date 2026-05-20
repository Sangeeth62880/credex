import type { Metadata } from "next";
import { Inter, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { FormProvider } from "@/context/form-context";

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://audit.credex.rocks"),
  title: "AI Spend Audit | Credex",
  description: "Identify overspend and redundancies in your AI tool stack. Get a precise transition plan in under 2 minutes.",
  openGraph: {
    title: "AI Spend Audit | Credex",
    description: "Identify overspend and redundancies in your AI tool stack.",
    url: "https://audit.credex.rocks",
    siteName: "Credex AI Audit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit | Credex",
    description: "Identify overspend and redundancies in your AI tool stack.",
    images: ["/og-image.png"],
  },
};

import { LayoutWrapper } from "@/components/layout-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${dmSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-bg-base text-text-primary">
        <FormProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </FormProvider>
      </body>
    </html>
  );
}
