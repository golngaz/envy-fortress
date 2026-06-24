# Illustrations de cartes

Déposez ici les visuels de cartes (sorts, armes, attaques de monstres).

- Le champ `image` des données (`data/sorts.json`, `data/armes.json`, …) ne contient
  que le **nom du fichier** (ex. `foudre.png`). Le render concatène automatiquement
  le préfixe `assets/cartes/` (constante `IMG_BASE` dans `js/cards.js`).
- Une **URL** (`https://…`) ou un **chemin complet** (commençant par `/`, `./` ou
  contenant un `/`) sont aussi acceptés tels quels.
- Format recommandé : portrait **3:4** (ex. 600×800), sans texte (le titre, les
  badges et le tableau sont dessinés par l'application).
- Direction artistique et prompts IA : voir `simulateur/ART_DIRECTION.md`.
