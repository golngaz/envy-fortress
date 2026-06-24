# Card Art Direction — "Arcane Glitch"

Visual identity for **all cards** of *La Forteresse de l'Envie* combat simulator:
player spells, monster attacks & defenses, weapons, and Shell-Control specials.
This file is written so its text can be pasted **directly into an AI image
generator**. Section 9 gives two ready-to-use prompts.

---

## 1. Concept in one line

> Hand-painted **arcane magic** meets **corrupted code** — a dark blue-violet
> world where spellcraft and reality glitch at the seams. Mystical first,
> digital second; the glitch is a *flavor*, never the subject.

The fiction backs this: the Fortress is a reality that can be *hacked*
(Shell Control, "Shell Access", the Architecte who edits the rules of the world).
So magic and a thin layer of broken-pixel/datamosh corruption coexist.

**Golden rule:** *a little bit glitched, but not too much.* If a viewer's first
word is "glitch art" instead of "magic card", the effect has gone too far.

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

## 3. Glitch language (subtle)

Allowed, in small doses:
- 1–3 px chromatic aberration (cyan/magenta) on the silhouette and text edges.
- 2–4 thin horizontal displacement slices ("datamosh") crossing the subject.
- Faint CRT scanlines over the whole frame (low opacity).
- A few floating **shattered pixels / voxel shards** drifting off the subject,
  dissolving into the accent color.
- Sparse luminous **hex digits, runic glyphs and thin UI ticks** in the haze.

Forbidden:
- Full-frame noise, heavy VHS distortion, unreadable smears.
- Glitch covering the subject's face/focal point.
- Neon overload — the base must stay dark and moody.

---

## 4. Material, lighting, texture

- **Lighting:** dramatic, low-key. A single cool key light + a rim light in the
  card's accent color separating the subject from the dark. Deep vignette.
- **Surface:** painterly digital illustration with a faint film grain; subtle
  arcane bloom around light sources.
- **Energy:** volumetric, semi-transparent, flowing — like ink in water crossed
  with light streaks; it picks up the accent hue.
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

| Type | Suggested subject motifs | Mood keywords |
|------|--------------------------|---------------|
| Attack (red) | bursting sigil, ember vortex, cracked shockwave, weaponized rune | violent, kinetic, hot |
| Heal (green) | blooming sigil, life-thread filaments, soft orb, mending light | gentle, sacred, calm |
| Utility (yellow) | interlocking glyph-gears, clockwork rune, golden schematic | clever, precise, scholarly |
| Defense (blue) | hex shield wall, ward circle, crystalline barrier | solid, vigilant, geometric |
| Passive (violet) | ambient aura, drifting motes, halo, latent rune | quiet, ever-present, dreamy |
| Shell Control (cyan) | holographic terminal, hex-code stream, fractured UI, "Shell Access" glyph | digital, intrusive, uncanny |
| Weapon (gold) | the physical weapon on a void plinth, faint forge glow, metal & wear | tangible, forged, heavy |

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
Arcane glitch trading-card illustration, dark blue-violet magical atmosphere
(deep indigo #140E30 to royal violet #1B1442, void black #0D0A1E vignette),
painterly digital concept art, dramatic low-key lighting with a coloured rim
light, volumetric semi-transparent energy like ink-in-water and light streaks,
a large faint glowing rune/sigil ring behind the subject, drifting magical
particles and a few shattered-pixel shards dissolving at the edges, subtle
glitch flavor only: 1-3px cyan (#2FF3E0) and magenta (#FF3D9A) chromatic
aberration on edges, a couple of thin horizontal datamosh slices, faint CRT
scanlines, sparse luminous runic glyphs and hex digits in the haze; magic first
and digital corruption second; cinematic, high detail, soft film grain, darker
bottom third, centered subject, generous negative space, no text, no border.
```

### 9.2 PROMPT B — Per-card template (the visual of one specific card)

Fill the `{{...}}` placeholders, prepend PROMPT A, append the negative prompt.
Use the per-type accent + motifs from sections 2.3 and 7.

```
{{PROMPT_A}}

Subject: {{SUBJECT}} — the visual of the {{TYPE_EN}} card "{{CARD_NAME}}".
Dominant accent colour {{ACCENT_NAME}} ({{ACCENT_HEX}}): the energy, the rune
ring and the rim light all read {{ACCENT_NAME}}. Mood: {{MOOD_KEYWORDS}}.
Composition: single central focal element over a {{ACCENT_NAME}} arcane glow,
{{EXTRA_MOTIFS}}. Aspect ratio 3:4.

Negative prompt: text, watermark, logo, UI text, caption, border frame,
signature, photorealistic photo, lowres, blurry subject, oversaturated neon,
heavy noise, full-screen glitch, extra limbs, deformed.
```

### 9.3 Worked examples

**Hall Humettes** (Attack / red — fire bolt):
```
{{PROMPT_A}}
Subject: a swirling ember vortex erupting from a cracked fire rune, small
campfire sparks — the visual of the Attack card "Hall Humettes". Dominant accent
colour red (#E2533B): energy, rune ring and rim light all read red-orange. Mood:
violent, kinetic, hot. Composition: single central burning sigil over a red
arcane glow, ember particles and faint glitch shards drifting upward. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, photorealistic,
lowres, blurry subject, oversaturated neon, full-screen glitch, deformed.
```

**Point de restauration** (Shell Control / cyan — full heal save-state):
```
{{PROMPT_A}}
Subject: a holographic teal save-point glyph / restore icon made of fractured
UI panels and a flowing hex-code stream, a faint healed silhouette re-forming
from pixels — the visual of the Shell Control card "Point de restauration".
Dominant accent colour cyan (#39C5C0), strong digital/holographic glitch (this
type leans hardest into the corruption). Mood: digital, uncanny, restorative.
Composition: central terminal-like glyph over a cyan glow, scanlines, floating
hex digits, "Shell Access" energy. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, photorealistic,
lowres, blurry subject, full-screen glitch, deformed.
```

**Défense simple** (Defense / blue — basic ward):
```
{{PROMPT_A}}
Subject: a hexagonal azure ward / shield wall of crystalline runes flaring on
impact — the visual of the Defense card "Défense simple". Dominant accent colour
blue (#3D8BFF). Mood: solid, vigilant, geometric. Composition: central hex
barrier over a blue arcane glow, ward-circle behind, sparse glitch fringe. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, photorealistic,
lowres, blurry subject, full-screen glitch, deformed.
```

**Épée courte usée** (Weapon / gold — worn shortsword):
```
{{PROMPT_A}}
Subject: a worn, time-marked short sword resting on a dark void plinth, faint
forge-gold rim light on the chipped blade — the visual of the Weapon card "Épée
courte usée". Dominant accent gold/bronze (#C0A060), almost no magic glow, focus
on metal, wear and edge. Mood: tangible, forged, reliable. Composition: single
centered weapon, soft violet ambience, very subtle glitch only. 3:4.
Negative prompt: text, watermark, logo, UI text, border frame, photorealistic,
lowres, blurry subject, oversaturated neon, full-screen glitch, deformed.
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
