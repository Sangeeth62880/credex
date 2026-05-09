import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { FormProvider } from "@/context/form-context";

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-bg-base text-text-primary">
        <FormProvider>
          <Navbar />
          {children}
        </FormProvider>
      </body>
    </html>
  );
}
