# TWIN — cinematic digital twin story

A cinematic scroll narrative about the origin, architecture and future trajectory of a persistent digital self.

## Open on Windows

1. Extract the archive.
2. Double-click `OPEN_TWIN.bat`.
3. The site opens at `http://localhost:4173`.

Do not open `index.html` directly through `file://`: browser module security will stop the cinematic renderer. Protocol 0.4 now displays an explicit warning when that happens.

## Protocol 0.4 — visual direction and content assets

This pass replaces the empty black technical-demo feeling with chapter-specific visual art direction.

- six smoothly interpolated chapter palettes
- saturated chapter color grading layered over the existing WebGL terrain, clouds and summit lighting
- authored SVG asset system with no external image dependency
- signal core hero artwork
- conversation archive monolith
- memory graph constellation
- voice-spectrum portrait
- decision-path diagram
- continuity rings
- first-echo double portrait
- future-trajectory bloom
- asset-driven architecture cards
- editorial parallax and chapter color transitions
- colored Canvas fallback for devices without WebGL
- one-click Windows launcher

## Previous protocols

- Protocol 0.1 — narrative and interaction foundation
- Protocol 0.2 — native WebGL raymarched world
- Protocol 0.3 — authored camera flight, summit monument, spatial memories and optional sound

Older renderers remain in the repository for comparison and rollback.

## Architecture

- `index.html` — story structure and asset placement
- `styles.css` — foundational editorial layout
- `protocol-02.css`, `protocol-03.css`, `protocol-04.css` — progressive visual layers
- `protocol-04.js` — active scroll choreography, chapter states, parallax, sound and renderer controls
- `webgl-world-03.js` — active GPU terrain, atmosphere and summit monument
- `fallback-world.js` — Canvas fallback
- `camera-path.js` — authored camera spline
- `soundscape.js` — optional procedural Web Audio atmosphere
- `assets/` — content-specific vector artwork

## Validation

- all JavaScript modules pass `node --check`
- every local HTML asset reference resolves
- all nine SVG assets render successfully through ImageMagick/Inkscape
- the available containerized Chromium still cannot initialize GPU/EGL, so final WebGL visual review must happen in a normal desktop browser
