---
joueur: visible
---


# Création de personnage

La création d'un personnage commence par le choix d'une **classe**, qui définit les **statistiques de base** du personnage. Par exemple, un Guerrier possède des valeurs brutes en `CON`, `FOR`, `VIT`, `CTRL`, `INT` et `VOL` propres à sa classe.

Une fois la classe choisie, le joueur répartit des **points de bonus** supplémentaires par-dessus ces stats de base (visibles dans le frontmatter de la fiche personnage via les champs `bonus CON`, `bonus VIT`, etc.).

La **stat finale** d'un personnage est donc la somme de la valeur de classe et de son bonus personnel. Par exemple, un Mage avec `bonus INT: 4` ajoutera 4 à l'`INT` de base de sa classe.

Le personnage est ensuite équipé d'un **inventaire** (armes, objets), chaque item étant lié à sa propre fiche via un lien Obsidian (ex. [[Vieux baton]]).

Enfin, la fiche est construite en **transclusion** : les blocs de règles (passif, sorts, armes, défense) sont directement importés depuis les fiches de classe et d'items grâce à la syntaxe `![[NomDeLaFiche#^blockID]]`, ce qui garantit que toute mise à jour d'une règle se répercute automatiquement sur tous les personnages concernés.

# Jet de sauvegarde

![[Jet de sauvegarde]]

# Jetons et statuts  

Utilisés pour marquer des protections, malédictions, avantages temporaires.

![[Altérations.base]]


# Points de vie

Lorsqu'un PJ meurt en combat, il ne peut plus jouer le combat. (On peut le considéré comme "A terre").
S'il était mort lors d'un combat, il peut continuer l'aventure en dehors, mais garde ses PV à 1, et pourra combattre.
S'il est mort en dehors du combat, il n'est plus disponible jusqu'à la prochaine "Safe zone" (il ne sera plus disponible dans les combats).

> [!danger] Fin ?
> Si toute l'équipe est morte. C'est la fin du jeu. Sauf cas spéciaux liés au scénario.

> [!tip] Note
> S'il restait des statuts pouvant ressusciter un joueur à retardement, les tours passent normalement, les ennemies jouent leur tour (tapent dans le vide si nécessaire). Jusqu'à ce que le tour activant l'effet arrive bel et bien.

# Inventaire

Les joueurs possèdent un inventaire individuel, chaque objet possède un poids et ils ne peuvent pas dépasser le montant total calculé sur la base de leurs statistiques de [[Constitution (CON)]]. Le poids max est noté sur la fiche personnage et est mise à jour uniquement quand cette statistique change, lors d'un changement de niveau. 
Les joueurs peuvent jeter leurs équipement, mais celui est immédiatement désintégré de la forteresse.

# Combats

![[Combat]]

# Préparation

Les joueurs commencent par décider de leur personnage, **pas de background**, mais ils peuvent décider de leur apparence et personnalité, ainsi que de leur nom. Ils choisissent ainsi leur classe, et répartissent les 12 premiers points du niveau 1 dans leurs **statistiques**  (CON, CTRL, VIT, FOR, INT, VOL).
Les joueurs possèdent ainsi leurs statistiques de personnage (parfois appelé statistiques bonus) ainsi que les statistiques de base de leurs classe. Ils renseignent sur leur fiche, la somme de leur statistiques de base et leurs statistiques bonus

## Équiper les sorts

Les joueurs gagnent des sorts en fonction de la campagne, ils s'arrangent entre eux pour se distribuer les sorts/sorts passifs à l'avance, changeable uniquement dans les [[Safe zones]], et au tout début de la partie. Les joueurs peuvent équiper 6 sorts au maximum, ainsi qu'un sort bonus de [[Shell Control]]. Ils disposent alors ces sorts sur le plateau et mettent les autres de côté.
En début de partie, les joueurs n'auront probablement pas 6 sorts d'un coup, il peuvent donner plus de sorts à un joueur qu'à un autre s'ils le désirent, mais ne peuvent pas n'avoir aucun sort actif.
Il n'est pas possible d'équiper les sorts de niveau supérieurs aux sien.

# Ajout d'un niveau aux joueurs

A certains moments clés de l'histoire, le MJ décidera de leur faire gagner un niveau. Le niveau 2 doit être gagné rapidement. Les sorts de niveau x sont débloqué, si les joueurs possédaient déjà les sorts sans pouvoir les équiper, ils le peuvent maintenant (et ils peuvent toujours utiliser les niveaux inférieur).
Chaque niveau rapporte 6 points à distribuer dans les différentes **statistiques**. Le niveau 1 commence avec 12 points.

# Safe zones

![[Safe zones]]
