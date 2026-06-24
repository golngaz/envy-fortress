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
- **Simulation** : `python simulation_roue_d_initiative.py` simule la roue
  d'initiative (ordre de jeu basé sur la Vitesse). C'est le seul code exécutable du
  dépôt — un modèle autonome, sans dépendances, qui imite la mécanique décrite dans
  `gameplay/Système de Vitesse (Roue d’Initiative).md`.
- **Simulateur de combat (web)** : dossier `simulateur/` — calculateur/fiche de
  combat en HTML/CSS/JS vanilla (aucun build). Ouvrir `simulateur/index.html` ou
  servir via `python -m http.server 8123 --directory simulateur`. Voir
  `simulateur/CLAUDE.md` pour le détail. En résumé :
  - **Aide de jeu, pas moteur** : ne lance aucun dé et ne décide d'aucune
    victoire — le MJ saisit à la main les résultats des jets faits à la table.
  - Gère plusieurs **PJ & monstres** avec stats de base + **stats dérivées**
    (PV, cases/tours, poids, modificateurs) calculées comme dans `persos.base`.
  - **PV / PA / Shell Control** modifiables à tout moment ; **jetons** d'altération
    posables sur une **piste de durée** (Permanent + 1→6 tours, réduction manuelle),
    palette configurable dans `data/jetons.js`.
  - **Équipement** : PJ (arme + 6 sorts + défense + Shell Control), monstre
    (attaques + défense + passif). **Flux d'action** : Sort (décompte les PA) /
    Attaquer / 🎲 attaque aléatoire (monstre) → choix de cible ou AOE → la carte
    jouée s'affiche **face à la carte de défense de la cible**.
  - **Roue d'initiative** visuelle gérant déplacement, ordre et rejeux, ajustable
    à la main (repousser/avancer).
  - **Bibliothèque** (modèles PJ/monstres réutilisables), **duplication** d'un
    combattant, et **export/import JSON** du combat complet (sauvegarde de session).
    Passif de classe lisible au clic ; passif du monstre affiché en encadré.
  - Onglet **Cartes** : sorts (dont Shell Control) et armes en cartes recto/verso
    avec flip 3D, imprimables comme aide-mémoire pour les joueurs.
  - Décision de règle assumée : déplacement roue = `floor(1 + VIT/3)` (modèle de
    `persos.base`, qui prime sur l'ancien modèle « +2 bonus » du doc de la roue).
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
    **autorisés ici** (≠ livret).
  - **Combats = puzzles** : conçois chaque rencontre comme un *combat-puzzle*. Une
    stratégie basique (« on tape la cible la plus proche / la plus en avant jusqu'à
    ce qu'elle tombe ») doit être **volontairement sous-optimale**. Le combat doit
    récompenser la lecture d'un **mécanisme** : une boucle à briser (boss intouchable
    tant que ses serviteurs vivent → cf. [[Maître de la tour]], [[Croque mort gardien]]),
    une **condition** d'ouverture (humilier/isoler une clé de voûte, rompre une
    formation, épuiser une réserve de défense), un ordre d'actions, un usage de l'AOE,
    du terrain ou d'une altération. Le passif du monstre **est** l'énigme ; explicite
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