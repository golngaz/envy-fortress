---
joueur: visible
---
Souvent désigné simplement par « cases », le bonus de nombre de cases apparaît sur la fiche personnage et dépend de la [[Vitesse (VIT)]]. Il est indépendant de l’additionneur de VIT, également présent sur la fiche, qui sert notamment pour les jets ([[Jet de sauvegarde]]) ou pour ajouter un bonus à la VIT.

Le **bonus de nombre de cases** correspond au **bonus absolu**, calculé comme la VIT divisée par 3, arrondie à l’inférieur (formule : `cases_abs = VIT // 3`).

On peut l’exprimer de la manière  :

- **Cases individuelles** : chaque case que le joueur peut parcourir, vaut le reste de la division de la VIT par 3 (`cases_abs mod 3`).
- **Tours** : le nombre de tours qu’un personnage peut parcourir en plus des cases individuelles. Correspond à la division entière de la VIT par 3 (`cases_abs // 3`).

La fiche le représente dans la seconde manière cases + tour