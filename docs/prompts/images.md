# Meridian image-generation prompts

**Generator:** Nano Banana Pro  
**Purpose:** final production assets for the live site, GitHub, and submission package  
**Reference input:** attach `web/public/brand/logo.svg` whenever the generator accepts image references

Each prompt below is self-contained. Generate each asset separately; do not ask the model to create a collage or a family of variants in one canvas.

## Shared visual bible

- Subject: a real policy-space map for a verified asset, seen as a restrained field of holder nodes, one meridian reference line, and a proof wavefront.
- Emotional register: precise, foreknowing, calm. Institutional risk infrastructure, not speculative crypto advertising.
- Palette: deep ink `#06080D`, raised ink `#0A0E16`, pale type `#E8EDF8`, secondary type `#9AA8C7`, proof cyan `#53E1F9`, eligible green `#4ADE80`, warning amber `#FBBF24`, refusal red `#F87171`.
- Materials: matte black glass, fine technical linework, faint paper grain, crisp phosphor light. No glossy chrome.
- Geometry: one unmistakable vertical meridian, one thin circular policy boundary, 40-60 small holder nodes, and one wavefront crossing the field.
- Lighting: low-key and controlled. Cyan is the only dominant luminous accent. Green, amber, and red appear only on a few status nodes.
- Fidelity: sharp enough for financial software, with real depth and restrained 2% film grain. No blur over the primary mechanism.
- Never include coins, token symbols, chains, padlocks, shields, handshakes, people, city skylines, globes, rockets, or generic AI imagery.
- Never include fake UI, charts with unreadable labels, decorative code, sci-fi HUD clutter, bokeh, lens flare, neon purple, rainbow light, or watermarks.

## 1. Landing hero background

**Output:** `web/public/brand/hero-bg.png`  
**Canvas:** 2880 x 1620, 16:9, PNG, sRGB, no transparency  
**Text in image:** none  
**Responsive safety:** preserve meaningful detail in the center 55% and avoid critical objects in the outer 8%

### Master prompt

```text
Create a premium cinematic background for MERIDIAN, an institutional compliance product that proves the impact of a policy before the policy becomes law.

Show a vast, near-black policy-space navigation field viewed from a high, slightly oblique top-down camera. The base is deep ink black with a cold blue cast (#06080D), not gray and not purple. A single razor-thin luminous cyan meridian (#53E1F9) runs vertically through the exact center of frame. It crosses one subtle circular policy boundary made from precise hairline geometry. Around that boundary, place approximately 48 tiny holder nodes in an irregular but intentional data constellation. Most nodes are dim pale blue or restrained eligible green. Exactly three nodes beyond the moving boundary are amber or red, implying newly affected holders without turning the image into an alarm screen.

A thin phosphor proof wavefront is captured midway across the field. Behind the wavefront, nodes have resolved into clear status colors; ahead of it, nodes remain neutral. The before-and-after distinction must be legible through geometry and state, not labels. Add faint longitude-like construction lines that converge with excellent perspective and disappear into darkness. Use matte black glass, delicate technical linework, restrained volumetric depth, crisp highlights, and only 2% cinematic grain.

Composition must support centered website copy: keep the central upper third dark and calm enough for a white headline, while placing the richest node detail below and toward the side thirds. The meridian remains visible behind the copy but never competes with it. Leave a clear dark fade near the bottom so the hero can transition into the next product section. The overall result should feel like a real high-stakes risk instrument photographed beautifully: precise, foreknowing, calm, minimal, and expensive.

No words, letters, numbers, logos, interface panels, or watermarks anywhere in the image. Photoreal material response with abstract data geometry; not an illustration, not a generic space scene, and not a cyberpunk dashboard.
```

### Negative prompt

```text
text, typography, letters, numbers, logo, watermark, fake dashboard, fake chart labels, crypto coin, bitcoin, blockchain links, padlock, shield, handshake, person, face, hands, city, globe, planet, rocket, satellite, blue marble, generic world map, sci-fi HUD, cyberpunk, neon purple, magenta, rainbow, orange-dominant palette, bokeh circles, decorative orb, lens flare, bloom haze, heavy fog, glossy chrome, noisy particles, clutter, low contrast, muddy shadows, soft focus, motion blur, oversaturated cyan
```

### Acceptance checklist

- Exact 2880 x 1620 dimensions and no baked-in text.
- One central meridian, one policy circle, and a visible mid-sweep state transition.
- Centered headline remains readable on both a 1440 x 900 crop and a 390 x 844 crop.
- Cyan is dominant; purple and generic crypto motifs are absent.
- Nodes remain inspectable rather than dissolving into atmospheric dots.

## 2. Open Graph image

**Output:** `web/public/brand/og.png`  
**Canvas:** 2400 x 1260, PNG, sRGB  
**Reference:** attach `web/public/brand/logo.svg`  
**Required text:** `MERIDIAN` and `Compliance that can see.` only

### Master prompt

```text
Design a finished Open Graph image for MERIDIAN, an institutional pre-enactment proof system for verified assets. Use a 2400 by 1260 horizontal canvas and the attached Meridian logo mark as an exact structural reference.

Build the background from deep ink black (#06080D) with a restrained policy-space field: one vertical cyan meridian (#53E1F9), one fine circular policy boundary, and roughly 48 crisp holder nodes. A proof wavefront has just crossed the center. Most resolved nodes are muted eligible green (#4ADE80); three affected nodes are warning amber (#FBBF24) or refusal red (#F87171). Keep all linework thin, controlled, and sparse. The field should communicate that a policy was measured before activation, not merely that data exists.

Place the exact supplied logo mark at left-center, large enough to remain identifiable in a social thumbnail. To its right, typeset exactly:

MERIDIAN
Compliance that can see.

MERIDIAN is uppercase, pale ink (#E8EDF8), geometric sans serif similar to Geist, weight 600, with zero letter spacing and flawless spelling. The tagline is sentence case, #9AA8C7, materially smaller, with zero letter spacing. Do not generate any other words. Maintain generous negative space and a strong left-to-right reading order. Keep all essential logo and text inside the central 80% safe area so social crops do not remove them.

The result must look like a real launch card for institutional financial infrastructure: quiet confidence, exact geometry, no marketing spectacle. Crisp 4K detail, matte surfaces, restrained phosphor light, 2% grain, no visible compression.
```

### Negative prompt

```text
misspelled text, extra text, duplicated letters, distorted logo, altered logo geometry, tiny typography, condensed type, italic wordmark, negative letter spacing, fake UI, dashboard cards, crypto symbols, coins, chain links, padlock, shield, globe, people, city, cyberpunk, purple, magenta, rainbow, excessive glow, lens flare, bokeh, orb, clutter, watermark, stock-photo style
```

### Text-quality fallback

If the generated typography is not exact, regenerate the same composition **without text**, then overlay the supplied SVG mark and the two required lines in Figma or an image editor. Do not ship misspelled generated text.

### Acceptance checklist

- Exact two text lines, correctly spelled, plus the supplied mark.
- Readable at 600 x 315 and under common center crops.
- No additional labels, stats, or interface fragments.
- The proof wavefront and affected-node distinction remain visible behind the lockup.

## 3. GitHub README banner

**Output:** `docs/assets/banner.png`  
**Canvas:** 2560 x 720, PNG, sRGB  
**Reference:** attach `web/public/brand/logo.svg`  
**Required text:** `MERIDIAN`, `Compliance that can see.`, and `PRE-ENACTMENT PROOFS FOR VERIFIED ASSETS`

### Master prompt

```text
Create an ultra-wide GitHub README banner for MERIDIAN at exactly 2560 by 720 pixels. Use the attached Meridian mark without changing its geometry.

The left 58% is the mechanism: a dark policy-space field in #06080D, one fine vertical cyan meridian line, a circular policy boundary, and a compact constellation of approximately 48 holder nodes caught halfway through a proof sweep. The wavefront is a crisp cyan arc. Behind it, most nodes are eligible green and exactly three are amber or red; ahead of it, nodes are neutral pale blue. Keep this concrete and inspectable, like a technical instrument, with no fake UI cards.

The right 42% is a disciplined brand lockup on a calm dark field. Place the supplied mark, then typeset exactly:

MERIDIAN
Compliance that can see.
PRE-ENACTMENT PROOFS FOR VERIFIED ASSETS

Use a geometric sans serif similar to Geist. MERIDIAN is pale ink (#E8EDF8), uppercase, weight 600, zero letter spacing. The tagline is #9AA8C7 and sentence case. The final descriptor is small uppercase #53E1F9 with modest positive tracking. No other text is allowed. Preserve at least 96 pixels of clear margin on every side and keep all type vertically centered.

Visual tone: institutional, exact, calm, premium, and mechanism-first. Matte near-black materials, very thin technical lines, restrained phosphor cyan, small semantic status colors, crisp detail, and 2% grain. It should remain legible on GitHub at approximately 1280 by 360.
```

### Negative prompt

```text
misspelling, extra words, malformed logo, decorative badge, fake browser chrome, nested cards, crypto coin, blockchain links, shield, lock, handshake, people, globe, city, rocket, cyberpunk, neon purple, magenta, rainbow, beige, orange-dominant color, excessive bloom, lens flare, bokeh, orb, fog, clutter, watermark, low-resolution text
```

### Acceptance checklist

- Exact 2560 x 720 dimensions and correct three-line copy.
- Mechanism occupies the left; lockup occupies the right; neither is cropped at GitHub widths.
- The image still reads when scaled to 50%.
- No unsupported claim, metric, contract address, or date appears in the artwork.

## Delivery

1. Export final PNGs in sRGB at the exact paths above.
2. Run an image metadata check for dimensions and color profile.
3. Inspect each at 100%, 50%, and mobile crop.
4. Optimize losslessly; do not introduce visible banding around the cyan wavefront.
5. Commit generated assets in a dedicated in-window commit with the generator and selection notes in the commit body.