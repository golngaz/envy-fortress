# CLAUDE.md — Simulateur de combat

Aide-mémoire pour Claude Code lorsqu'il travaille **dans le dossier `simulateur/`**.

## Rôle de l'outil

Calculateur / fiche de combat web pour *La Forteresse de l'Envie*. Ce **n'est pas**
un moteur de jeu automatique : il ne décide d'aucune victoire/défaite et ne lance
**aucun dé**. Les jets sont faits à la vraie table, et le MJ saisit les résultats à
la main. L'outil sert à éviter de tout gérer sur papier pendant les tests (PV, PA,
jetons, ordre sur la roue). Inspiration UX : l'app *Lotus* (compteurs Magic).

## Lancer l'outil

Aucun build. **Serveur en Node** (`server.js`, **zéro dépendance npm** : modules
natifs `http`/`fs`/`path`) et tout est **dockerisé** — rien à installer sur la
machine hôte au-delà de Docker. Le simulateur doit être **servi** (les sorts/armes
sont des `.json` chargés par `fetch`, bloqué en `file://`) ; le serveur expose aussi
les trois endpoints d'écriture de l'Éditeur :

- **Docker (recommandé)** : `docker compose up serve` → `http://localhost:8123`
- **Node direct** : `npm start` (ou `node server.js`) depuis `simulateur/`
- **Lanceurs** : `lancer-simulateur.bat` (Windows) / `./lancer-simulateur.sh`
  (Linux-macOS) — ils préfèrent Docker, basculent sur Node, ouvrent le navigateur.

`server.js` écoute `8123` par défaut ou `$PORT` si défini (la preview
`.claude/launch.json` met `autoPort` → un port libre si 8123 est pris). Il sert les
fichiers statiques ET expose `save-card`, `delete-card`, `upload-image` (voir plus
bas). Ouvert en `file://`, le combat marche mais sorts/armes/cartes restent vides
(bandeau d'avertissement). `boot.js` ajoute un cache-bust au `fetch` des JSON :
après édition d'un `.json`, un simple rechargement suffit.

**Tests** : `docker compose run --rm test` (ou `npm test` → `node tests/run.js`),
ou la **page dédiée** servie à `/tests/` (onglet **Tests** de l'outil). Ils valident
le moteur de la roue (`js/wheel.js`).

L'état du combat est **persisté dans `localStorage`** (clé `fdle-simu-v1`).

## Architecture (vanilla JS, pas de framework)

```
simulateur/
├─ index.html          structure + ordre de chargement des scripts (+ onglet Tests → /tests/)
├─ server.js           serveur Node statique + API (save-card / delete-card / upload-image ; port $PORT|8123) ; zéro dépendance
├─ package.json        scripts npm : `start` (serveur), `test` (tests roue)
├─ Dockerfile          image node:alpine
├─ docker-compose.yml  services `serve` (port 8123) et `test`
├─ lancer-simulateur.bat / .sh   lanceurs (Windows / Linux-macOS) → Docker, sinon Node
├─ ART_DIRECTION.md     direction artistique des cartes + prompts IA
├─ css/
│  ├─ styles.css         thème sombre, UI combat/modales/éditeur, impression
│  └─ cards.css          cartes « Arcane Glitch » (flip, zone image, animations)
├─ data/
│  ├─ jetons.js          jetons/altérations (.js commenté : logo, couleur, max…)
│  ├─ classes.js         5 classes + stats de base + passifs (.js commenté)
│  ├─ monstres.js        bestiaire (.js commenté : stats + passif + attaques + défense)
│  ├─ sorts.json         sorts (JSON pur ; champ `image` = nom de fichier seul)
│  └─ armes.json         armes (JSON pur ; champ `image` = nom de fichier seul)
├─ js/
│  ├─ rules.js           calculs de stats dérivées (cf. persos.base)
│  ├─ wheel.js           MOTEUR roue d'initiative (pur, testable ; absolu + ligne de flèche `fa`)
│  ├─ store.js           état + persistance localStorage + bibliothèque + export/import
│  ├─ cards.js           rendu des cartes (zone image + glyphe ; IMG_BASE)
│  ├─ cardbuilder.js     éditeur de cartes manuel + export JSON (onglet Éditeur)
│  ├─ app.js             UI (combat, modale d'ajout, roue, cartes) — expose window.App
│  └─ boot.js            charge sorts.json/armes.json (fetch) puis App.init()
└─ tests/
   ├─ harness.js         harnais de test minimal (Node + navigateur)
   ├─ wheel.test.js      suites de tests de la roue (fonctions `suite*`)
   ├─ run.js             runner Node (`npm test`)
   └─ index.html         page de tests dédiée (servie à /tests/)
```

- **`data/sorts.json` & `data/armes.json`** : JSON pur, chargés par `fetch` dans
  `boot.js`. Format identique à la sortie de l'onglet **Éditeur** → coller un objet
  exporté dans le tableau JSON suffit à ajouter une carte.
- **`jetons.js`, `classes.js`, `monstres.js`** : restent du `.js` commenté
  (assignent dans `window.DB`, chargés en `<script>` synchrone) car ils servent de
  config documentée et ne passent pas par l'Éditeur.
- **Champ `image`** : on ne met que le **nom du fichier** (ex. `foudre.png`) ;
  `cards.js` préfixe `IMG_BASE` (`assets/cartes/`). Une URL ou un chemin complet
  (avec `/`, `http`, `data:`) est gardé tel quel. Sinon → glyphe arcanique par type.

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

Moteur **pur et testable** (`Wheel.createEngine()`), validé par `tests/` (page
`/tests/`, ou `npm test` / `docker compose run --rm test`). `store.js` ne fait que
le **piloter** : il construit la liste des pions depuis les combattants (`pawnList`),
appelle le moteur (`syncEngine`/`pullEngine`), et persiste son état dans `state.wheel`.
Le modèle complet est documenté en tête de `js/wheel.js` ; en résumé :

- **Positions ABSOLUES** : chaque combattant porte `c.wa` (entier cumulé). Case
  visible (0..5) = `Wheel.caseOf(c)` = `((wa % 6) + 6) % 6`. L'absolu sert à compter
  les **tours** ; l'ordre et l'affichage de la flèche raisonnent en cases visibles.
- **Flèche, deux quantités** : `farrow` (case affichée) = la queue de course —
  au tour global, la case du pion le plus en retard ; un **recul** depuis la case de
  la flèche la fait **suivre** le pion reculé ; sinon elle ne remonte pas vers l'avant
  tant que sa case reste occupée. Et `fa` (ligne en **absolu**, prise en **minimum
  courant** du tour) = la référence stable pour les tours : un pion lapé qui ré-avance
  **ne fait pas disparaître** les tours gagnés par les autres, mais un lappeur qui
  recule reperd les siens (compte **live** sur `P.a`).
- **Ordre** : le plus loin de la flèche (vers l'avant, en cases) joue d'abord, le
  pion collé à la flèche en dernier ; égalité → VIT la plus haute, puis **PJ**.
- **Cubes bonus** en fin de frise, dans l'ordre : **(1) tours** `⌊(P.a−fa)/6⌋`
  journalisés (`lapLog`) donc **chronologiques** ; **(2) sous-tours** (un pion qui
  partait derrière/sur la flèche la dépasse par l'avant) ; **(3) recaptures** (un pion
  devant la flèche, repoussé dessus/derrière, fait rejouer la flèche).
- **Base de frise FIGÉE** : l'ordre de jeu se (re)fixe au **tour global** (et à
  l'ajout/retrait) ; un déplacement **manuel** (avance/repousse) **ne réordonne pas**
  la frise — il ne fait qu'ajouter/retirer des **cubes bonus**.
- **Modèle « un seul tour »** : tout repart au tour global suivant (toute la mémoire
  — high-water, `fa`, `lapLog` — est remise à zéro).
- Tout est **ajustable à la main** dans l'UI (boutons *repousser / avancer* sur
  l'acteur actif) pour gérer Repousser, effets spéciaux, ou corriger le MJ.

## Fonctionnalités

- **Multi-combattants** PJ & monstres, avec stats de base et **stats dérivées**
  affichées (PV, cases/tours, poids, modificateurs).
- **PV / PA / Shell Control** modifiables **à tout moment** (boutons ± ou saisie
  directe), utile en début de combat. PV borné par PV max ; Shell 0–10.
- **Équipement (bouton ⚙ sur la fiche, ou à la création)** :
  - **PJ** : arme, **jusqu'à 6 sorts**, **1 sort de défense**, **1 Shell Control**.
    Un champ **filtre** au-dessus de la liste de sorts aide à les retrouver.
  - **Monstre** : **attaques** (nom/dé/effet), **défense**, **passif** affiché en
    encadré. Préréglages depuis `data/monstres.js`. **Autocomplétion d'import**
    (datalists `dl-sorts-armes` / `dl-defenses`) : taper un nom de sort/arme ajoute
    une attaque pré-remplie ; un nom de sort de défense remplit le bloc Défense.
- **Jetons sur piste de durée** : colonnes **P (permanent) + 1→6 tours**. On pose
  un jeton (palette `data/jetons.js`) à la durée voulue ; bouton **« −1 tour »**
  pour décaler toute la piste (réduction **manuelle**, comme à la table). `max`
  respecté, couleur + logo.
- Chaque fiche affiche le **déplacement par tour** décomposé en **cases + tours**
  (ex. 8 cases ⇒ « 2 cases + 1 tour »), via `Rules.derive` (cases = casesABS%6,
  tours = ⌊casesABS/6⌋).
- **Roue d'initiative** visuelle (SVG persistant, thème arcanique : halo, anneaux
  runiques tournants, jetons lumineux colorés PJ/PNJ portant les **2 premières
  lettres** du nom). Les pions **s'animent** vers leur nouvelle case (transition CSS)
  et un **éclat magique** se déclenche à chaque tour global. + liste d'ordre
  cliquable + journal d'actions.
  - **Modèle (cf. `js/wheel.js`)** : positions **absolues** `c.wa` (case visible via
    `Wheel.caseOf`). La **flèche** = aiguille pivotant vers le **pion le plus en
    retard** (`a` minimal) = le dernier de la course ; un **recul** la fait suivre le
    pion reculé. Voir la section *Roue d'initiative* ci-dessus pour le détail des
    rejeux (dépassement avant / pass arrière).
  - **Frise de priorité** (`state.frieze`, cubes colorés sous la roue) = l'ordre de
    jeu du tour : un cube par combattant (le plus éloigné de la flèche d'abord), puis
    **un cube bonus à la TOUTE FIN** pour chaque **dépassement de flèche** (au tour
    global comme aux déplacements **manuels** avance/repousse via `Store.nudge`).
    Toute la logique vit dans le moteur `Wheel` (testé) ; `store.js` le pilote.
    Cliquer un cube (ou la liste d'ordre) sélectionne l'acteur ; « Acteur suivant »
    avance le curseur.
  - Ajustement manuel **±1 case** (repousser / avancer) sur l'acteur actif.
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
- **Passif de classe** : cliquer le nom de classe sur la fiche déplie ses passifs ;
  ils s'affichent aussi en direct dans la modale d'ajout/édition (le passif du
  monstre, lui, est toujours visible en encadré).
- **Bibliothèque** (bouton 📚) : 💾 sur une fiche enregistre un **modèle** (PJ ou
  monstre, ressources réinitialisées) ; on le réinjecte ensuite dans n'importe quel
  combat. **⧉ Duplique** un combattant existant (ex. plusieurs monstres identiques).
  Stockée à part dans `localStorage` (clé `fdle-simu-lib-v1`), survit au « Tout effacer ».
- **Export / Import du combat complet** : **⬇️ Exporter** télécharge un **JSON** de
  tout l'état (combattants, PV/PA/Shell, jetons, roue, journal) ; **⬆️ Importer**
  recharge ce JSON. Idéal pour sauvegarder une session et la reprendre plus tard.
- **Cartes** (onglet *Cartes*) : sorts (y compris **Shell Control**) et armes,
  recto/verso avec **flip 3D**, filtrables et **imprimables** (recto+verso côte à
  côte) pour servir d'aide-mémoire aux joueurs. Direction artistique « Arcane
  Glitch » (bleu-violet, glitch subtil, accent coloré par type) décrite dans
  `ART_DIRECTION.md` — ce fichier contient aussi **2 prompts IA** (style maître +
  template par carte) pour générer les visuels.
  - Style des cartes isolé dans **`css/cards.css`** (structure flip, zone image,
    animations : halo pulsé, scanlines, shimmer, glitch du titre).
  - **Zone image** : champ optionnel `image` (URL/chemin) sur un sort/arme/attaque ;
    sinon un glyphe arcanique par type sert de placeholder.
  - ⚠️ **Compat Firefox** : `.carte-face` (l'élément retourné en 3D) ne doit porter
    NI pseudo-élément, NI `mix-blend-mode`, NI `filter`, sinon Firefox casse le
    `backface-visibility` (on ne voyait plus le dos). Les effets vivent dans des
    enfants non-3D (`.carte-art`, `.carte-body`).
- **Éditeur de cartes** (onglet *Éditeur*, `js/cardbuilder.js`) : crée une carte à
  la main (sort ou arme), aperçu live dans le vrai cadre.
  - **💾 Sauvegarder sur le serveur** : `POST /api/save-card` → upsert (par `id`)
    dans `data/sorts.json` / `data/armes.json` (nécessite `server.js`).
  - **Upload d'image à la volée** : choisir un fichier → aperçu instantané (data URL)
    + `POST /api/upload-image?name=…` qui l'écrit dans `assets/cartes/`. Pas de
    recadrage ni de vérif — format conseillé **portrait 3:4 (ex. 600×800), PNG/JPG**.
  - Sinon, **export JSON** (copier / télécharger / ajouter à la session) reste
    disponible pour une intégration manuelle.
  - Endpoints servis par `server.js` uniquement ; avec un simple serveur statique
    (lecture seule), ces boutons renvoient une erreur explicite.
- **Supprimer une carte** : dans l'onglet *Cartes*, un bouton 🗑 (au survol) sur
  chaque carte appelle `POST /api/delete-card` (retire l'entrée par `id` du JSON).
  L'**image n'est pas supprimée** du dossier `assets/cartes/` (volontaire).
- **Affichage image** : le fond est posé en **`background-image` inline direct**
  (pas via une variable CSS `--img`, peu fiable sous Firefox). Les images
  s'affichent donc partout : galerie, aperçu de l'Éditeur et zone de Résolution.

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
