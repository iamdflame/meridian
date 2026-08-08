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
    description: "Pre-enactment proofs for Cleanverse policy: what a rule will do, proven — and what it did, anchored.",
    siteName: "Meridian",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('meridian-theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg-0 text-ink-1">{children}</body>
    </html>
  );
}
