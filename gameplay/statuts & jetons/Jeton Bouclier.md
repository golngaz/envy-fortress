---
Négatif: "false"
joueur: visible
---
Le jeton peut être dépensé **avant** une attaque défendable pour **annuler tous les dégâts** subis.  
Les effets secondaires de l’attaque (statuts) peuvent ou non s’appliquer selon leur nature : par exemple, un effet de feu est bloqué, tandis qu’un effet comme [[Électrisé]] peut toujours s’appliquer.

Voici la liste des effets qui peuvent "traverser" le bouclier

```base
views:
  - type: table
    name: Table
    filters:
      and:
        - file.folder == "gameplay/statuts & jetons"
        - Négatif == "true"
        - note["Ignoré si défendu"] == "true"
    order:
      - file.name
      - Ignoré si défendu
    columnSize:
      note.Négatif: 172

```
