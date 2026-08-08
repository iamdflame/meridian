# Meridian video-generation prompts

**Generator:** Veo 3.1  
**Purpose:** two cinematic interstitials inside the live-product demo  
**Edit timeline:** [`../13-video.md`](../13-video.md)  
**Reference input:** attach `web/public/brand/logo.svg` only when a shot explicitly requests the mark

Generate the clips separately. These are short transitions around real screen recordings; they must never imitate or replace the working product UI.

## Shared continuity bible

- Format: 16:9, 3840 x 2160, 24 fps, 8 seconds, progressive, high bitrate.
- Camera: physically plausible, slow, stable, and deliberate. No handheld shake and no speed ramps.
- Grade: deep ink `#06080D`, pale ink `#E8EDF8`, proof cyan `#53E1F9`; tiny semantic accents may use green, amber, or red.
- Material language: matte chart table, fine technical paper, black glass, restrained phosphor light, subtle atmospheric depth.
- Motif continuity: one vertical meridian line, one circular policy boundary, small holder nodes, one proof wavefront.
- Motion continuity: cyan energy always travels left-to-right or outward from the meridian. It never reverses.
- Tone: Act 1 begins uncertain and resolves toward control. Act 3 begins with one verified proof and expands toward a public primitive.
- Sound: generate silent footage. Voiceover and music are added in the edit.
- No people, faces, hands, dialogue, captions, UI panels, or generated software screens.
- No logos or text inside either clip; the editor adds the real SVG end card after Act 3.
- Avoid sci-fi spectacle. This is institutional compliance infrastructure, not a movie trailer for cryptocurrency.

## 1. Act 1 opener: blind policy becomes visible

**Output:** `media/veo-act1.mp4`  
**Timeline use:** 0:10-0:18 in the final demo  
**Duration:** exactly 8 seconds  
**Transition out:** final frame must cut cleanly to the real Meridian landing page

### Master prompt

```text
Create an eight-second, 16:9, 4K cinematic opener for MERIDIAN, an institutional system that reveals the impact of a compliance policy before the policy becomes law. Silent footage, no text, no logos, no people.

0.0-2.0 seconds: Begin on a near-black matte chart table viewed from a low, shallow overhead angle. The room is dark and controlled, colored deep ink black with a cold blue cast (#06080D). On the table are only three physical artifacts: one unsigned policy memo, one sparse spreadsheet printout, and one thin circular jurisdiction map. Their printed details are deliberately out of focus and unreadable. The camera performs a very slow forward dolly. The papers feel isolated and incomplete, suggesting a policy decision made without visibility.

2.0-4.0 seconds: A faint cold draft passes across the table. The memo and spreadsheet do not fly away; instead, their ink and paper fibers dissolve quietly into fine dark particles that sink into the matte surface. Keep the effect physically restrained, elegant, and nearly silent in appearance. As the paperwork disappears, a hairline vertical cyan meridian (#53E1F9) begins to glow beneath the table surface.

4.0-6.5 seconds: The cyan line ignites from the bottom edge toward the top at a measured pace. Where it passes, a precise circular policy boundary and a field of tiny holder nodes become visible beneath black glass. A thin proof wavefront moves outward from the meridian. Neutral nodes behind the wavefront resolve into mostly eligible green, with exactly three turning amber or red. The geometry is crisp and legible, never cluttered.

6.5-8.0 seconds: The camera settles directly above the now-visible policy field. The meridian is centered, the proof wavefront completes one calm pass, and the status nodes hold steady. End on a dark, balanced composition with the upper center free of detail so the next cut to Meridian's real landing-page headline feels continuous. No fade to white; hold the final dark frame for at least six frames.

Use physically plausible depth of field, precise technical geometry, matte materials, restrained phosphor cyan, minimal 2% grain, and smooth cinematic motion. Emotional arc: blind uncertainty becomes measured control. No dramatic explosion, no frantic movement, no cyberpunk interface.
```

### Negative prompt

```text
words, readable document text, captions, subtitles, logo, watermark, person, face, hands, office workers, city skyline, globe, planet, coin, token, blockchain links, padlock, shield, handshake, fake software UI, sci-fi HUD, cyberpunk, neon purple, magenta, rainbow, orange-dominant lighting, lens flare, bokeh orbs, smoke cloud, fire, sparks, explosion, paper flying, camera shake, whip pan, speed ramp, timelapse, morphing artifacts, low-resolution geometry, excessive blur
```

### Acceptance checklist

- Exactly 8 seconds, 4K, 24 fps, silent, with no text or people.
- Paperwork is clearly present first and disappears without melodrama.
- Meridian, policy circle, nodes, and proof wavefront become legible by second 6.
- Final frame is dark and stable enough to cut into the real landing page.
- No simulated product UI appears.

## 2. Act 3 closer: one proof becomes a public primitive

**Output:** `media/veo-act3.mp4`  
**Timeline use:** immediately before the 3:00-3:05 end card  
**Duration:** exactly 8 seconds  
**Transition out:** final 0.75 seconds must be a clean dark field for the real logo overlay

### Master prompt

```text
Create an eight-second, 16:9, 4K cinematic closing interstitial for MERIDIAN. It follows real footage proving a policy on-chain and should communicate that one issuer's proof can become infrastructure any protocol can consume. Silent footage, no text, no generated UI, no people, and no logo inside the generated clip.

0.0-1.75 seconds: Start in extreme macro on one crisp holder node embedded in matte black glass. The node is pale ink white (#E8EDF8) with a fine cyan ring (#53E1F9). A single measured pulse travels through the ring like a proof becoming final. The camera is perfectly stable with shallow but physically plausible depth of field.

1.75-4.25 seconds: Pull back slowly and continuously. Reveal that the node sits on one luminous vertical meridian crossing a precise circular policy boundary. Around it are dozens of small verified nodes connected only by faint geometric alignment, not web-like chain links. A thin cyan proof wavefront expands outward. Behind it, nodes resolve into restrained eligible green, while a few amber and red nodes remain visibly identified as risk. The scene stays sparse and highly legible.

4.25-6.75 seconds: Continue the pullback to reveal several neighboring policy circles aligned along multiple fine meridians across a vast dark field. The original proof pulse propagates into these neighboring systems as a clean, low-intensity cyan signal. Each system remains independent but can read the same proof primitive. Suggest scale through geometry and depth, not a literal planet, globe, map, or city. The motion is hopeful and expansive without becoming grandiose.

6.75-8.0 seconds: The field's lights settle. The geometry recedes smoothly into deep ink black while one centered cyan meridian remains for a moment, then dims. Preserve a completely clean dark center and hold the last 0.75 seconds nearly still so the editor can hard-cut or overlay the real Meridian SVG, tagline, repository URL, and contract references. Do not generate those words yourself.

Use deep ink black (#06080D), restrained pale ink, one dominant proof cyan, tiny semantic green/amber/red accents, matte black glass, precise technical linework, subtle atmospheric depth, smooth dolly motion, and 2% cinematic grain. Emotional arc: one verified event becomes shared, inspectable infrastructure. Calm confidence, no hype.
```

### Negative prompt

```text
text, letters, numbers, caption, subtitle, logo, watermark, generated end card, person, face, hands, crowd, city, skyline, literal earth, globe, planet, stars, galaxy, rocket, satellite, coin, token, chain links, neural network brain, padlock, shield, fake dashboard, sci-fi HUD, cyberpunk, neon purple, magenta, rainbow, orange-dominant palette, lightning, explosion, lens flare, bokeh orb, fog wall, excessive bloom, camera shake, fast zoom, whip pan, speed ramp, looping pulse, low-resolution nodes, clutter
```

### Acceptance checklist

- Exactly 8 seconds, 4K, 24 fps, silent, and visually continuous with Act 1.
- Starts on one proof node and reveals multiple independent policy systems.
- No globe, generic network web, generated UI, text, or logo.
- Last 0.75 seconds is stable, dark, and suitable for the real end-card overlay.

## Edit and delivery

1. Export both masters in the highest-quality codec available, then create H.264 edit proxies if needed.
2. Keep generated footage silent; add narration and any ambient bed in the final edit.
3. Use straight cuts or a six-frame dissolve only. Do not add glitch transitions.
4. Overlay all words, logos, URLs, hashes, and captions in the editor from real source assets.
5. Check every frame for accidental text, logos, faces, and malformed geometry before use.
6. Commit selected clips or their immutable hosted URLs in a dedicated in-window commit with generation settings recorded in the commit body.