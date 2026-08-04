---
joueur: visible
---
Souvent désigné simplement par « cases », le **bonus de nombre de cases** apparaît sur la fiche personnage et dépend de la [[Vitesse (VIT)]]. Il est indépendant du **modificateur de Vitesse** (`+VIT`), également présent sur la fiche, qui sert pour les jets ([[Jet de sauvegarde]]) ou pour ajouter un bonus à la VIT.

Il indique de **combien de cases** un pion avance sur la [[Système de Vitesse (Roue d’Initiative)|roue d'initiative]] à chaque [[tour global]].

> **cases (absolu) = ⌊1 + VIT ⁄ 3⌋**  *(arrondi à l'inférieur)*
> - **VIT 0 → 1 case** ; chaque tranche de **3 VIT** ajoute **1 case** (VIT 3 → 2, VIT 6 → 3…).
> - Un résultat **nul ou négatif** → le pion **ne bouge pas**.

Comme la roue ne compte que **6 cases**, on peut décomposer ce total en **cases + tours** (c'est la forme affichée sur la fiche) :

- **Tours** = nombre de tours complets de roue = `cases_abs ⁄ 6` (division entière).
- **Cases individuelles** = ce qui reste = `cases_abs mod 6`.

> [!example]
> `cases_abs = 8` (VIT 21) → **8 cases**, soit **1 tour complet (6) + 2 cases**.
