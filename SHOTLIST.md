# TWIN — Pixel Shot List

Coordinates refer to the **1440 × 900 SVG design frame** unless marked mobile.

## Permanent world geometry

| Element | Desktop coordinates | Mobile crop behavior |
|---|---:|---|
| Horizon / floor start | y=545 | remains near 55–60% viewport height |
| Vanishing axis | x=720 | centered |
| Door | x=116, y=186, w=192, h=359 | mostly outside left crop after Shot 02 |
| Source final position | x=652, baseline y=535 | appears left of center |
| Twin final position | x=875, baseline y=535 | appears right of center |
| Memory panel 1 | x=390, y=185, w=130, h=214 | partially cropped |
| Memory panel 2 | x=543, y=118, w=112, h=178 | visible |
| Memory panel 3 | x=785, y=116, w=112, h=182 | visible |
| Memory panel 4 | x=922, y=184, w=132, h=216 | partially cropped |
| Floor glow | cx=720, cy=640, rx=430, ry=62 | centered |

## Shot 01 — 00:00–00:04

| Property | Start | End |
|---|---:|---:|
| Camera X | 0 px | 0 px |
| Camera Y | 0 px | 0 px |
| Camera scale | 1.000 | 1.000 |
| Door light opacity | .05 | 1.00 |
| Door beam opacity | 0 | .12 |
| Copy desktop | x=92, center y=450 | same |
| Copy mobile | x=20, bottom=12vh | same |

## Shot 02 — 00:04–00:09

| Property | Start | End |
|---|---:|---:|
| Source X | 170 px | 620 px |
| Source baseline | 535 px | 535 px |
| Source scale | .58 | .72 |
| Camera X | 0 px | −34 px |
| Camera scale | 1.000 | 1.075 |
| Leg rotation | ±8° | 0° on stop |
| Body bob | 0 to −5 px | 0 px |

## Shot 03 — 00:09–00:14

| Panel | Wake threshold | Entry offset |
|---|---:|---:|
| 1 | memory≈0.00 | +22 px |
| 2 | memory≈0.14 | −18 px |
| 3 | memory≈0.29 | +22 px |
| 4 | memory≈0.43 | −18 px |
| 5 | memory≈0.57 | +22 px |
| 6 | memory≈0.71 | −18 px |

Memory parameter reaches 1.0 at 13.200 seconds.

## Shot 04 — 00:14–00:19

| Property | Source | Reflection |
|---|---:|---:|
| Step begins | 14.200 s | 14.800 s |
| Step ends | 15.550 s | 16.350 s |
| X movement | 620 → 652 px | 620 → 652 px |
| Visual opacity | 1.00 | 0 → .42 |
| Vertical scale | +.72 | −.56 × source scale |
| Blur | none | 2.4 px |

## Shot 05 — 00:19–00:25

| Property | Start | End |
|---|---:|---:|
| Twin X | 875 px | 875 px |
| Twin baseline Y | 795 px | 535 px |
| Twin scale | .12 | .66 |
| Twin aura opacity | 0 | .28 cyan + .32 gold |
| Gold core | 0 at 22.499 s | 1 at 25.300 s |
| Camera X | −34 px | −10 px |
| Camera Y | 0 px | +15 px |
| Camera scale | 1.075 | 1.160 |

## Shot 06 — 00:25–00:29

| Property | Start | End |
|---|---:|---:|
| Source turn | 0° | +2.8° |
| Twin turn | −4.5° | −1.5° |
| Source X | 652 px | 652 px |
| Twin X | 875 px | 875 px |
| Actor separation | 223 px | 223 px |

## Shot 07 — 00:29–00:32

| Property | Start | End |
|---|---:|---:|
| Gold axis opacity | 0 | .55 |
| Gold axis x | 716–724 px | unchanged |
| Final title desktop | x=92, max-width≈650 px | unchanged |
| Final title mobile | x=20, width=350 px | unchanged |
| Hold | — | 31.300–32.000 s |

## Responsive rules

- The SVG remains 1440 × 900 and uses `preserveAspectRatio="xMidYMid slice"`.
- Below 720 px viewport width, SVG width becomes 170% and shifts left by 35%.
- This preserves both final actors while sacrificing the entrance door after its narrative function is complete.
- Desktop copy alternates left/right. Mobile copy is always left-aligned in the lower 12vh.
- Minimum mobile body text: 16 px. Minimum UI text: 10 px.
