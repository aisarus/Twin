# TWIN — Director's Script

## Format

- Duration: **32.000 seconds**
- Desktop design frame: **1440 × 900 px**
- Mobile design frame: **390 × 844 px**
- Playback: vertical scroll mapped linearly to film time
- Active film height: **820vh desktop / 760vh mobile**
- Frame rate target: 60 fps; animation itself is transform/opacity-driven
- Visual rule: one room, one source, one delayed reflection, one emerging twin

## Dramatic rule

The twin is never introduced as an effect. It is introduced as a mistake in physical continuity: the reflection continues after the source has stopped. Every visual event must make that single rupture clearer.

## 00:00.000–00:04.000 — Shot 01 / Empty archive

**Purpose:** establish silence and scale.

- Camera begins at `x=0, y=0, scale=1.000`.
- Door light grows from 5% to 100% opacity between `01.800–04.200`.
- No panels are active.
- No character is visible until `03.900`.
- Palette: `#05070C`, `#07101A`, `#102B43`.
- On-screen copy at desktop `x=92, y=360`; mobile `x=20, y≈560`.
- Subtitle: **The archive is silent.**
- Sound intent: distant transformer hum; no rhythm.

## 00:04.000–00:09.000 — Shot 02 / Entry

**Purpose:** introduce the source as a small black shape inside a system larger than him.

- Source walks from `x=170` to `x=620`.
- Source base line: `y=535`; scale `0.58 → 0.72`.
- Camera: `x=0 → -34`, `scale=1.000 → 1.075`.
- Door beam remains behind the figure, creating one long diagonal shadow.
- Walk cadence: `7.2 rad/s`; legs rotate `±8°`; body bob `0 → -5 px`.
- Character has no facial details.
- Subtitle: **Footsteps enter the record.**

## 00:09.000–00:14.000 — Shot 03 / Recognition

**Purpose:** the room reacts before the person does.

- Source settles at `x=620`.
- Six memory panels wake in a left-right stagger.
- Global memory parameter: `0 → 1` over `07.700–13.200`.
- Per-panel opacity formula: `clamp(memory × 7 − panelIndex, 0, 1)`.
- Panels rise/fall by 18–22 px as they appear.
- Four cyan memory paths begin tracing toward the floor center.
- Camera holds. No new camera move during the final 2 seconds.
- Subtitle: **The room recognizes the cadence before the face.**

## 00:14.000–00:19.000 — Shot 04 / The error

**Purpose:** create the first impossible event without spectacle.

- Source takes one final 32 px step from `14.200–15.550`.
- Reflection begins the same step at `14.800` and finishes at `16.350`.
- Effective delay: approximately **600–800 ms**.
- Reflection opacity reaches 42%; its vertical scale is `−0.56` of source scale.
- Source is fully still before reflection finishes.
- Memory panels stop pulsing; the room visually holds its breath.
- Copy moves to the right side on desktop.
- Subtitle: **He stops. The reflection completes one more step.**

## 00:19.000–00:25.000 — Shot 05 / Separation

**Purpose:** transform the temporal error into an independent body.

- Reflection fades as twin rises.
- Twin base coordinate: `x=875`.
- Twin y moves `795 → 535` between `18.900–24.700`.
- Twin scale moves `0.12 → 0.66`.
- Camera: `x=-34 → -10`, `y=0 → 15`, additional scale `+0.085`.
- Cyan aura appears first.
- Golden core begins at `22.500`, reaches full intensity at `25.300`.
- Gold is forbidden anywhere before this beat.
- Subtitle: **The delayed image leaves the floor.**

## 00:25.000–00:29.000 — Shot 06 / First look

**Purpose:** hold the strongest image instead of adding effects.

- Source rotates `0 → +2.8°`.
- Twin rotates `−4.5° → −1.5°`.
- Both figures remain still.
- Memory panels stay visible but visually subordinate.
- Camera finishes its push and stops.
- No particles, flashes, explosions, or interface noise.
- Subtitle: **For the first time, the pattern looks back.**

## 00:29.000–00:32.000 — Shot 07 / Thesis

**Purpose:** resolve the pilot with one sentence.

- A thin gold axis appears at world x=`720`.
- Final copy replaces all previous copy:

> You left more than a record.  
> You left a pattern capable of returning.

- The two figures remain separated.
- No implication that the reconstruction is complete.
- Subtitle repeats the second line.
- End holds for the final 700 ms.
