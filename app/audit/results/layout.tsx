import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your AI Spend Audit | Credex",
  description: "See how much you could save on your AI subscriptions.",
  openGraph: {
    title: "AI Spend Audit Results",
    description: "I just audited my startup's AI tool spend. See how much you could save with Credex.",
    url: "https://credex.com/audit",
    siteName: "Credex",
    images: [
      {
        url: "https://credex.com/og-image.png", // Replace with actual OG image URL
        width: 1200,
        height: 630,
        alt: "Credex AI Spend Audit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit Results",
    description: "I just audited my startup's AI tool spend. See how much you could save.",
    creator: "@credex",
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
