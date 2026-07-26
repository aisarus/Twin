# TWIN — cinematic digital twin story

A cinematic scroll narrative about the origin, architecture and future trajectory of a persistent digital self.

## Open locally

Serve the folder with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

No npm install or build step is required.

## Protocol 0.2

The visual world now runs through a native WebGL 2 renderer rather than a painted pseudo-3D canvas.

Implemented in this pass:

- full-screen fragment-shader raymarcher
- procedural identity mountain range with erosion and strata
- scroll-driven 3D camera flight
- animated low, middle and high cloud layers
- ray-integrated valley mist, atmospheric depth fog and summit lighting
- shader-based morphing memory core
- GPU memory particles and horizon beacon
- automatic low / medium / high quality selection
- adaptive quality downgrade when frame time is too high
- manual quality control in the top navigation
- WebGL context-loss handling
- automatic Canvas 2D fallback for unsupported devices or failed shader initialization

## Story layer

- cinematic boot / initialization sequence
- origin and manifesto chapters
- identity terrain
- horizontal architecture sequence
- first echo, ascent roadmap and future trajectory
- responsive layout and reduced-motion support

## Architecture

- `index.html` — semantic story structure
- `styles.css` — editorial layout, transitions and responsive presentation
- `protocol-02.js` — active loader, scroll choreography, chapter state and renderer controls
- `webgl-world.js` — WebGL program, shader world, camera and adaptive quality
- `fallback-world.js` — dependency-free Canvas renderer for unsupported devices
- `main.js` — preserved Protocol 0.1 renderer for comparison and rollback
- `protocol-02.css` — renderer instrumentation and quality controls

## Validation

- all JavaScript modules pass `node --check`
- repository wiring and module paths were verified after publication
- the available headless Chromium environment cannot initialize GPU/EGL, so a visual WebGL pass still needs to be performed in a normal desktop browser; unsupported environments automatically enter the Canvas fallback

## Next production pass

Protocol 0.3 should introduce authored scene assets and stronger narrative choreography: a custom Blender summit silhouette, text fragments embedded into the terrain, scene-specific camera splines and sound design that remains optional and user-controlled.
