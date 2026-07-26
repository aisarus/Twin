# Deploy TWIN to Vercel

The project is a static site and needs no build command.

1. Import `aisarus/Twin` in Vercel.
2. Select **Other** as the framework preset.
3. Leave **Build Command** empty.
4. Leave **Output Directory** empty.
5. Deploy the `agent/cinematic-foundation` branch for preview.
6. After review, merge the pull request and deploy `main` as production.

The root `index.html` is the entry point. `vercel.json` adds clean URLs, security headers, and long-lived caching for local visual assets.

The Three.js narrative layer is loaded from the pinned `0.185.1` jsDelivr module URL declared in the page import map. The existing custom WebGL world and Canvas fallback remain independent of this layer.
