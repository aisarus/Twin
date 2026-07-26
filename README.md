# TWIN — cinematic digital twin story

TWIN is a no-build interactive manifesto about reconstructing a persistent digital self from language, memory, decisions and time.

## Active version: Protocol 0.5

Protocol 0.5 is the first production-oriented pass:

- readable microcopy by default, with an optional `TEXT / MAX` mode
- Vercel-ready static deployment from the repository root
- a pinned Three.js narrative layer loaded through an import map
- six real-time 3D scenes made from meshes rather than flat illustrations
- a signal core, archive monolith, memory graph, voice relic, twin gate and future bloom
- ACES tone mapping, physical materials, moving lights and shadow maps
- soft receiving shadows under every major 3D object
- chapter-driven model transitions synchronized with the existing scroll story
- the previous procedural WebGL landscape and Canvas fallback remain intact
- graceful fallback when the external Three.js module cannot load

## Run locally

### Windows

Double-click `OPEN_TWIN.bat`.

### macOS / Linux

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Do not open `index.html` directly through `file://` because browser module security will block the cinematic JavaScript.

## Deploy to Vercel

The site is static and requires no build command.

1. Import `aisarus/Twin` in Vercel.
2. Use the **Other** framework preset.
3. Leave Build Command and Output Directory empty.
4. Select `agent/cinematic-foundation` for the preview deployment.
5. Merge the pull request only after visual review; `main` can then become the production branch.

See `DEPLOY_VERCEL.md` for the exact settings. `vercel.json` provides clean URLs, security headers and long-lived caching for local assets.

## Active files

- `index.html` — story structure, import map and renderer canvases
- `protocol-05.css` — readability and production visual overrides
- `protocol-05.js` — Three.js bootstrapping, text controls and production scroll sync
- `three-stage.js` — real-time 3D models, lighting, materials and shadows
- `protocol-04.js` + `webgl-world-04.js` — existing scroll choreography and procedural world
- `fallback-world-04.js` — Canvas fallback
- `assets/` — local editorial illustrations
- `vercel.json` — deployment configuration

## Validation

```bash
node --check protocol-05.js
node --check three-stage.js
python -m json.tool vercel.json
```

The container used to produce this pass cannot initialize a trustworthy GPU/EGL browser session and cannot reach the external Three.js CDN. The new stage therefore still needs a normal-browser visual pass after deployment. Failure to load the Three.js layer does not block Protocol 0.4 or its Canvas fallback.

## Next trajectory

Protocol 0.6 should replace selected procedural meshes with authored `.glb` assets, use baked normal/roughness maps, add contact-shadow tuning per device, and integrate genuine project material such as archive excerpts, pipeline diagrams, measured data and interface captures.
