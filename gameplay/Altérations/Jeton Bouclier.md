---
joueur: visible
Négatif: false
max: 1
---
Le jeton **peut être** dépensé **avant** une attaque défendable pour **annuler tous les dégâts** subis.  
Les effets secondaires de l’attaque (statuts) peuvent ou non s’appliquer selon leur nature : par exemple, un effet de feu est bloqué, tandis qu’un effet comme [[Électrisé]] peut toujours s’appliquer.
Certaines attaques ne peuvent pas être défendues par un jeton bouclier.

Voici la liste des effets et attaquent qui peuvent ignorent le bouclier.

```base
views:
  - type: table
    name: Table
    filters:
      and:
        - file.folder.containsAny("gameplay/statuts & jetons", "gameplay/dégats")
        - Négatif == true
        - note["ignore bouclier"] == true
    order:
      - file.name
      - ignore bouclier
    columnSize:
      file.name: 173

```
