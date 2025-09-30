---
classe: "[[Le Chevalier]]"
bonus CON: 6
bonus VIT: 16
bonus CTRL: 10
bonus FOR: 0
bonus VOL: 0
bonus INT: 0
level: 1
---

```base
formulas:
  CON: note["bonus CON"] + note["classe"].asFile().properties["CON"]
  CTRL: note["bonus CTRL"] + note["classe"].asFile().properties["CTRL"]
  FOR: note["bonus FOR"] + note["classe"].asFile().properties["FOR"]
  INT: note["bonus INT"] + note["classe"].asFile().properties["INT"]
  VIT: note["bonus VIT"] + note["classe"].asFile().properties["VIT"]
  VOL: note["bonus VOL"] + note["classe"].asFile().properties["VOL"]
  Poid: 30 + 3 * formula.CON + note.level * 10
  Vitesse: '"+" + (formula.VIT / 3 + (note.level/2)).floor().toString()'
  PV: 6 + formula.CON * note.level
views:
  - type: table
    name: Table
    filters:
      and:
        - file.folder == "campagne/personnages"
    order:
      - file.name
      - classe
      - formula.CON
      - formula.CTRL
      - formula.FOR
      - formula.INT
      - formula.VIT
      - formula.VOL
      - formula.Poid
      - formula.Vitesse
      - formula.PV
    sort:
      - property: formula.Vitesse
        direction: ASC
    columnSize:
      note.bonus CON: 112

```

