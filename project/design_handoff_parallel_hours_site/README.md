# Handoff: Parallel Hours — Immersive Studio Website

## Overview
A single-page, scroll-driven, award-style website for a fictional interactive studio, "Parallel Hours". The page is one continuous WebGL world told in six scenes (Introduction → Discovery → Transformation → Worlds → Index → Finale). A live 3D faceted chrome object persists behind all content and is choreographed by scroll: solid → noise-deformed → fractured into ~16.8k triangles → constellation → reassembled at the finale.

## About the Design Files
`Parallel Hours.dc.html` is a **design reference built in HTML** (a self-contained prototype; `support.js` is its runtime — open the .dc.html in a browser to run it). It is not production code to ship. Recreate it in a real stack. No codebase exists yet, so the recommended stack is:

- **Next.js (App Router) + TypeScript**
- **React Three Fiber + drei** for the 3D layer (port the GLSL verbatim from the prototype)
- **GSAP + ScrollTrigger** for pinned/scrub scenes, **Lenis** for smooth scroll
- Plain CSS Modules or Tailwind for styles (tokens below)

All shader source (vertex/fragment for the object and particles), the scroll choreography math, the generative canvas art, and the sound engine live in the `<script data-dc-script>` block of the .dc.html — read it as the spec.

## Fidelity
**High-fidelity.** Final colors, type, copy, spacing, motion timings and interactions. Recreate pixel-faithfully. Project imagery is procedural placeholder art (see Assets) — to be replaced with real work.

## Current tweak defaults (user-chosen — use these)
- **Accent:** `#C8FF3C` (acid lime). Alternatives explored: `#FF4A1C`, `#7C8CFF`, `#EDE8DF`
- **Motion intensity:** `2` (multiplies the object's noise displacement amplitude; range 0.3–2)
- **Film grain:** on

Expose accent as a CSS custom property `--acc` and feed the same value to the shader uniforms `uAccent`.

## Global layers (z-order, bottom → top)
| z | Layer |
|---|---|
| 0 | Fixed full-viewport WebGL canvas (pointer-events none) |
| auto | `<main>` scrolling content (no z-index, so `mix-blend-mode: difference` on headlines blends with the canvas) |
| 20 | Index hover preview (fixed, follows cursor) |
| 55 | Grain overlay (fixed, inset −50%, SVG fractalNoise, opacity .09, overlay blend, jittered ±5% every 4 frames) |
| 60 | Scroll progress indicator (bottom-right) |
| 70 | Full-screen menu |
| 75 | Header (difference blend) |
| 85 | Scene-transition wipe |
| 95 | Preloader |
| 100/101 | Custom cursor ring / dot |

## Screens / Scenes

### Preloader
- Full-screen `#0B0B0C`, padding 22px 28px. Top row mono: "Parallel Hours" / "Loading world" (62% bone).
- Bottom-left: Instrument Serif italic "Motion is a material." `clamp(22px,2.4vw,38px)`.
- Bottom-right counter `000`→`100`: Big Shoulders Display 200, `clamp(120px,22vw,400px)`, line-height .78, tabular nums.
- 2px accent bar at bottom, `scaleX(0→1)`.
- Timing: 1300ms ease-out-cubic; holds at 92% until 3D is ready; hard fallback exit at 3.2s. Exit: `translateY(-100%)` 1.1s `cubic-bezier(.76,0,.24,1)`. Reduced motion: 250ms.
- Skip/simplify when load is fast (it is only ~1.3s).

### Header (fixed)
- Padding 22px 28px, `mix-blend-mode: difference`.
- Logo (link to top): stacked "PARALLEL" (800) / "HOURS" (200), Big Shoulders 20px, lh .85.
- Right: Sound toggle (4 bars 2px wide, 3–12px animated heights when on + "Sound off/on", mono 11px .1em uppercase) and Menu button ("Menu"/"Close" + 26×10 two-line icon morphing to an X: lines rotate ±45° and meet at top 4px, 500ms `cubic-bezier(.76,0,.24,1)`). Both are magnetic.

### Scene 01 — Introduction (hero, 100svh, min 600px)
- Meta row at top 92px: `[ 38.7223° N — 9.1393° W ]` · `Independent interactive studio` · `Scene 01 / Introduction` (mono 11px, .08em, 62% bone).
- `<h1 aria-label="Motion is a material">`, Big Shoulders Display 800 uppercase, `clamp(84px,21vw,440px)`, lh .8, `mix-blend-mode: difference`:
  - Line 1 "MOTION" and line 3 "MATERIAL" split into per-character spans.
  - Line 2: Instrument Serif italic "is a" at .36em in accent + mono note "(n.) the thing we shape, bend and set loose in the browser." (max 24ch).
- Intro: each char rises from `translateY(110%)` inside its own overflow mask, 1.4s `cubic-bezier(.16,1,.3,1)`, 45ms stagger, starting 380ms after preloader exit.
- Hover on a char: font-weight 800 → 200 (variable font), 600ms.
- Scroll-out (hp = scrollY/vh): line 1 chars drift left, line 3 right: `x = ±hp·vw·.35·(.4+r)`, `y = −hp·vh·(.15+.7r)`, `rotate((r−.5)·hp·44deg)`, opacity `1 − smoothstep(.35,1,hp)`. r = per-char random.
- Bottom row: "Scroll to begin" with 1×28px line; right: "Hold anywhere to charge" + 140×1px meter (accent fill = charge).
- Cursor label: "Drag · Hold".

### Scene 02 — Discovery (manifesto)
- Grid `1fr 5fr`, gap 4vw, padding 24vh 28px 26vh. Left: sticky vertical label "02 — Discovery" (writing-mode vertical, rotated 180°).
- Paragraph in Instrument Serif `clamp(34px,5.4vw,100px)`, lh 1.02, word-split. Copy:
  "Parallel Hours is an independent studio for interactive worlds. We treat code like *clay,* light like *paint* and scroll like *time* — building experiences people don't just see, but remember with their hands." (starred words italic + accent)
- Word reveal: opacity .14 → 1 scrubbed by section progress `(vh·.85 − top)/(height·.62)`.
- Three notes (mono 12px, lh 1.6, 1px top rule at 20% bone, auto-fit min 220px): "↳ Live object. …", "↳ Touch it. …", "↳ Listen. …" (see file for exact copy).

### Scene 03 — Transformation (pinned, 440vh)
- Sticky 100svh stage with center crosshair lines (8% bone).
- Top row: "03 — Transformation" + live readout "Fragments 16,820 · Separation 0.00 · Twist 0.00".
- Bottom-left rolling numeral 01/02/03: Big Shoulders 200, `clamp(110px,19vw,360px)`, 1em mask, column slides `translateY(−idx em)` 1s `cubic-bezier(.76,0,.24,1)`.
- Bottom-right captions (max 420px) crossfade ±28px, 700ms: Stage 01 **Solid**, Stage 02 **Fracture**, Stage 03 **System** (accent kicker, Big Shoulders 700 `clamp(44px,5vw,76px)`, body mono 13px/1.65 at 78% bone).
- Progress line + labels SOLID / FRACTURE / SYSTEM (active = bone, inactive 40%).
- Stage thresholds on pin progress tp: <.34, <.67, else.

### Marquee (part of scene 04)
- Row A: bone band, ink text, rotated −3deg. Row B: transparent, 1.5px accent text-stroke, rotated 2deg. Big Shoulders 800 `clamp(56px,9vw,170px)`.
- Copy A: "DESIGN ✶ MOTION ✶ INTERACTION ✶ WEBGL ✶ SOUND ✶"; B: "WORLDS ✶ OBJECTS ✶ SIGNALS ✶ STORIES ✶".
- Speed `(70 + min(900, |velocity|·40)) px/s`, direction flips with scroll direction, rows opposite; skewX = clamp(−velocity·.5, ±12deg).

### Scene 04 — Selected worlds (horizontal scroll)
- Section height = `trackWidth − vw + vh` (recompute on resize/font load; never 0). Sticky 100svh stage; track `translateX(−progress·(trackW−vw))`, lerped .14.
- Track: gap 7vw, padding 14vh 8vw. Intro panel (min(560px,78vw)): label, h2 "SELECTED / WORLDS" `clamp(72px,10vw,190px)` + serif italic accent "(05)", body copy, "Keep scrolling →".
- 5 plates, asymmetric sizes/alignments:
  | # | Title | Discipline | Year | Width | Height | Align |
  |---|---|---|---|---|---|---|
  | 01 | Tidal Archive | Installation · WebGL | 2026 | max(36vw,300px) | 60vh | center |
  | 02 | Hollow Choir | Album world · Spatial sound | 2025 | max(24vw,250px) | 44vh | end |
  | 03 | Atlas of Slow Things | Data story · Editorial | 2025 | max(40vw,320px) | 50vh | start |
  | 04 | Ferrous | Real-time 3D configurator | 2024 | max(26vw,260px) | 58vh | center |
  | 05 | Night Shift Museum | Virtual exhibition | 2024 | max(32vw,280px) | 46vh | end |
- Plate reveal: `clip-path: inset(18%·(1−rv) 100%·(1−rv) 18%·(1−rv) 0)` where rv = smoothstep of `(vw − left)/(vw·.5)`; inner image parallax ±7% and scale 1.15→1.05. Hover: box scale .97 (600ms), title → accent. Cursor "View".
- Ends with "FULL / INDEX / ↓" panel.

### Scene 05 — Index
- h2 "INDEX" `clamp(64px,9vw,170px)` + "05 — Archive 2019 → 2026".
- 6 rows (the 5 above + "06 Paper Satellites — Learning game · Mobile — 2023"). Grid `48px 1fr auto`, padding 22px 0, 1px top rule 18%. Title Big Shoulders 700 `clamp(40px,6.4vw,112px)`.
- Hover/focus row: others dim to .25; active title shifts 2.4vw and turns accent; a 4:5 preview (min(26vw,380px)) follows the cursor with lerp .12 and slight rotation, opening via clip-path inset 50%→0 over 600ms. Short tone per row when sound is on. Cursor "Open". Rows are focusable (tabindex 0).

### Scene 06 — Finale
- "SAY HELLO" per-char, Big Shoulders `clamp(80px,17vw,340px)`, difference blend. Chars rise in on entry; each char's font-weight = 200 + 700·(1 − dist/(vw·.22)) to the cursor.
- Serif italic "— we usually reply within one parallel hour."
- Magnetic pill `mailto:hello@parallelhours.studio →`: 1px bone border, radius 999, padding 22px 34px; hover fills accent, ink text. Cursor "Write".
- Footer (auto-fit min 170px): live Lisbon + Montréal clocks (HH:MM:SS, 1s), socials, "© 2026 Parallel Hours", "Back to the surface ↑" (triggers wipe to top).

### Full-screen menu
- Bone `#EDE8DF` background, ink text. Opens with `clip-path: circle(0% → 150% at calc(100% − 50px) 34px)` 950ms `cubic-bezier(.76,0,.24,1)`.
- Ordered list of the 6 scenes (01–06), Big Shoulders 800 `clamp(40px,min(8vw,10.5vh),132px)`; items slide up from 110% with 280ms + 50ms stagger. Hover: accent, weight 300, padding-left 3vw.
- Footer: email + "Esc to close". Esc closes; closed items get tabindex −1 and aria-hidden.

### Scene transition (menu nav / logo / back-to-top)
- Accent panel wipes up to cover (600ms `cubic-bezier(.76,0,.24,1)`) showing the target scene name huge in ink → instant scroll jump → wipes off upward → resets. Reduced motion: direct jump.

### Scroll progress (fixed bottom-right)
- "0N / 06" + scene name, and a 52px SVG ring (r 24, 1px 20% track, 1.5px progress stroke, dasharray 150.8) with percentage in the middle. Difference blend.

### Custom cursor (fine pointers only; hidden on touch)
- 5px accent dot (exact position) + 38px 1px bone ring (lerp .2).
- States: link/button → 64px, 12% bone fill; labelled zones (`data-cursor`: Drag · Hold, Scroll, View, Open, Write, Go) → 92px accent fill with 10px mono ink label. 450ms `cubic-bezier(.16,1,.3,1)`. Ring scales up to 1.5× while charging.
- Magnetic elements: within `max(w,h)·.75 + 36px`, translate by 30% of the cursor offset, lerp .15, return to 0 on leave.

## 3D System (port to R3F)
- Camera: perspective 35°, z 6; follows mouse (x ±.25, y ±.15) and lookAt origin.
- Object: `IcosahedronGeometry(1.25, 28)` (14 on mobile/low tier), non-indexed. Per-triangle attributes `aCenter` (vec3 face centroid) and `aRand` (float).
- Vertex: 2-octave simplex noise displacement along the normal (amp = uNoise + charge·.3), charge shiver; explode = rotate each face around its own centroid and push it out along the centroid normal by `uExplode·(.35 + 1.3·aRand)·1.6`, shrink up to 35%; Y-twist `uTwist`.
- Fragment: flat facet normals via `dFdx/dFdy`; fake studio softboxes on reflection vector, Blinn-ish spec (70), accent Fresnel rim, accent "heat" in displaced crevices. Near-black base (.022).
- Two thin orbit rings (r 2.05, 2.45), bone at ~.22 opacity, counter-rotating.
- Particles: 3200 (1000 low tier) points in a 2.6–8.1 radius shell, drifting; 6% are accent.
- Choreography (targets lerped at .07/frame):
  - Hero: x 1.35 (mobile 0, y .62), scale 1, noise .22.
  - Entering Discovery: x → −1.7, scale → .7.
  - Entering Transformation: x → 0, scale 1.05. Within pin: s1 = sstep(0,.3) adds noise +.22 and dolly z → 4.7; s2 = sstep(.3,.62) explode → .55 + heat; s3 = sstep(.62,.95) explode +1.3, twist 1.4, z → 6.5, particle spread .5.
  - Entering Worlds: explode → 2.6, opacity → .28 (background constellation).
  - Finale: everything reassembles (explode 0, opacity 1, scale .85, centered, noise .34).
  - Noise × intensity (default 2). Hold to charge: charge += .75/s while held, −1.6/s on release; speeds rotation, adds heat.
  - Drag adds rotational velocity (decay .93).
- Device tiers: low (mobile or ≤4 cores) → lower detail, fewer particles, DPR ≤1.5, no AA. Add adaptive DPR (drei `<AdaptiveDpr>`) and pause rendering when the tab is hidden.

## Sound (optional, off by default)
Web Audio, only after the user turns it on: master gain .5; drone = saw 55Hz + sine 82.5Hz → lowpass 300Hz (pitch and cutoff rise with charge); UI blips = sine with pitch drop over 250ms (hover 1320Hz, stage change 440/587/784Hz, row hover 520+90·i Hz).

## Motion tokens
- Easing: `--ease-out: cubic-bezier(.16,1,.3,1)`; `--ease-inout: cubic-bezier(.76,0,.24,1)`
- Micro 150–300ms (color, opacity, cursor label); Component 450–700ms (captions, hover scale, cursor size); Section 800–1100ms (menu, preloader, numeral roll); Cinematic 1.3–1.4s (hero intro), continuous scroll-scrub for 3D.
- Lerp constants: mouse .07, cursor .2, horizontal track .14, preview .12, magnets .15.

## Design Tokens
- Colors: ink `#0B0B0C`, plate bg `#141416` / `#101012`, bone `#EDE8DF`, bone 78% / 62% (secondary text) / 20% and 18% (rules) / 8% (crosshair), accent `#C8FF3C` (current default).
- Fonts: **Big Shoulders Display** (variable 100–900; display), **Instrument Serif** (regular + italic; editorial), **JetBrains Mono** 400/500 (labels, UI). All Google Fonts.
- Type scale: see per-scene clamps above; mono labels 10–13px, letter-spacing .06–.14em, uppercase.
- Spacing: page gutter 28px; section padding 16–26vh vertical; header 22px vertical.
- Radius: 0 everywhere except pill button (999px) and cursor (50%). No shadows.
- Breakpoint: 768px (mobile experience).

## Accessibility & SEO
- Semantic sections with aria-labels, a single h1, h2 per scene, split characters aria-hidden with the full phrase on the parent via aria-label.
- `prefers-reduced-motion`: no char scatter, no marquee acceleration/skew, instant lerps, slower 3D, no wipe.
- Visible focus: 2px accent outline, 4px offset. Menu fully keyboard-operable; Esc closes.
- Production: add metadata/OG image, sitemap, robots.txt, JSON-LD `Organization`, and canonical URL.

## Assets
- Project imagery is **procedural canvas art** (flow fields, rings, ridge lines, halftone sphere, bars) generated in `drawGen()`; it's placeholder art to replace with real WebP/AVIF photography or video.
- There is no GLB: the object is procedural geometry plus a shader. If it's swapped for a model later, use Draco and KTX2.
- The grain is an inline SVG feTurbulence data URI.
- The only character used as an icon is ✶ (marquee separator).

## Files
- `Parallel Hours.dc.html`: the full prototype (markup, all shaders, choreography, and the interaction and sound logic).
- `support.js`: the runtime needed to open the prototype locally. It's reference only; don't port it.
