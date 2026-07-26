# TWIN — 2D pilot cut

TWIN is currently reduced to one focused interactive scene: a person enters an archive, memory wakes around them, and a delayed reflection separates into a digital twin.

## Active version

Protocol 0.7 / 2D pilot

- one continuous scene instead of an eight-section montage
- graphic silhouettes, hard geometry and long shadows
- cold blue and black base palette
- cyan memory light
- gold appears only at the moment of emergence
- lightweight scroll choreography
- no active Three.js, WebGL, framework runtime or external CDN
- real HTML typography and accessible controls
- mobile-first static deployment

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy to Vercel

The root `vercel.json` explicitly overrides the old Angular project settings:

- Framework Preset: Other
- Install Command: skipped
- Build Command: copies `index.html`, `pilot.css` and `pilot.js` into `public`
- Output Directory: `public`

A push to `main` triggers a static deployment without Angular or npm dependencies.

## Active files

- `index.html` — single-scene SVG stage and HTML story beats
- `pilot.css` — graphic art direction and responsive composition
- `pilot.js` — scroll timing and delayed-reflection choreography
- `vercel.json` — static deployment overrides

The older experimental files remain in the repository for reference but are not loaded by the active page.
