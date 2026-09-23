# Parallel Hours — site

Next.js implementation of the Claude Design handoff (`../project/Parallel Hours.dc.html`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` for canonical/OG/sitemap URLs (defaults to `https://parallel-hours.vercel.app`).

## Stack

- **Next.js (App Router) + TypeScript**, CSS Modules, `next/font` (Big Shoulders, Instrument Serif, JetBrains Mono)
- **React Three Fiber** for the 3D layer — shaders ported verbatim in `src/lib/shaders.ts`
- **Lenis** smooth scroll (disabled under `prefers-reduced-motion`)
- No GSAP: every scene is a continuous scroll-scrub computed per frame, so the prototype's math is kept as-is

## Architecture

- `src/lib/ticker.ts` — the single rAF loop. It runs Lenis, then updates shared input state (mouse lerp, scroll velocity, hold-to-charge), then each scene's subscriber, then the WebGL frame (`frameloop="never"` + `advance`).
- `src/lib/runtime.ts` — the mutable per-frame state (`rt`) shared by scenes, kept out of React state so nothing re-renders at 60fps.
- `src/components/scenes/*` — one component per scene. Each reads its own DOM rect in a ticker subscriber and writes styles directly.
- `src/components/three/World.tsx` — the object, rings, particles and the full scroll choreography.
- `src/lib/content.ts` — copy, projects and the tweak defaults (accent `#C8FF3C`, grain on, intensity 2).
- `src/lib/sound.ts` — optional Web Audio layer. It's off by default and nothing is created until the user turns it on.

Device tiers: on mobile or ≤4 cores the object uses lower detail and fewer particles, and DPR is capped at 1.5 with no AA. DPR also steps down on its own when frames run long.

## Placeholders to replace

- Project imagery is procedural canvas art (`src/lib/gen.ts`). Swap in real WebP/AVIF.
- The projects listed in Worlds/Index are still fictional placeholders.
