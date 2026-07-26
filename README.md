# TWIN — cinematic digital twin story

An autonomous, no-build cinematic prototype about the origin, architecture and future trajectory of a persistent digital self.

## Open locally

Serve the folder with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

No npm install or build step is required.

## What is implemented

- cinematic boot / initialization sequence
- native Canvas pseudo-3D renderer with no external runtime dependencies
- scroll-driven camera path through a procedural identity landscape
- morphing memory core and particle field
- warm editorial manifesto scene inspired by the product reference
- horizontal scroll architecture sequence
- ascent roadmap and future trajectory
- responsive layout and reduced-motion fallback

## Architecture

- `index.html` — semantic story structure
- `styles.css` — editorial layout, transitions and responsive presentation
- `main.js` — loader, scroll direction, procedural terrain, particles and camera renderer

## Production trajectory

This commit establishes the narrative direction and interaction grammar. The next pass can replace the native Canvas renderer with authored WebGL assets (Three.js, Blender terrain, volumetric clouds and post-processing) after the storyboard and copy are approved.
