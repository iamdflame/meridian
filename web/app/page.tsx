import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const PRIMITIVES = [
  {
    k: "CVI",
    name: "Verified Identity",
    role: "The book itself",
    body: "Holder state flows from A-Pass records — tier, group, jurisdiction, expiry, freeze. Credential lifecycle is an enactable lever, and re-verification links are issued in-console.",
    calls: ["generate_apass", "query_apass_list", "verify_apass", "update_status", "get_magiclink"],
  },
  {
    k: "CVA",
    name: "Verified Assets",
    role: "The governed object",
    body: "RuleV2 — all five dimensions, including the country lists added in v5.6 — is the exact semantics Meridian simulates and enacts. The token gate proves the policy on-chain.",
    calls: ["atoken/set_rule", "atoken/rules", "query_deposit_atoken_list"],
  },
  {
    k: "CCP",
    name: "Compliance Protocol",
    role: "The verdict layer",
    body: "Every sweep prediction is the same check the chain performs — 500 differential vectors prove the TypeScript and Solidity engines never disagree.",
    calls: ["validator/register", "complianceVerify", "checkTransfer"],
  },
  {
    k: "TR",
    name: "Travel Rule",
    role: "The receipts",
    body: "Every settled leg carries its official report reference into the evidence pack, alongside the on-chain policy hash chain.",
    calls: ["download_travel_rule", "query_txs"],
  },
  {
    k: "ASF",
    name: "Agent Skill Framework",
    role: "The future seat",
    body: "Meridian publishes its own skill — the same pattern Cleanverse uses for ClevrPay. Agents query and simulate; only a human principal can enact.",
    calls: ["SKILL.md", "query_book", "simulate_policy", "get_evidence"],
  },
  {
    k: "MONAD",
    name: "Monad Testnet",
    role: "The proof chain",
    body: "Policy anchors, the gated note, and the suspense escrow settle in 300ms blocks — the enact→refuse flip lands before the sentence describing it ends.",
    calls: ["PolicyRegistry", "VerifiedAssetToken", "DistributionEngine"],
  },
];

const ACTS = [
  {
    n: "01",
    title: "See",
    body: "The book is alive: every holder plotted in policy space — tier against jurisdiction — re-verdicted on every read. Value at risk and expiring credentials surface before they become incidents.",
  },
  {
    n: "02",
    title: "Sweep, then sign",
    body: "Draft a sanctions update. The wavefront crosses the book and 1,200 evaluations later you know precisely who strands, what value freezes, and which Friday coupons would fail. Then — and only then — one signed call makes it law.",
  },
  {
    n: "03",
    title: "Prove",
    body: "The same transfer runs twice: settles under v1, refuses under v2 — refused by the token contract, not the UI. The evidence pack ties every verdict to hashes a regulator can recompute.",
  },
];

export default function Landing() {
  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden" aria-hidden>
        <Image
          src="/brand/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="landing-hero-art object-cover object-center"
        />
        <div className="landing-hero-shade absolute inset-0" />
      </div>

      {/* ── nav ── */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo size={22} withWord />
        <div className="flex items-center gap-5 text-[13px] text-ink-2">
          <a href="#primitives" className="transition-colors hover:text-ink-1 max-md:hidden">
            Integration
          </a>
          <a href="#story" className="transition-colors hover:text-ink-1 max-md:hidden">
            How it works
          </a>
          <a href="https://github.com/iamdflame/meridian" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink-1 max-sm:hidden">
            GitHub
          </a>
          <Link href="/verify" className="transition-colors hover:text-ink-1 max-sm:hidden">
            Verify proof
          </Link>
          <ThemeToggle />
          <Link
            href="/console"
            className="rounded-[10px] px-3.5 py-2 font-medium text-[#04121a] transition-transform active:scale-[0.98]"
            style={{ background: "var(--brand-1)", boxShadow: "var(--elev-glow)" }}
          >
            Open console
          </Link>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-28 text-center max-md:pt-14">
        <div className="rise num rounded-full px-3 py-1 text-[11px] tracking-[0.08em] text-ink-2" style={{ background: "var(--bg-2)", boxShadow: "var(--elev-1)" }}>
          CLEANVERSE BUILD · TRUSTED ASSETS · RWA TRACK
        </div>
        <h1 className="rise mt-6 max-w-3xl text-[64px] leading-[1.02] font-semibold tracking-[-0.045em] max-md:text-[40px]" style={{ animationDelay: "60ms" }}>
          Compliance that
          <br />
          can <em className="font-editorial font-normal not-italic" style={{ fontStyle: "italic", color: "var(--brand-1)" }}>see</em>.
        </h1>
        <p className="rise mt-6 max-w-xl text-[16px] leading-relaxed text-ink-2" style={{ animationDelay: "120ms" }}>
          Meridian issues pre-enactment proofs: the blast radius of any policy change, computed over your live book, proven identical to what the chain will enforce, and anchored before the rule becomes law.
        </p>
        <div className="rise mt-8 flex items-center gap-3" style={{ animationDelay: "180ms" }}>
          <Link
            href="/console/studio"
            className="rounded-[12px] px-5 py-3 text-[14px] font-medium text-[#04121a] transition-transform active:scale-[0.98]"
            style={{ background: "var(--brand-1)", boxShadow: "var(--elev-glow)" }}
          >
            Run a sweep →
          </Link>
          <a href="#story" className="rounded-[12px] px-5 py-3 text-[14px] text-ink-1 transition-colors hover:text-brand-1" style={{ background: "var(--bg-2)", boxShadow: "var(--elev-1)" }}>
            Watch the story
          </a>
        </div>
        <p className="rise num mt-6 text-[11px] text-ink-3" style={{ animationDelay: "240ms" }}>
          48 verified holders · live sandbox APIs · Monad testnet contracts · honest badges on every simulated panel
        </p>
      </header>

      {/* ── the three acts ── */}
      <section id="story" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {ACTS.map((a, i) => (
            <div key={a.n} className="panel rise p-6" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="num text-[12px] text-brand-1">{a.n}</div>
              <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em]">{a.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── primitive-by-primitive ── */}
      <section id="primitives" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8">
          <div className="label">Integration depth</div>
          <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Six Cleanverse surfaces, load-bearing.</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
            Not a KYC screen in front of a protocol — the admin, verdict, evidence, and agent surfaces are the product. Remove any one and Meridian ceases to exist.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {PRIMITIVES.map((p) => (
            <div key={p.k} className="panel group p-5 transition-shadow hover:shadow-[var(--elev-2)]">
              <div className="flex items-baseline justify-between">
                <span className="num text-[12px] font-medium text-brand-1">{p.k}</span>
                <span className="label">{p.role}</span>
              </div>
              <h3 className="mt-2 text-[16px] font-semibold">{p.name}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{p.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.calls.map((c) => (
                  <span key={c} className="num rounded px-1.5 py-0.5 text-[10px] text-ink-3" style={{ background: "var(--bg-2)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── honesty & footer ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <div className="panel flex items-center justify-between gap-6 p-8 max-md:flex-col max-md:text-center">
          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Honesty is load-bearing.</h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-2">
              Every panel names its source — <span className="num text-[11px]" style={{ color: "var(--ok-1)" }}>LIVE · SANDBOX</span>, <span className="num text-[11px]" style={{ color: "var(--ok-1)" }}>LIVE · MONAD</span>, or <span className="num text-[11px]" style={{ color: "var(--sim-1)" }}>SIMULATED</span>. The differential suite proving the simulator matches the chain ships in the repo.
            </p>
          </div>
          <Link
            href="/console"
            className="shrink-0 rounded-[12px] px-5 py-3 text-[14px] font-medium text-[#04121a]"
            style={{ background: "var(--brand-1)", boxShadow: "var(--elev-glow)" }}
          >
            Open the console
          </Link>
        </div>
        <footer className="mt-10 flex items-center justify-between text-[11px] text-ink-3">
          <span className="flex items-center gap-2">
            <Logo size={14} /> Meridian — built for Cleanverse Build: Trusted Assets
          </span>
          <span className="num">Cleanverse Cooperate v5.6 · Skills API · Monad 10143</span>
        </footer>
      </section>
    </div>
  );
}
