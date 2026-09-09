# TWIN

A 32-second scroll-driven motion study built as a deterministic web scene rather than a conventional page.

The experiment explores whether a narrative beat can be directed with only inline SVG, CSS transforms and a small JavaScript timeline: two geometric characters, one controlled environment, and motion whose timing is mapped explicitly to scroll position.

## What it demonstrates

- deterministic scroll-to-time choreography;
- CSS/SVG character motion without a 3D engine;
- art direction expressed as measurable timing and positioning rather than ad-hoc animation;
- responsive framing for the same scene across viewport sizes;
- a workflow where script, shot list and implementation stay separate enough to iterate on motion deliberately.

## Structure

- `SCRIPT.md` — dramatic beat-by-beat script;
- `SHOTLIST.md` — timing, positions and visual specifications;
- `index.html` — scene and inline SVG characters;
- `motion.css` — visual treatment, transforms, lighting and responsive framing;
- `timeline.js` — scroll-to-time mapping and choreography;
- `vercel.json` — static deployment configuration.

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Scope

TWIN is intentionally a focused motion experiment, not a product or reusable animation framework. The value of the project is the controlled relationship between narrative timing, visual state and scroll input.
