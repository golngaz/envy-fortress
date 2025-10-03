---
classe: "[[Le Mage]]"
bonus CON: 0
bonus VIT: 0
bonus CTRL: 2
bonus FOR: 0
bonus VOL: 0
bonus INT: 4
level: 1
joueur: visible
inventaire:
  - "[[Vieux baton]]"
  - "[[Morgenstern du géant bleu]]"
---

```base
formulas:
  poids: note.inventaire.map(value.asFile().properties.poids).join(' - ')
properties:
  formula.poids:
    displayName: les poids
views:
  - type: table
    name: Table
    filters:
      and:
        - file.folder == "campagne/personnages"
        - file.ext == "md"
    order:
      - file.name
      - poids
      - formula.poids

```

