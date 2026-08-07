"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProvenanceChip } from "@/components/ui";
import { ConsoleProvider, useConsole } from "@/lib/console-context";

const NAV = [
  { href: "/console", label: "Book", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/console/studio", label: "Policy Studio", icon: "M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" },
  { href: "/console/distributions", label: "Distributions", icon: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" },
  { href: "/console/evidence", label: "Evidence", icon: "M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0" },
  { href: "/console/agent", label: "Agent Surface", icon: "M9 3h6l1 4 4 2-2 5 2 5H4l2-5-2-5 4-2z" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { book } = useConsole();
  return (
    <div className="flex min-h-screen">
      <aside
        className="fixed top-0 bottom-0 left-0 z-40 flex w-[212px] flex-col gap-1 border-r px-3 py-4 max-lg:w-[64px]"
        style={{ borderColor: "var(--line-1)", background: "var(--bg-1)" }}
      >
        <Link href="/" className="mb-4 flex items-center px-2 py-1">
          <Logo size={22} withWord />
        </Link>
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors"
              style={active ? { background: "var(--bg-3)", color: "var(--ink-1)" } : { color: "var(--ink-2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--brand-1)" : "currentColor"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.icon} />
              </svg>
              <span className="max-lg:hidden">{n.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col gap-2 px-2 max-lg:hidden">
          {book && (
            <>
              <div className="label">Data sources</div>
              <ProvenanceChip source={book.mode === "server" ? (book.holders[0]?.source === "live" ? "live" : "fixture") : "demo"} />
              <ProvenanceChip source={book.chain === "live" ? "live" : "demo"} chain />
            </>
          )}
          <div className="pt-2 text-[10px] leading-relaxed text-ink-3">
            Built on Cleanverse · Monad
            <br />
            Simulated panels are always labeled.
          </div>
        </div>
      </aside>
      <main className="ml-[212px] min-h-screen flex-1 px-8 py-6 max-lg:ml-[64px] max-md:px-4">{children}</main>
    </div>
  );
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleProvider>
      <Shell>{children}</Shell>
    </ConsoleProvider>
  );
}
