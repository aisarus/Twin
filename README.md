# TWIN — The birth of a digital twin

TWIN is a no-build scroll-driven cinematic story about reconstructing a persistent digital self from language, memory, decisions and time.

## Active version: Protocol 0.6 — Story Cut

The site now plays as one continuous eight-scene film:

1. **Signal** — the conversation ends, but a trace remains.
2. **Origin** — years of dialogue unfold into a living archive.
3. **Break** — biography, facts and style imitation prove insufficient.
4. **Terrain** — identity appears as memory, voice, values, contradictions, relationships and time.
5. **System** — archive, memory graph, voice, decision and continuity connect around one core.
6. **Echo** — the first familiar but unstable second self emerges.
7. **Ascent** — development becomes a route toward persistence.
8. **Horizon** — the summit opens into the future trajectory of the twin.

The active experience combines:

- a fixed cinematic stage controlled by page scroll;
- chapter-to-chapter crossfades and transformation effects;
- local authored SVG compositions;
- the existing shadowed Three.js narrative layer;
- procedural particles, color transitions and optional sound;
- readable desktop and mobile typography;
- a graceful 2D fallback when Three.js or the CDN is unavailable.

See [`STORYBOARD.md`](./STORYBOARD.md) for the dramatic structure and transition grammar.

## Run locally

### Windows

Double-click `OPEN_TWIN.bat`.

### macOS / Linux

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

Do not open `index.html` directly through `file://`; browser module security will block the JavaScript modules.

## Deploy to Vercel

The project is static and needs no build command.

1. Import `aisarus/Twin` into Vercel.
2. Choose the **Other** framework preset.
3. Leave Build Command and Output Directory empty.
4. Deploy from `main`.

`vercel.json` already provides clean URLs, security headers and long-lived caching for local assets.

## Active files

- `index.html` — eight-scene story structure;
- `cinema.css` — cinematic environments, responsive composition and transitions;
- `cinema.js` — scroll choreography, chapter state, particles, sound and 3D synchronization;
- `three-stage.js` — physical materials, lighting, meshes and shadow maps;
- `soundscape.js` — optional procedural atmosphere;
- `STORYBOARD.md` — production story and transition grammar;
- `assets/` — local visual components and fallbacks.

## Validation

```bash
node --check cinema.js
python -m json.tool vercel.json
```

The container used during development cannot complete a trustworthy Chromium GPU/EGL render. Final color, mobile crop and 3D-shadow tuning should therefore be judged from a normal browser or Vercel preview rather than a simulated container screenshot.
