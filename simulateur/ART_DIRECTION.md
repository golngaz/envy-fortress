# Card Art Direction — "Arcane Glitch"

Visual identity for **all cards** of *La Forteresse de l'Envie* combat simulator:
player spells, monster attacks & defenses, weapons, and Shell-Control specials.
This file is written so its text can be pasted **directly into an AI image
generator**. Section 9 gives two ready-to-use prompts.

---

## 1. Concept in one line

> Every spell is **computed at the root, real at the tip**: the effect springs
> from a visible **technological source** — circuitry, an emitter, floating
> bits — and what comes out is a completely **organic, believable phenomenon**.
> A real flame born from an electronic ignition, hex digits still drifting at
> its base.

The fiction backs this: the Fortress computes everything, yet everything in it
is *real* on site (Shell Control, "Shell Access", the world that can be
hacked). Every card shows exactly that seam: **digital at the origin, nature
at the result**.

### The three zones of every card

1. **The source (tech)** — where the spell is "executed": glowing etched
   circuit traces, a compact emitter or holo-glyph array, drifting luminous
   bits / hex digits, thin UI ticks. This is where ALL the glitch language
   lives.
2. **The transition (materialization)** — a narrow seam where data becomes
   matter: voxels melting into sparks, wireframe gaining real texture, pixels
   rounding into droplets. Keep it short — a hand's width, never half the image.
3. **The effect (organic)** — the phenomenon itself, rendered like the real
   thing: fire with natural flame licks, heat shimmer and soft smoke; water
   with true refraction; living leaves; honest steel. **No pixelation, no
   scanlines, no geometric edges here.**

**Golden rule:** *tech at the root, nature at the tip.* If the flame itself
looks digital, the image has failed; if no circuitry or bits are visible at
its origin, it has failed the other way.

---

## 2. Color system

### 2.1 Base atmosphere (always present, every card)

| Role | Hex | Use |
|------|-----|-----|
| Deep void | `#0D0A1E` | Darkest background, edges, vignette |
| Arcane indigo | `#140E30` | Mid background |
| Royal violet | `#1B1442` | Upper background, where light gathers |
| Arcane glow (primary) | `#7A5CFF` | Default magical energy, runes, rim light |
| Electric blue (secondary) | `#4DA6FF` | Cool highlights, mana, depth |

### 2.2 Glitch accents (sparingly, on edges only)

| Role | Hex |
|------|-----|
| Glitch cyan | `#2FF3E0` |
| Glitch magenta | `#FF3D9A` |

Used as a **chromatic-aberration pair**: a 1–3 px cyan/magenta split on hard
edges, plus rare horizontal "datamosh" slices. Never fill large areas with them.

### 2.3 Per-type accent color (the card's dominant hue)

Each card type carries ONE accent color layered over the blue-violet base — it
tints the energy, the rune ring, the rim light and the frame. **Keep these
exact mappings:**

| Type (FR) | Type (EN) | Accent | Hex | Energy reads as |
|-----------|-----------|--------|-----|-----------------|
| Attaque | Attack | **Red** | `#E2533B` | aggressive ember / crimson sparks |
| Soin | Heal | **Green** | `#43C463` | restorative, verdant, soft pulse |
| Utilitaire | Utility | **Yellow** | `#F4B740` | clever amber / golden glyphs |
| Défense | Defense | **Blue** | `#3D8BFF` | protective azure ward / shield light |
| Passif | Passive | **Violet** | `#9B8CFF` | calm ambient arcane aura |
| Shell Control | Shell Control | **Cyan** | `#39C5C0` | digital, holographic, hex-code teal |
| Arme | Weapon | **Gold/Bronze** | `#C0A060` | metallic gleam, forged, no magic glow |

Notes:
- **Attack** energy is sharp and explosive; **Heal** is gentle and enveloping;
  **Utility** is intricate (glyphs, gears, sigils); **Defense** is geometric and
  shielded; **Passive** is diffuse and ambient.
- **Shell Control** leans hardest into the glitch/tech language: holographic teal,
  scanlines, floating hex digits and UI fragments, "Shell Access" terminal vibe —
  the only type where the corruption is a co-star, not a garnish.
- **Weapon** is the exception with little to no magic glow: focus on the physical
  object, metal, wear and edge, lit by the surrounding violet ambience plus a
  faint gold rim.

---

## 3. Glitch language (confined to the source & transition zones)

Allowed, in small doses — **only on the tech source and the materialization
seam, never on the organic effect**:
- 1–3 px chromatic aberration (cyan/magenta) on the silhouette and text edges.
- 2–4 thin horizontal displacement slices ("datamosh") crossing the subject.
- Faint CRT scanlines over the whole frame (low opacity).
- A few floating **shattered pixels / voxel shards** drifting off the subject,
  dissolving into the accent color.
- Sparse luminous **hex digits, runic glyphs and thin UI ticks** in the haze.

Forbidden:
- Any glitch, pixelation or scanlines **on the organic effect itself** — the
  flame / water / growth / metal must stay natural and believable.
- Full-frame noise, heavy VHS distortion, unreadable smears.
- Glitch covering the subject's face/focal point.
- Neon overload — the base must stay dark and moody.

---

## 4. Material, lighting, texture

- **Lighting:** dramatic, low-key. A single cool key light + a rim light in the
  card's accent color separating the subject from the dark. Deep vignette.
- **Surface:** painterly digital illustration with a faint film grain; subtle
  arcane bloom around light sources.
- **Effect rendering (organic zone):** volumetric and believable — real flame
  licks, liquid refraction, plant fibres, drifting smoke; it picks up the
  accent hue but keeps **natural shapes** (no geometric or pixel edges).
- **Source rendering (tech zone):** crisp luminous micro-detail — etched
  circuit traces, small emitter lenses, floating bits/hex digits in the accent
  color, thin holographic ticks.
- **Depth:** subject sharp in front; background = soft runic geometry, a large
  faint sigil ring, drifting particles, blurred glyph fog.

---

## 5. Typography (for the rendered card UI, not the AI image)

- Titles: clean bold display, with the chromatic-aberration shadow already applied
  in CSS (cyan left / magenta right offset).
- Dice notation and Shell-Control labels: **monospace** (Consolas / ui-monospace)
  to reinforce the "code" layer.
- Body: neutral sans. Keep type label UPPERCASE, wide letter-spacing.

> AI-generated images should contain **no text** — text is layered by the app.

---

## 6. Composition / framing

- **Single central focal subject**, three-quarter or heroic angle.
- Large faint **sigil/rune ring** behind the subject in the accent color.
- Accent-colored energy emanating from the subject; particles + glitch shards
  drifting outward and fading.
- **Bottom third darker** (gradient to `#0D0A1E`) so UI text stays legible.
- Symmetric or rule-of-thirds; generous negative space in the haze.
- Square `1:1` or portrait `3:4`. Leave a calm margin — no important detail in the
  outer 8% (the app crops/overlays a frame and badges).

---

## 7. Per-type subject & mood cheat-sheet

Each motif follows the grammar **organic effect ⟵ tech source**:

| Type | Suggested subject motifs (effect ⟵ source) | Mood keywords |
|------|--------------------------------------------|---------------|
| Attack (red) | a real roaring flame / lightning arc / shockwave igniting out of a circuit-etched emitter, bits drifting at its root | violent, kinetic, hot |
| Heal (green) | real living leaves, petals or soft mending light growing out of a green circuit lattice, sap-like glow in the traces | gentle, sacred, calm |
| Utility (yellow) | real brass gears, tools or golden dust assembling themselves out of a glowing schematic wireframe | clever, precise, scholarly |
| Defense (blue) | a wall of real ice / stone / dense light projected by small hovering emitter nodes, wireframe solidifying into true matter | solid, vigilant, geometric |
| Passive (violet) | natural motes, fireflies or mist leaking from faint circuitry buried under the ground or skin | quiet, ever-present, dreamy |
| Shell Control (cyan) | **the exception — fully digital, no organic tip**: holographic terminal, hex-code stream, fractured UI, "Shell Access" glyph | digital, intrusive, uncanny |
| Weapon (gold) | the physical weapon on a void plinth, honest metal and wear, faint circuit engravings along the fuller fading into plain steel | tangible, forged, heavy |

> **Shell Control** is the one type whose effect never materializes: it *is*
> the system, so the image stays pure interface from root to tip.

---

## 8. Technical defaults for generation

- Aspect ratio: `3:4` portrait (full card art) or `1:1` (icon/illustration window).
- Style: *painterly digital illustration / concept-art*, high detail, dramatic
  lighting, NOT photorealistic, NOT flat vector.
- **Negative prompt:** `text, watermark, logo, UI text, caption, border frame,
  signature, photorealistic photo, lowres, blurry subject, oversaturated neon,
  heavy noise, full-screen glitch, extra limbs, deformed`.

---

## 9. Ready-to-use AI prompts

### 9.1 PROMPT A — Master style (reusable prefix for any card)

Paste this verbatim as the **style half** of any prompt; it defines the whole
look without naming a subject.

```
Arcane tech-to-organic trading-card illustration, dark blue-violet magical
atmosphere (deep indigo #140E30 to royal violet #1B1442, void black #0D0A1E
vignette), painterly digital concept art, dramatic low-key lighting with a
coloured rim light; the spell effect is BORN FROM TECHNOLOGY: at the base a
glowing circuit-etched source or compact emitter with drifting luminous bits,
binary digits and hex fragments, then a narrow materialization seam where
voxels and wireframe melt into real matter, and above it a completely ORGANIC,
believable phenomenon with natural shapes — volumetric, photoreal-leaning yet
painterly, absolutely no pixelation or scanlines on the effect itself; subtle
glitch flavor confined to the source zone: 1-3px cyan (#2FF3E0) and magenta
(#FF3D9A) chromatic aberration, thin CRT scanlines, floating code fragments;
a large faint glowing rune/sigil ring behind the subject; technology at the
root, nature at the tip; cinematic, high detail, soft film grain, darker
bottom third, centered subject, generous negative space, no text, no border.
```

### 9.2 PROMPT B — Per-card template (the visual of one specific card)

Fill the `{{...}}` placeholders, prepend PROMPT A, append the negative prompt.
Use the per-type accent + motifs from sections 2.3 and 7.

```
{{PROMPT_A}}

Subject: {{ORGANIC_EFFECT}} emerging from {{TECH_SOURCE}} — the visual of the
{{TYPE_EN}} card "{{CARD_NAME}}". The effect itself looks completely real and
organic; the technology stays at its root only. Dominant accent colour
{{ACCENT_NAME}} ({{ACCENT_HEX}}): the energy, the rune ring and the rim light
all read {{ACCENT_NAME}}. Mood: {{MOOD_KEYWORDS}}. Composition: tech source
anchored low-center, organic effect blooming upward over a {{ACCENT_NAME}}
arcane glow, {{EXTRA_MOTIFS}}. Aspect ratio 3:4.

Negative prompt: text, watermark, logo, UI text, caption, border frame,
signature, lowres, blurry subject, oversaturated neon, heavy noise,
full-screen glitch, pixelated flame, digital-looking effect, extra limbs,
deformed.
```

Fill `{{TECH_SOURCE}}` with the executing device (circuit-etched emitter, holo
rune-board, buried circuit lattice, hovering emitter nodes…) and
`{{ORGANIC_EFFECT}}` with the real-world phenomenon (a true flame, living
vines, a wall of ice, a healing bloom…). For **Shell Control** cards, skip the
grammar: describe a fully digital subject instead (see section 7).

### 9.3 Worked examples

**Hall Humettes** (Attack / red — fire bolt):
```
{{PROMPT_A}}
Subject: a real, natural flame — believable fire licks, heat shimmer, soft
smoke — igniting out of a compact circuit-etched emitter, luminous bits and
hex digits drifting at the flame's root, a few voxels melting into embers at
the seam — the visual of the Attack card "Hall Humettes". The flame itself
looks completely real; only its origin is technological. Dominant accent
colour red (#E2533B): energy, rune ring and rim light all read red-orange.
Mood: violent, kinetic, hot. Composition: emitter anchored low-center, fire
blooming upward over a red arcane glow. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, lowres, blurry
subject, oversaturated neon, full-screen glitch, pixelated flame,
digital-looking fire, deformed.
```

**Point de restauration** (Shell Control / cyan — full heal save-state):
```
{{PROMPT_A}}
Subject: a holographic teal save-point glyph / restore icon made of fractured
UI panels and a flowing hex-code stream, a faint healed silhouette re-forming
from pixels — the visual of the Shell Control card "Point de restauration".
Shell Control is the exception: fully digital from root to tip, no organic
materialization — this card IS the system. Dominant accent colour cyan
(#39C5C0), strong digital/holographic glitch. Mood: digital, uncanny,
restorative. Composition: central terminal-like glyph over a cyan glow,
scanlines, floating hex digits, "Shell Access" energy. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, photorealistic,
lowres, blurry subject, full-screen glitch, deformed.
```

**Défense simple** (Defense / blue — basic ward):
```
{{PROMPT_A}}
Subject: a wall of real, translucent ice with natural fractures and frost —
true frozen matter, believable refraction — being projected by small hovering
emitter nodes, a thin blue wireframe still solidifying into ice at its lower
edge, faint hex digits drifting around the emitters — the visual of the
Defense card "Défense simple". The barrier itself looks like real ice; only
its projectors are technological. Dominant accent colour blue (#3D8BFF).
Mood: solid, vigilant, geometric. Composition: emitter nodes low, ice wall
rising over a blue arcane glow, ward-circle behind. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, lowres, blurry
subject, full-screen glitch, pixelated ice, digital-looking barrier, deformed.
```

**Épée courte usée** (Weapon / gold — worn shortsword):
```
{{PROMPT_A}}
Subject: a worn, time-marked short sword resting on a dark void plinth — honest
steel, chips and scratches, completely real metal — with faint circuit
engravings along the fuller that glow softly near the guard and fade into
plain worn steel toward the tip, faint forge-gold rim light — the visual of
the Weapon card "Épée courte usée". Dominant accent gold/bronze (#C0A060),
almost no magic glow, focus on metal, wear and edge. Mood: tangible, forged,
reliable. Composition: single centered weapon, soft violet ambience, glitch
confined to the circuit engravings. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, lowres, blurry
subject, oversaturated neon, full-screen glitch, sci-fi laser sword, deformed.
```

---

## 10. How this maps to the app

The CSS lives in its own file **`css/cards.css`** (`/* CARTES — Arcane Glitch */`).
It renders the **frame** in this language: blue-violet gradient, animated scanlines,
accent-tinted rune halo, chromatic-aberration card titles (with an occasional glitch
flicker animation), shimmer sweep, monospace dice/Shell labels, and the per-type
accent via the `--c` variable (same hexes as section 2.3).

### Attaching a generated image to a card

Each card object (in `data/sorts.js`, `data/armes.js`, or a monster's
`attaques`/`defense`) accepts an optional **`image`** field — a URL or a path
relative to `simulateur/` (e.g. `"assets/cards/foudre.png"`). When present it fills
the card's illustration zone (`.carte-art`); otherwise a per-type arcane glyph
placeholder is shown. Recommended export size: **3:4 portrait** (e.g. 600×800).
Generated art should contain **no text** — the title, badges and tables are drawn
by the app on top of / below the artwork.

The **Éditeur** tab (`js/cardbuilder.js`) lets you build a card by hand — including
its `image` path — preview it live in this exact frame, and export the JSON to paste
into the data files.
