# 03 — BRAND & DESIGN DIRECTION

## 1. Brand

**Name: MERIDIAN** — the prime meridian is the line the world measures itself against. Meridian is the reference line for a verified market: every holder, rule, and settlement measured against policy, live. Domain-plausible (`meridian.finance`, `usemeridian.io`, `meridianconsole.com`). Two syllable-stress, real word, flawless at 16px and on a stage slide.

**Tagline:** `Compliance that can see.`
**Secondary lines:** "See the blast radius. Then sign." · "The operating console for verified assets."

**Story (short form):** Every rule an issuer enacts today is enacted blind — a memo, a spreadsheet, a breach report four weeks later. On Cleanverse, policy is executable. Meridian makes it *visible*: sweep your entire book through a draft rule, watch the blast radius, enact with one signed call, and hand the regulator a proof pack anchored on-chain.

**Personality (the three words a stranger should say):** **Precise. Foreknowing. Calm.**
**Voice:** declarative, zero hype, instrument-panel terseness. Verbs first ("Sweep the book", "Enact v4", "Export evidence"). Numbers always tabular. Never exclamation marks. The product speaks like a control tower.

## 2. Design system (tokens are code — this exact block ships as `web/app/tokens.css`)

Reference class: Linear, Vercel, Stripe, Arc. Bar: Awwwards-SOTD coherence. Dark-mode-first (light mode deferred, tokens structured to allow it).

```css
:root {
  /* ---- canvas: deep ink with a cold cast (not zinc, not slate — ours) ---- */
  --bg-0: #06080D;            /* page  */
  --bg-1: #0A0E16;            /* panel */
  --bg-2: #0F1522;            /* raised */
  --bg-3: #151D2E;            /* overlay/hover */
  --line-1: rgba(148,170,220,0.08);   /* hairline */
  --line-2: rgba(148,170,220,0.16);   /* border strong */

  /* ---- ink ---- */
  --ink-1: #E8EDF8;           /* primary text  */
  --ink-2: #9AA8C7;           /* secondary     */
  --ink-3: #5A6888;           /* tertiary/labels */

  /* ---- brand: radar cyan + phosphor trace ---- */
  --brand-1: #53E1F9;         /* radar sweep, CTAs, focus */
  --brand-2: #1FB6D5;         /* pressed/deep */
  --brand-glow: rgba(83,225,249,0.16);

  /* ---- semantic (never reuse brand for status) ---- */
  --ok-1: #4ADE80;  --ok-bg: rgba(74,222,128,0.10);
  --warn-1: #FBBF24; --warn-bg: rgba(251,191,36,0.10);
  --danger-1: #F87171; --danger-bg: rgba(248,113,113,0.10);
  --sim-1: #C084FC;  --sim-bg: rgba(192,132,252,0.10); /* SIMULATED provenance */

  /* ---- type ---- */
  --font-ui: "Geist", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;   /* all figures: tabular-nums */
  --font-editorial: "Newsreader", serif;                 /* landing italic accents only */
  /* scale (px): 12 label · 13 body-s · 14 body · 16 lead · 20 h3 · 28 h2 · 40 h1 · 64 display */
  --track-display: -0.045em; --track-h: -0.02em; --track-label: 0.08em /* uppercase labels */;

  /* ---- geometry ---- */
  --space: 4px;               /* grid: 4/8/12/16/24/32/48/64 */
  --r-s: 6px; --r-m: 10px; --r-l: 16px; --r-full: 999px;

  /* ---- elevation (borders-first; shadows subtle, never mud) ---- */
  --elev-1: 0 0 0 1px var(--line-1);
  --elev-2: 0 0 0 1px var(--line-2), 0 8px 24px rgba(0,0,0,0.35);
  --elev-glow: 0 0 0 1px rgba(83,225,249,0.35), 0 0 24px var(--brand-glow);

  /* ---- motion ---- */
  --ease-swift: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.3, 0.5, 1);
  --t-fast: 150ms; --t-med: 240ms; --t-slow: 350ms;
  /* orchestration: entrances stagger 40ms/child, max 8 children then group; transform/opacity only */
}
```

**Typography rules:** display sizes get `--track-display` and optical alignment (hanging punctuation on landing); ALL financial figures `font-mono` + `font-variant-numeric: tabular-nums`; uppercase micro-labels 12px/`--track-label`/`--ink-3`.

**Depth language:** surfaces separate by border + one background step, never heavy shadow; glow (`--elev-glow`) reserved for the single primary action per screen and the sweep wavefront; glass (backdrop-blur) only on the command bar and overlays.

**Component inventory (M6):** AppShell/nav-rail · CommandBar (⌘K) · ProvenanceChip (LIVE·SANDBOX / LIVE·MONAD / SIMULATED·FIXTURE) · StatCard (ticking tabular numerals) · BookMap (canvas grid of holder nodes) · HolderDrawer · RuleEditor (5 dimensions) · DiffTable · SweepOverlay (signature) · TimelineRow (distributions) · EscrowCard · EvidenceTree · TxHashPill (copy + explorer) · SkillConsole (agent view) · EmptyState/Skeleton/ErrorState (all designed) · Toast.

**Signature interaction — "the Sweep":** on *Run sweep*, a radial phosphor wavefront (brand-1 at 12% → 0%) expands from the policy card across the BookMap over ~900ms (`--ease-swift`); each node re-evaluates as the front passes — 200ms color flip (ok→danger/warn) with a 1px ring pulse; impact counters tick up in mono as nodes flip; when the front exits, stranded-value total *settles* with a 60ms overshoot (`--ease-spring`). Reduced-motion: instant recolor + counter settle, no wavefront.

**Accessibility:** all text ≥ AA on its surface (ink-1 on bg-0 = 15.2:1, ink-2 = 7.1:1); focus = 2px brand-1 ring + 2px offset (designed, never default); full keyboard path Book → Studio → Enact; sweep respects `prefers-reduced-motion`.

## 3. Logo — inline SVG (geometric; flawless 16px → 512px)

Mark: a circle (the book) crossed by the meridian line; a single holder-node sits on the line where it crosses — the found thing. Line extends past the circle: the scan continues.

```svg
<svg width="512" height="512" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- circle: the book -->
  <circle cx="32" cy="32" r="18" stroke="#53E1F9" stroke-width="4"/>
  <!-- meridian: the reference line, extending beyond -->
  <path d="M32 6 L32 20 M32 44 L32 58" stroke="#E8EDF8" stroke-width="4" stroke-linecap="round"/>
  <!-- the found holder -->
  <circle cx="32" cy="32" r="5" fill="#E8EDF8"/>
</svg>
```

Wordmark: `MERIDIAN` in Geist 600, `--track-display`, ink-1, mark at left, cap-height aligned. Favicon: mark only on `--bg-0`.

## 4. Asset production handoff

Generation instructions are separated from the design system so each handoff is complete and paste-ready:

- [Image prompts](prompts/images.md): Nano Banana Pro hero, Open Graph image, and README banner.
- [Video prompts](prompts/videos.md): Veo 3.1 Act 1 opener and Act 3 closer, including second-by-second motion and edit constraints.
- [Demo edit timeline](13-video.md): real product shots, narration, and placement of generated interstitials.

Generated assets are a human-executed enhancement and never block the working product or its public proofs.

## 5. Exit check

- Three words a stranger reads back: *precise, foreknowing, calm* — encoded in voice rules + motion (nothing bounces except one settle), palette (cold, dark, single luminous accent).
- Tokens are code (§2 ships verbatim as `tokens.css`); logo is code (§3); briefs carry exact prompts + paths.
