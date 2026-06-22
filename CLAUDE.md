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
  `gameplay/Système de Vitesse (Roue d'Initiative).md`.
- **Export** : plugin `better-export-pdf` pour générer des PDF de règles/fiches.
- `.gitignore` exclut les caches de workspace Obsidian ; `.gitattributes` force `eol=lf`.
- `jdr.rar` est une archive binaire volumineuse (~22 Mo) — ne pas modifier.

## Organisation du contenu

Dossiers de premier niveau (chacun est une catégorie de wiki) :

- `gameplay/` — règles centrales : `Gameplay.md`, `Glossaire.md` (réf. des termes),
  `traits/` (les 6 stats), `jets/` (jets de dés par stat), `mécaniques/`, `dégats/`.
- `classes/` — classes jouables (Mage, Chevalier, Scélérat, Architecte, Dueliste).
- `Sorts/Niveau N/` — sorts rangés par niveau, avec sous-dossiers thématiques
  (`soin/`, `sorts passifs/`, `Shell control/`).
- `Altérations/` — jetons d'état / statuts (`Jeton …`).
- `items/armes/{départ,loot,drop}/` — armes selon leur provenance.
- `monstres/` — bestiaire (+ `monstres/sorts/` pour leurs capacités).
- `campagne/` — contenu de la campagne en cours : `scenarios/`, `combats/` (par
  étage/lieu), `personnages/` (PJ et PNJ).
- `LORE/` — univers, lieux (étages de la forteresse), familles (`Famille Sombreval`).

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