# 16 — DEMO PRODUCTION KIT (do these steps in order)

*Everything needed to produce the winning demo video in one sitting. Every number in this kit was read off the live production app on 2026-08-09. Follow it top to bottom: voice first, then screen, then edit, then upload.*

**The one rule that protects your recording:** the demo state (enacted v2, executed coupon run) lives in your browser tab. **Navigate ONLY with the left sidebar. Never press refresh, never press F5, never close the tab** — a refresh resets the book to v1 and you must redo the sweep/enact before continuing.

---

## PART A — Voiceover (ElevenLabs) — do this FIRST

### A1. Settings (once)

1. Go to elevenlabs.io → **Text to Speech**.
2. Voice: **Daniel** (fallback: **Brian**).
3. Model: **Eleven Multilingual v2** (or the highest-quality available).
4. Sliders: **Stability 55 · Similarity 80 · Style 25 · Speed 0.98**.
5. Make a folder on your computer: `Meridian Demo/Voice`.

### A2. Generate each clip separately

Paste ONE box at a time, generate, listen once, download, and name the file exactly as shown. If a word sounds wrong, regenerate just that clip.

Pronunciations: **Meridian** = "muh-RID-ee-un" · **Monad** = "MOH-nad" · **RPC** = say the letters "R-P-C" · **Cleanverse** = "clean verse".

**VO-01 — `01-hook.mp3`** (~4s)
> Nobody can tell you what a compliance rule will do before it becomes law.

**VO-02 — `02-mechanism.mp3`** (~7s)
> Meridian issues pre-enactment proofs: measured before law, anchored on Monad, and publicly verifiable.

**VO-03 — `03-problem.mp3`** (~8s)
> Compliance policy is executable, but issuers still sign rule changes blind, and discover the damage after the fact.

**VO-04 — `04-order.mp3`** (~7s)
> Meridian changes the order: simulate the rule, anchor its exact blast-radius proof, then enact.

**VO-05 — `05-book.mp3`** (~14s)
> The Book: forty-eight holders — every credential and position evaluated against the active policy. Every panel names its source. Simulated means labeled. Live means independently provable.

**VO-06 — `06-draft.mp3`** (~10s)
> A sanctions update lands on your desk: blacklist two jurisdictions, and raise the verification floor to tier thirty. Watch the policy frontier move.

**VO-07 — `07-sweep.mp3`** (~14s)
> Sweep. Twelve holders lose eligibility. Three hundred forty-two thousand, two hundred nineteen dollars loses transferability. Seven coupons are at risk — and you know all of it before a single signature.

**VO-08 — `08-enact.mp3`** (~12s)
> Enact. The demo labels its simulated writes honestly — and content-addresses the exact sweep into a proof digest. On the deployed primitive, that digest is not a claim. It is public state.

**VO-09 — `09-verify.mp3`** (~14s)
> No login. No wallet. No trust in Meridian's server. A public R-P-C call proves the proof was anchored before enactment, consumed by the active policy, and bound to its exact rule and lineage.

**VO-10 — `10-coupons.mp3`** (~16s)
> The coupon run pays five legs, and suspends seven into escrow — exactly the seven the sweep predicted. Prediction equals outcome. Money caught, not lost. Release is refused until the holder re-verifies — then eligibility is re-proven, and payment completes.

**VO-11 — `11-agent.mp3`** (~12s)
> Meridian also publishes its own Agent Skill — the same pattern Cleanverse uses for ClevrPay. Agents query the book and simulate policy. But there is no write endpoint. Only a human can enact.

**VO-12 — `12-judge.mp3`** (~13s)
> One command. A hundred and two thousand property cases. Five hundred differential vectors. Nine of nine live sandbox calls. Deployed contracts. The repo audits itself, in front of the judge.

**VO-13 — `13-close.mp3`** (~8s)
> Cleanverse made compliance executable. Meridian makes it provable — before it becomes law. Compliance… that can see.

Total narration ≈ 2:20, which lands the final cut near 3:00–3:15.

---

## PART B — Screen recording (like you've never done this before)

### B1. Set up (10 minutes)

1. Install **OBS Studio** (free, obsproject.com) — or use CapCut/QuickTime screen capture if you already know it.
2. In OBS: **Settings → Video** → Base and Output resolution `1920×1080`, FPS `60`. **Settings → Output** → Recording quality "High", format `mp4`.
3. Add a source: **Display Capture** (records the whole screen). Mute the mic source — the voice comes from ElevenLabs.
4. Chrome: new window, **100% zoom** (Ctrl/Cmd+0), hide bookmarks bar (Ctrl/Cmd+Shift+B), close every other tab, turn on Do Not Disturb.
5. Make the browser **full screen** (F11 on Windows, ⌃⌘F on Mac).
6. Open https://meridian-three-olive.vercel.app and keep the site in **dark mode** (default).
7. Folder for clips: `Meridian Demo/Screen`.

**How to record each shot:** press record in OBS, do the actions slowly (move the mouse like it's heavy), count two seconds of stillness at the start and end, stop recording, rename the file to the shot name. Short clips are better than one long take — you can redo any shot alone.

### B2. The shots, in order

**SHOT-A — `A-landing.mp4`** (~20s of footage)
1. Go to `meridian-three-olive.vercel.app`.
2. Sit still on the hero for 4 seconds.
3. Scroll down SLOWLY (three gentle mouse-wheel notches) until the three cards "See / Sweep, then sign / Prove" fill the screen.
4. Sit still 3 seconds. Stop.

**SHOT-B — `B-book.mp4`** (~25s)
1. Click **Open console** (top right).
2. Wait for the map — dots appear, numbers count up. Don't move the mouse while they do.
3. Slowly move the cursor over one green dot, pause; then over one red dot, pause.
4. Click the dot named **Amara Iyer** (top area, SG lane) — a panel opens on the right.
5. Rest the cursor near the `SIMULATED · DEMO` chip for 2 seconds. Stop.

**SHOT-C — `C-studio-sweep.mp4`** (~35s) — **the signature shot, do 3 takes, keep the best**
1. In the left sidebar click **Policy Studio**.
2. Drag the **MINIMUM VERIFICATION TIER** slider slowly from 10 to exactly **30** (watch the little `10 → 30` label appear).
3. In **JURISDICTIONS (DENY LIST)** click **KP**, then **IR**.
4. Move the mouse away from the buttons. Breathe.
5. Click **Run sweep**. DO NOT MOVE THE MOUSE — let the wavefront cross and the counters settle.
6. After they settle, slowly move the cursor to the **VALUE STRANDED $342,219** card and hold 3 seconds.
7. Scroll down a touch to show the **BLAST RADIUS — 12 HOLDERS** table. Hold 3 seconds. Stop.

Numbers you must see (they are deterministic): **12 newly ineligible · $342,219 stranded · 7 coupons at risk**. If you see different numbers you refreshed mid-flow — refresh once fully and redo SHOT-C from step 2.

**SHOT-D — `D-enact.mp4`** (~20s) — continue in the same tab, do NOT refresh
1. Click **Enact as v2**.
2. The right panel flips: green "before · transfer settled" → red "after · Jurisdiction not permitted", and a **sweep digest** hash pill appears under "PROOF BEFORE LAW".
3. Hover the digest pill 2 seconds (don't click). Note the honest label `SIMULATED · DEMO`. Stop.

**SHOT-E — `E-verify.mp4`** (~25s)
1. In the left sidebar click **Public Verifier**.
2. The page auto-verifies against Monad: green **"Pre-enactment proof verified"**.
3. Slowly move the cursor down the right column: **Proof state: Consumed** → the four hashes → **Anchored 2026-08-08 06:50:55 · Enacted 06:50:56**.
4. Hold on the timestamps 3 seconds — this is the "anchored BEFORE enacted" beat. Stop.

**SHOT-F — `F-coupons.mp4`** (~35s) — sidebar again, still no refresh
1. Click **Distributions**.
2. Click **Execute run (12 legs)**. Rows resolve: 5 green `paid`, 7 amber `suspended`.
3. Hold on the stat cards 2 seconds: **PAID 5 · IN SUSPENSE ESCROW 7 / $6,314 recoverable** (the sweep said "7 coupons / $6,314 would suspend" — same numbers).
4. On the **Amara Iyer** suspended row, click **Release** → it is refused (row shows the refusal).
5. Click **Remediate** on that row, then **Release** again → the row flips to green `released — released after re-verification`. Stop.

**SHOT-G — `G-agent.mp4`** (~25s)
1. Click **Agent Surface**.
2. Click **Run agent scenario**. The transcript types itself.
3. Wait for the last line: *"NOTE: enactment requires your signature in the Studio — this surface cannot write."* Hold 3 seconds.
4. Slowly hover the SKILL.md panel on the right showing `no enact/write endpoint exists`. Stop.

**SHOT-H — `H-evidence.mp4`** (~15s, optional but strong)
1. Click **Evidence**, then the **v2** tab.
2. Show: rule JSON → **PRE-ENACTMENT PROOF** digest → **AFFECTED HOLDERS (12)** → audit trail with the `enact` entry. Stop.

**SHOT-I — `I-judge.mp4`** (~20s)
1. Open your terminal in the repo, font size 16+, cleared screen (`clear`).
2. Type `pnpm judge` and press Enter. (It takes ~3 minutes; you will CUT this in the edit — record the start, then stop recording, run it to completion, and record a second clip `I2-judge-done.mp4` of the final green scoreboard: nine ✓ rows and `9/9 proof surfaces green`.)

**SHOT-J** — no recording needed: the end card is a picture, added in the edit.

### B3. Rescue rule

If anything looks wrong mid-shot: stop, refresh the page fully ONCE, then redo in this order — SHOT-C → D → E → F → G → H (the state chain). Shots A, B, I don't depend on state.

---

## PART C — Edit (CapCut, free)

1. New project → click the ⚙ near the ratio picker → **1920×1080, 60fps**.
2. Import the `Voice` and `Screen` folders.
3. **Lay the voice first:** drag VO-01…VO-13 onto the audio track in order, leaving a ~0.4s gap between clips.
4. **Cover each voice clip with its footage** on the video track above:
   - VO-01 → SHOT-C (only the wavefront + counters part — start the clip right as you press Run sweep)
   - VO-02 → SHOT-E (the green verified panel)
   - VO-03 → SHOT-A (hero + scroll)
   - VO-04 → SHOT-A (hold on the three cards)
   - VO-05 → SHOT-B
   - VO-06 → SHOT-C (slider drag + KP/IR clicks)
   - VO-07 → SHOT-C (sweep settle + $342,219 + table)
   - VO-08 → SHOT-D
   - VO-09 → SHOT-E (hashes + timestamps)
   - VO-10 → SHOT-F
   - VO-11 → SHOT-G
   - VO-12 → SHOT-I (typing) then jump-cut to I2 (green scoreboard)
   - VO-13 → `docs/assets/end-card.png` (drag the image, stretch to ~6s)
5. Trim video, never audio: select a video clip, drag its edges so the action lines up with the words. Cut dead mouse time with the razor.
6. **Captions:** Text → **Auto captions** → English. Fix "Meridian", "Monad", "Cleanverse", "pre-enactment" (auto-captions will misspell them). Font: default bold, white, bottom-center, max 2 lines.
7. **Music (optional):** CapCut library → search "dark ambient minimal" → volume **−26 dB** so the voice dominates. No music over VO-01/VO-02.
8. Watch it twice: once normal, once **muted** (judges often watch muted — captions must carry it).
9. **Export:** 1080p, 60fps, bitrate "Recommended/High", H.264 → save to `Meridian Demo/Final`.

---

## PART D — Cards (already made — in the repo)

| Asset | File | Use |
|---|---|---|
| End card 1920×1080 | [docs/assets/end-card.png](assets/end-card.png) | Last 5–6 seconds of the video, under VO-13 |
| YouTube thumbnail 1280×720 | [docs/assets/thumbnail.png](assets/thumbnail.png) | Upload as custom thumbnail |
| README banner | [docs/assets/banner.png](assets/banner.png) | Already in the README |

Download them from GitHub (open the file → Download raw) or copy them out of your local clone.

---

## PART E — Optional Veo 3.1 interstitials (only if you have spare time)

The video is complete without these. If you want two cinematic bookends, generate with Veo 3.1 and drop them under VO-03 (opener) and behind VO-13 (closer). Full art direction lives in [docs/prompts/videos.md](prompts/videos.md); short forms:

**Opener (8s, 16:9):**
> Cinematic macro shot inside a dark institutional trading floor at night, deep navy palette (#06080D background, cyan #53E1F9 accent light). A wall of paper compliance memos and spreadsheet printouts slowly dissolves into drifting particles of light that reorganize into a clean constellation of small glowing nodes connected by thin meridian lines. Slow dolly-in, shallow depth of field, no people, no text, no logos. Mood: calm, precise, expensive. Single continuous shot, 8 seconds, 24fps, photorealistic with subtle film grain.

**Closer (8s, 16:9):**
> A minimal dark scene: a single vertical cyan meridian line of light (#53E1F9) bisects the frame on a near-black navy field (#06080D). Dozens of tiny node lights along an elliptical orbit pulse gently from red to green as a soft wavefront of light passes across them left to right. After the wave passes, the field settles into perfect stillness. Slow, almost imperceptible camera push-in. No text, no logos, no people. Mood: resolution, proof, certainty. Single shot, 8 seconds, 24fps, photorealistic, subtle film grain.

(Nano Banana Pro image assets — hero, OG, banner — are already generated and shipped; no further image generation is needed.)

---

## PART F — Upload + submit

1. Upload the export to YouTube as **Unlisted**. Title: `Meridian — Pre-enactment Proofs for Cleanverse (RWA track)`.
2. Custom thumbnail: `thumbnail.png`.
3. Description (paste):
   `Repo: https://github.com/iamdflame/meridian · Live: https://meridian-three-olive.vercel.app · Verify: https://meridian-three-olive.vercel.app/verify · Receipts: https://github.com/iamdflame/meridian/blob/main/docs/deployments.md`
4. Open the link in an incognito window — confirm it plays.
5. Put the URL into the `[LINK]` line of [docs/06-submission.md](06-submission.md), fill your real team background, and send the submission email **before Aug 9, 23:59 UTC**.
