# TWIN — cinematic digital twin story

A no-build interactive manifesto about the origin, architecture and future trajectory of a persistent digital self.

## Open locally

Serve the folder with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a modern desktop browser.

No npm install or build step is required.

## Active version: Protocol 0.3

Protocol 0.3 turns the continuous GPU landscape into a directed narrative space:

- native WebGL 2 full-screen raymarch renderer
- procedural mountain range with strata, erosion and depth fog
- authored twin monument and luminous signal ring at the final summit
- chapter-specific Catmull–Rom camera path with controlled lens and roll
- spatial memory fragments projected from world coordinates into the interface
- animated cloud layers and ray-integrated valley mist
- shader-rendered memory veins, particles, core and horizon beacon
- optional procedural Web Audio soundscape; audio begins only after an explicit click
- automatic LOW / MED / HIGH rendering quality with manual override
- WebGL context-loss handling and a Canvas 2D fallback
- responsive layout and reduced-motion treatment

## Files

- `index.html` — semantic story and spatial-memory markup
- `styles.css` — original editorial layout
- `protocol-02.css` — WebGL instrumentation shared with Protocol 0.2
- `protocol-03.css` — spatial memories, chapter transitions and sound controls
- `protocol-03.js` — active story orchestration
- `webgl-world-03.js` — active GPU terrain, atmosphere and summit monument
- `camera-path.js` — authored camera spline and world-to-screen projection
- `soundscape.js` — optional procedural audio
- `fallback-world.js` — Canvas renderer for unsupported WebGL environments

## Previous protocols

- `main.js` — Protocol 0.1 native Canvas prototype
- `protocol-02.js` + `webgl-world.js` — Protocol 0.2 GPU foundation

The old protocols remain in the repository for comparison and rollback.

## Validation

Run the syntax checks:

```bash
node --check camera-path.js
node --check fallback-world.js
node --check main.js
node --check protocol-02.js
node --check protocol-03.js
node --check soundscape.js
node --check webgl-world.js
node --check webgl-world-03.js
```

The renderer intentionally falls back to Canvas when WebGL 2 or shader initialization is unavailable. The current containerized Chromium cannot initialize GPU/EGL, so the final WebGL visual pass must be performed in a normal desktop browser.

## Next trajectory

Protocol 0.4 can introduce authored Blender assets, real typographic textures on the terrain, a deployment preview and device-specific performance profiling.
