import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Spend Audit | Credex",
  description: "Get an instant audit of your AI tool subscriptions and find potential savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
