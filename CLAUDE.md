# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Nature du dépôt

Ce dépôt est un **vault Obsidian** (pas un projet logiciel) qui sert de wiki à un
JDR homebrew en français : *La Forteresse de l'Envie*. Le contenu, les noms de
fichiers et les notes sont en **français** — rédige et nomme les fichiers en français.
Le lecteur est soit le **MJ** (Maître du Jeu), soit les joueurs.

## Outillage & commandes

Il n'y a ni build, ni lint, ni suite de tests. La « tooling » se résume à :

- **Synchronisation** : le plugin `obsidian-git` auto-commite avec le message
  `vault backup: {{date}}` (format `YYYY-MM-DD HH:mm:ss`), `pullBeforePush` actif,
  fusion via `merge`. Le travail normal se fait depuis Obsidian ; en CLI, fais des
  commits classiques sur `main`.
- **Simulation de la roue** : la mécanique de la roue d'initiative (ordre de jeu
  basé sur la Vitesse) vit désormais dans le **moteur testé** `simulateur/js/wheel.js`
  (validé par `simulateur/tests/`, lancé via `npm test` ou la page **Tests** de
  l'outil). Il modélise la mécanique décrite dans
  `gameplay/Système de Vitesse (Roue d’Initiative).md`.
- **Simulateur de combat (web)** : dossier `simulateur/` — calculateur/fiche de
  combat en HTML/CSS/JS vanilla (aucun build), serveur **Node zéro dépendance**
  (`server.js`), tout **dockerisé**. C'est une **aide de jeu, pas un moteur** : il
  ne lance aucun dé et ne décide d'aucune victoire — le MJ saisit à la main les
  résultats des jets faits à la table. Détail complet (lancement, architecture,
  formules, roue, fonctionnalités, conventions et style de code) dans la section
  **« Simulateur de combat »** en fin de fichier.
- **Export** : plugin `better-export-pdf` pour générer des PDF de règles/fiches.
- `.gitignore` exclut les caches de workspace Obsidian ; `.gitattributes` force `eol=lf`.
- `jdr.rar` est une archive binaire volumineuse (~22 Mo) — ne pas modifier.

## Organisation du contenu

Dossiers de premier niveau (chacun est une catégorie de wiki) :

- `gameplay/` — règles centrales. **Point d'entrée** : `Livret - Règles à flatifier.md`
  (liste des pages « flatifiées » en un manuel imprimable). Aussi `Glossaire.md` (réf. des
  termes), `traits/` (les 6 stats), `jets/` (jets de dés par stat), `mécaniques/`, `dégats/`.
- `classes/` — classes jouables (Mage, Chevalier, Scélérat, Architecte, Dueliste).
- `Sorts/Niveau N/` — sorts rangés par niveau, avec sous-dossiers thématiques
  (`soin/`, `sorts passifs/`, `Shell control/`).
- `Altérations/` — jetons d'état / statuts (`Jeton …`).
- `items/armes/{départ,loot,drop}/` — armes selon leur provenance.
- `monstres/` — bestiaire (+ `monstres/sorts/` pour leurs capacités).
- `campagne/` — contenu de la campagne en cours : `scenarios/`, `combats/` (par
  étage/lieu), `personnages/` (PJ et PNJ).
  - **Fiches de combat** (`combats/…`, suffixées `(combat)` quand le nom entre en
    collision avec un monstre/lore) : chaque fiche **détaille les monstres qui la
    composent** (nombre + wikilinks vers `monstres/`), les **loots spéciaux**
    éventuels, la **musique** d'ambiance et le **contexte** (lieu, déclencheur, lien
    vers le scénario). Frontmatter `difficulty`. Liens externes (audio/vidéo)
    **autorisés ici** (≠ livret). Chaque fiche **s'ouvre sur un résumé très condensé
    de la stratégie/solution** (callout `> [!abstract] Solution express (MJ)`, à lire
    en premier) : en 3-4 lignes, comment on gagne, pour qu'un MJ saisisse la rencontre
    d'un coup d'œil avant le détail.
  - **Système de combat = J-RPG en tour par tour** : on **cible des cibles** (PJ,
    monstres, sbires, victimes), point. **Pas de zones, de positions, de
    portée/déplacement tactique, de couverture/cachettes, ni d'« actions spéciales »
    improvisées** (secouer, escalader, renverser un décor…). Une **AOE** = **plusieurs
    cibles désignées** d'un coup, pas une aire géographique. Pour **retirer une
    altération** à une cible (p. ex. réveiller un charmé), un **allié la frappe** — il
    n'existe pas de manipulation hors-attaque. Conçois les combats dans ce cadre.
  - **Combats = puzzles** : conçois chaque rencontre comme un *combat-puzzle*. Une
    stratégie basique (« on tape la cible la plus proche / la plus en avant jusqu'à
    ce qu'elle tombe ») doit être **volontairement sous-optimale**. Le combat doit
    récompenser la lecture d'un **mécanisme** : une boucle à briser (boss intouchable
    tant que ses serviteurs vivent → cf. [[Maître de la tour]], [[Croque mort gardien]]),
    une **condition** d'ouverture (humilier/isoler une clé de voûte, rompre une
    formation, épuiser une réserve de défense), un ordre d'actions, un usage de l'AOE
    ou d'une altération. Le passif du monstre **est** l'énigme ; explicite
    la solution en note MJ sans la rendre triviale.
  - **Les scénarios renvoient toujours aux combats** par wikilink : un combat n'est
    jamais détaillé dans le scénario, seulement référencé.
- `LORE/` — univers, lieux (étages de la forteresse), familles (`Famille Sombreval`).
- `assets/` — ressources non-wiki : `images/`, `musique/`, `police/`, `bases/`, et les
  sources Photoshop des fiches (`fiche-personnage*.psb`). Référencé par les notes, pas
  du contenu rédigé.
- **Notes de travail à la racine** (méta, hors-wiki) : `TODO.md`, `Equilibrage.md`,
  `brainstorm - idées.md`, `INSPIRATIONS.md`, `Matériel à concevoir.md`, `Musiques.md`,
  `Cheat sheet Obsidian.md`. Ce sont des aide-mémoire de conception, pas des pages de
  jeu — ne pas les traiter comme du wiki ni les inclure dans le livret.

## Conventions à respecter

**Statistiques** — six stats de base partout : `CON` (Constitution), `FOR` (Force),
`VIT` (Vitesse), `CTRL` (Contrôle), `INT` (Intelligence), `VOL` (Volonté). Les classes
et monstres les portent dans le frontmatter YAML. Le **modificateur** d'une stat =
`(stat / 6) - 1`, arrondi à l'inférieur (cf. `gameplay/Création de personnage.md`).

**Frontmatter YAML** — porteur de données structurées, pas que décoratif :
- `joueur: visible` marque une note consultable par les joueurs (sinon réservée au MJ).
- Classes/monstres : `CON/CTRL/FOR/INT/VIT/VOL` + `level`.
- Sorts : `PA` (coût en Points d'Action).
- Altérations : `Négatif` (bool), `max` (nb de jetons cumulables).
- Combats : `difficulty`.

**Liens Obsidian** — utilise massivement les wikilinks `[[Nom de note]]` pour relier
sorts, jetons, items et personnages, et les embeds `![[Nom]]` pour inclure une note
(p. ex. l'attaque d'un monstre embarque sa fiche d'arme). Garde ces liens cohérents
quand tu renommes ou crées des notes.

**Mise en forme** — callouts Obsidian (`> [!tip]`, `> [!abstract]`, `> [!info]`,
`> [!danger]`) pour passifs et encadrés ; tableaux de résolution avec une colonne
`DD (1D10)` (Degré de Difficulté) listant les effets par palier (`4+`, `8`, `10+`…).

**Fichiers `.base`** — bases de données Obsidian (vues tabulaires), pas du markdown.

## Vocabulaire clé (voir `gameplay/Glossaire.md`)

`PJ` joueur · `PNJ`/`MJ` · `PA` Point d'Action · `PV` Points de Vie · `JdS` Jet de
Sauvegarde · `DD` Degré de Difficulté · **Altération** = état symbolisé par un jeton ·
**Phases de progression** (temps réel) vs **Phases de combat** (tour par tour) ·
**Safe zone** (repos / changement d'équipement).

## Règle d'écriture — pages du livret
> Ce livret est **aplati** (« flatifié ») en un seul document imprimable. Les pages listées ci-dessous doivent donc être **autonomes**, comme un vrai manuel — pas comme un wiki :
> - **Aucun lien externe** (URL `http`, audio, vidéo YouTube, `iframe`) : inutile sur papier, et cela casse l'export PDF. Réserve-les aux fiches de scénario/ambiance, jamais aux règles du livret.
> - **Évite les wikilinks vers des pages hors-livret** : un `[[…]]` qui pointe ailleurs devient du **texte mort** une fois imprimé. Si une notion est nécessaire, **réécris-la sur place** (version condensée) au lieu d'y renvoyer — comme la règle de fuite, condensée dans [[Combat]].
> - **Embeds `![[…]]`** tolérés (leur contenu est inséré), mais le bloc inséré doit lui-même respecter ces règles — et **éviter les `.base`** (bases de données qui ne s'impriment pas).

---

# Simulateur de combat (`simulateur/`)

Aide-mémoire pour tout travail **dans le dossier `simulateur/`**. Sauf mention
contraire, les chemins de cette section sont **relatifs à `simulateur/`**.

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
│  ├─ wheel.js           MOTEUR roue d'initiative (pur, testable, typé JSDoc ; positions absolues + ligne de flèche `arrowLine`)
│  ├─ store.js           état + persistance localStorage + bibliothèque + export/import
│  ├─ cards.js           rendu des cartes (zone image + glyphe ; IMG_BASE)
│  ├─ cardbuilder.js     éditeur de cartes manuel + export JSON (onglet Éditeur)
│  ├─ app.js             UI (combat, modale d'ajout, roue, cartes) — expose window.App
│  ├─ outils.js          onglet Outils : menu latéral + calculateur de jets de dés
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

- **Positions ABSOLUES** : chaque combattant porte `c.wa` côté Store (entier cumulé),
  reflété sur `positionAbsolue` côté pion. Case visible (0..5) = `Wheel.caseOf(c)` =
  `((wa % 6) + 6) % 6`. L'absolu sert à compter les **tours** ; l'ordre et l'affichage
  de la flèche raisonnent en cases visibles.
- **Flèche, deux quantités** : `arrowCase` (case affichée 0..5) = la queue de course —
  au tour global, la case du pion le plus en retard ; un **recul** depuis la case de
  la flèche la fait **suivre** le pion reculé ; sinon elle ne remonte pas vers l'avant
  tant que sa case reste occupée. Et `arrowLine` (ligne en **absolu**, prise en
  **minimum courant** du tour) = la référence stable pour les tours : un pion lapé qui
  ré-avance **ne fait pas disparaître** les tours gagnés par les autres, mais un
  lappeur qui recule reperd les siens (compte **live** sur `positionAbsolue`).
- **Ordre** : le plus loin de la flèche (vers l'avant, en cases) joue d'abord, le
  pion collé à la flèche en dernier ; égalité → VIT la plus haute, puis **PJ**.
- **Cubes bonus** en fin de frise, dans l'ordre : **(1) tours**
  `⌊(positionAbsolue − arrowLine)/6⌋` journalisés (`lapCubes`) donc **chronologiques** ;
  **(2) sous-tours** (un pion qui partait derrière/sur la flèche la dépasse par
  l'avant) ; **(3) recaptures** (un pion devant la flèche, repoussé dessus/derrière,
  fait rejouer la flèche).
- **Base de frise FIGÉE** : l'ordre de jeu se (re)fixe au **tour global** (et à
  l'ajout/retrait) ; un déplacement **manuel** (avance/repousse) **ne réordonne pas**
  la frise — il ne fait qu'ajouter des **cubes bonus** à la fin sur un dépassement de
  flèche (les tours déjà gagnés restent : *sticky*, jamais retirés au recul).
- **Modèle « un seul tour »** : tout repart au tour global suivant. La mémoire
  (high-water, `arrowLine`, `lapCubes`) est remise à zéro **et** les positions sont
  **repliées sur une seule fenêtre de tour** (`collapseToOneLap`, cases visibles
  préservées) : les écarts multi-tours accumulés s'effacent, donc **les cubes bonus
  disparaissent d'un tour sur l'autre** — seuls ceux gagnés pendant le tour en cours
  restent.
- **Réinitialisation** (`engine.reset`, piloté par `Store.resetWheel`) : tous les
  pions case 1 (`positionAbsolue = 0`), tour 1, flèche et frise à neuf ; les PV/PA/
  jetons des combattants sont **conservés** (gérés côté Store).
- Tout est **ajustable à la main** dans l'UI (boutons *repousser / avancer* sur
  l'acteur actif) pour gérer Repousser, effets spéciaux, ou corriger le MJ.
- **Typage** : `js/wheel.js` est entièrement typé en **JSDoc** (typedefs `Pion`,
  `CubeFrise`, `EtatRoue`, `Moteur` + `@param`/`@returns` sur chaque fonction). Le
  champ d'état interne s'appelle `self`. **Cette version de la logique est gelée** :
  les `tests/wheel.test.js` (143/143) en sont le contrat — toute modif doit les
  garder verts.

## Fonctionnalités

- **Multi-combattants** PJ & monstres, avec stats de base et **stats dérivées**
  affichées (PV, cases/tours, poids, modificateurs).
- **PV / PA / Shell Control** modifiables **à tout moment** (boutons ± ou saisie
  directe), utile en début de combat. PV borné par PV max ; Shell 0–10.
- **Bloqué** (bouton ⛔ sur la fiche, `c.blocked`) : marque un combattant hors
  combat / incapable d'agir → **fiche en rouge**, actions remplacées par une note,
  ses boutons d'action masqués. Il **reste présent sur la roue et dans la frise**
  (pion et cube marqués en rouge/barrés), il n'en est **pas** retiré.
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
- **Onglet Outils** (`js/outils.js`) : boîte à outils MJ avec **menu latéral**
  (registre `OUTILS` en tête de fichier — ajouter une entrée suffit à créer un
  nouvel outil). Premier outil : le **calculateur de jets de dés** — on compose
  une combinaison (nombre de dés par type D2→D100 + bonus fixe, max 30 dés) et
  l'outil calcule la distribution **exacte** des totaux par **convolution** :
  espérance, écart-type, étendue, graphique SVG maison (barres ≤ 120 totaux,
  courbe au-delà ; infobulle au survol : « exactement » / « au moins ») et
  tableau complet des probabilités. Un champ **Palier** (ex. un DD) affiche la
  **chance d'atteindre au moins ce total** (tuile dédiée + ligne de repère cyan
  sur le graphe, posée sur la frontière du « au moins »). Fonctions pures
  exposées sur `window.OutilsDes` (et en `module.exports` pour Node). Les
  onglets acceptent un **deep-link par hash** (ex. `index.html#outils`).
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

## Style de code (OBLIGATOIRE)

- **TOUJOURS nommer les variables en entier** — jamais d'abréviation. Écrire
  `options` (pas `opts`), `vitesse` (pas `vit`), `pion` (pas `p`), `numeroCase`
  (pas `c`), `self`/`etat` (pas `E`), `index` (pas `i`/`r`), `candidats` (pas `cands`),
  etc. Seul `id` (identifiant) est toléré car c'est aussi un nom de propriété
  partagé. Les noms doivent se lire comme une phrase.
- **Une seule instruction par ligne** : jamais deux `;` sur la même ligne, jamais
  un `if` collé à une autre instruction.
- **Une ligne vide avant un `if`** (sauf s'il est la première instruction d'un bloc).
- **Pas de ternaire imbriqué** : un seul ternaire est déjà limite — préférer une
  **variable intermédiaire bien nommée** ou un `if/else` explicite. Pour toute
  condition non triviale, créer une variable (`var transfertLegitime = …`) plutôt
  qu'un ternaire en ligne.
- Code **aéré** : grouper par sections commentées, espacer les blocs logiques.
