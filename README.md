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
- no active Three.js, WebGL, framework build or external CDN
- real HTML typography and accessible controls
- mobile-first static deployment

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy to Vercel

The root `vercel.json` explicitly forces a framework-free static deployment:

- Framework Preset: Other
- Build Command: disabled
- Install Command: skipped
- Output Directory: repository root

A push to `main` should deploy the root `index.html` directly.

## Active files

- `index.html` — single-scene SVG stage and HTML story beats
- `pilot.css` — graphic art direction and responsive composition
- `pilot.js` — scroll timing and the delayed-reflection choreography
- `vercel.json` — static deployment overrides

The older experimental files remain in the repository for reference but are not loaded by the active page.
