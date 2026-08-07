import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian — Compliance that can see",
  description:
    "Mission control for verified-asset issuers on Cleanverse. Simulate any policy change against the live book, see the exact blast radius, enact it with one signed call, and export the proof.",
  openGraph: {
    title: "Meridian — Compliance that can see",
    description: "Simulate. Enact. Prove. The operating console for verified assets.",
    siteName: "Meridian",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-bg-0 text-ink-1">{children}</body>
    </html>
  );
}
