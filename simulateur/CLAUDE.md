# CLAUDE.md — Simulateur de combat

Aide-mémoire pour Claude Code lorsqu'il travaille **dans le dossier `simulateur/`**.

## Rôle de l'outil

Calculateur / fiche de combat web pour *La Forteresse de l'Envie*. Ce **n'est pas**
un moteur de jeu automatique : il ne décide d'aucune victoire/défaite et ne lance
**aucun dé**. Les jets sont faits à la vraie table, et le MJ saisit les résultats à
la main. L'outil sert à éviter de tout gérer sur papier pendant les tests (PV, PA,
jetons, ordre sur la roue). Inspiration UX : l'app *Lotus* (compteurs Magic).

## Lancer l'outil

Aucun build, aucune dépendance. Deux options :

- Ouvrir `simulateur/index.html` directement dans un navigateur, **ou**
- Servir le dossier : `python -m http.server 8123 --directory simulateur`
  puis ouvrir `http://localhost:8123` (config prête dans `.claude/launch.json`).

L'état du combat est **persisté dans `localStorage`** (clé `fdle-simu-v1`).

## Architecture (vanilla JS, pas de framework)

```
simulateur/
├─ index.html          structure + ordre de chargement des scripts
├─ css/styles.css       thème sombre, cartes, impression
├─ data/                DONNÉES ÉDITABLES (assignent dans window.DB)
│  ├─ jetons.js          jetons/altérations (logo, couleur, max, négatif…)
│  ├─ classes.js         5 classes + stats de base + passifs
│  ├─ sorts.js           sorts (recto/verso des cartes)
│  ├─ armes.js           armes (cartes)
│  └─ monstres.js        bestiaire pré-rempli (stats + notes)
└─ js/
   ├─ rules.js           calculs de stats dérivées (cf. persos.base)
   ├─ wheel.js           roue d'initiative (déplacement, ordre, rejeu)
   ├─ store.js           état + persistance localStorage
   ├─ cards.js           rendu des cartes recto/verso
   └─ app.js             UI (combat, modale d'ajout, roue, cartes)
```

Les fichiers `data/*.js` sont volontairement de simples objets JS (≈ JSON) pour
être **modifiables facilement** sans outillage.

## Formules de stats dérivées (source : `campagne/personnages/persos.base`)

- `mod(stat)   = floor(stat/6) − 1`
- `PV          = 8 + 4·level + ceil(mod(CON)·level·1.5)`
- `casesABS    = floor(1 + VIT/3)` → **déplacement par tour global** sur la roue
- `Tours       = floor(casesABS/6)` · `cases = casesABS % 6`
- `Poids       = 30 + 3·CON + level·10`
- PJ : stats finales = stats de **classe** + **bonus perso** (12 pts à répartir).

> ⚠️ **Décision de règle** : le doc `Système de Vitesse (Roue d'Initiative).md`
> contient un ancien modèle de déplacement (« +2 bonus ») contredit par
> `persos.base`. C'est **`persos.base` qui fait foi** (ce sont les fiches réelles),
> donc `casesABS = floor(1 + VIT/3)`. Si la règle évolue, modifier `js/rules.js`
> (`casesABS`) et `js/wheel.js`.

## Roue d'initiative (`js/wheel.js`)

- 6 cases. Chaque pion a une position **absolue cumulée** `abs` ; il avance de
  `casesABS` cases à chaque tour global.
- **Flèche** = pion le plus en retard (`arrowAbs = min(abs)`), elle le suit.
- **Ordre** : le plus éloigné de la flèche joue en premier ; égalité → VIT la plus
  haute, puis priorité aux **PJ**.
- **Rejeu** : un pion qui dépasse la flèche d'un tour complet rejoue :
  `nbActivations = floor((abs − arrowAbs)/6) + 1`.
- Tout est **ajustable à la main** dans l'UI (boutons *repousser / avancer* sur
  l'acteur actif) pour gérer Repousser, effets spéciaux, ou corriger le MJ.

## Fonctionnalités

- **Multi-combattants** PJ & monstres, avec stats de base et **stats dérivées**
  affichées (PV, cases/tours, poids, modificateurs).
- **PV / PA / Shell Control** modifiables **à tout moment** (boutons ± ou saisie
  directe), utile en début de combat. PV borné par PV max ; Shell 0–10.
- **Équipement (bouton ⚙ sur la fiche, ou à la création)** :
  - **PJ** : arme, **jusqu'à 6 sorts**, **1 sort de défense**, **1 Shell Control**.
  - **Monstre** : **attaques** (nom/dé/effet), **défense**, **passif** affiché en
    encadré. Préréglages depuis `data/monstres.js`.
- **Jetons sur piste de durée** : colonnes **P (permanent) + 1→6 tours**. On pose
  un jeton (palette `data/jetons.js`) à la durée voulue ; bouton **« −1 tour »**
  pour décaler toute la piste (réduction **manuelle**, comme à la table). `max`
  respecté, couleur + logo.
- **Roue d'initiative** visuelle + liste d'ordre cliquable + journal d'actions.
- **Flux d'action** (les dés restent faits à la table) :
  - PJ **✨ Sort** → liste les sorts équipés, **décompte les PA** du sort choisi.
  - PJ **🗡️ Attaquer** → utilise l'**arme équipée**.
  - PJ **🛡️ Défense** / **🎮 Shell** (Shell consomme 10 points).
  - Monstre **⚔️ Attaque** → liste ses attaques + bouton **🎲** (tirage aléatoire),
    sans PA. Monstre **🛡️ Défense**.
  - Après le choix, on sélectionne une **cible**, l'**AOE équipe adverse**, ou
    « sans cible ». La **zone de Résolution** affiche alors la carte jouée
    (sort/arme) **face à la carte de défense de la/des cible(s)**.
  - Plus **+1 PA**, **Concentration (+2)**, **Potion**.
- **Cartes** (onglet *Cartes*) : sorts (y compris **Shell Control**) et armes,
  recto/verso avec **flip 3D**, filtrables et **imprimables** (recto+verso côte à
  côte) pour servir d'aide-mémoire aux joueurs.

## Conventions d'édition

- Ajouter un **jeton** : copier un bloc dans `data/jetons.js` (`id`, `nom`, `icone`
  emoji, `couleur` hex, `negatif`, `max`, `desc`).
- Ajouter un **sort/arme** : suivre la structure existante (`table.entetes` +
  `table.lignes`) ; le verso se génère tout seul.
- Ajouter un **monstre** au bestiaire (`data/monstres.js`) : `stats`, `level`,
  `passif` (texte), `attaques: [{nom, de, desc?, table?}]`, `defense: {nom, de?,
  desc?, table?}`. Sélectionnable comme préréglage dans la modale.
- Toute nouvelle **formule** dérivée → `js/rules.js`, en gardant `persos.base`
  comme référence.
- Garder le **français** partout (noms, libellés, commentaires).
