---
joueur: visible
---

Les PJ remettent les [[Point d'action|PA]] à zéro. Les PJ ne perdent ni ne gagnent de `PV` en dehors des combats, donc ils gardent ce qu'ils avaient, de même pour les points de [[Shell Control]]. La [[Système de Vitesse (Roue d’Initiative)|Roue d'initiative]] est réinitialisée sur la première case.

# Points d'action

![[Point d'action#^b74d02]]
![[Point d'action#^d2621e]]
# Tour global
 
 ![[tour global#^c5a7a4]]

## Déplacements

Le tour commence avec les déplacements. Voir [[Système de Vitesse (Roue d’Initiative)]] afin de placer ou déplacer les joueurs et ennemis.

## Tour individuel

### Joueur

1. Le joueur gagne +1 PA
2. Le joueur applique les effets des différents jetons de statuts (dégâts, altérations, températures, etc.). Ainsi que les bonus lui permettant de gagner des PA ou autre gains. On applique les effets dans l'ordre désiré par le joueur.
3. Il **décompte ses jetons** : chacun **perd 1 tour** (on le décale d'une colonne sur la piste de durée de la fiche). Un jeton qui atteint 0 **expire** — on le retire. Les jetons posés sur la case **Permanent (P)** ne perdent jamais de tour. Cf. [[Jetons et statuts]].
4. Il peut effectuer une [[#Action]]. et une [[#Action bonus]], dans l'ordre qu'il souhaite.

#### Action

Le joueur peut faire 1 action par défaut, au choix

* Utiliser un sort (-x PA)
* [[Attaquer]]
* Utiliser une potion
* Se concentrer (+2 PA)

#### Action bonus

Le joueur peut aussi utiliser son sort de [[Shell Control]] s'il consomme les 10 points de [[Shell Control]] qu'il a accumulé.

##### Utiliser un sort

Le joueur peut utiliser un des 6 sorts équipés afin d'attaquer un ennemi préalablement désigné par le joueur. Le joueur **dépense le coût en PA** du sort à utiliser (ou autres conditions).
Il est nécessaire de regarder les conditions éventuelles du sort, chaque sort est unique.
Généralement il est nécessaire de lancer un dé, le dé à prendre est précisé dans la première colonne de la table, en en-tête, sous la forme **`DD 1D20(+INT)`** : on lance un dé 20 et on y ajoute le modificateur de `INT`. Le modificateur est facultatif (`DD 1D10` = 1D10 sans modificateur), et plusieurs dés peuvent être demandés (`DD 1D6+1D4(+CTRL)` = on lance 1D6 **et** 1D4, on additionne, puis on ajoute `+CTRL`). Puis l'on regarde dans chaque ligne les effets à appliquer selon le résultat obtenu : sur `4+` on applique l'effet de la ligne si le total atteint 4 ou plus.
Lorsqu'un effet est présent sous un autre effet, dans la même colonne. On ignore alors les autres lignes. (généralement, un sort cumule des effets en + ou fait grossir les "conséquences").

Si le résultat d'un sort est négatif ou "ne fait rien". Le cout en PA aura quand même été dépensé et ne peut être remboursé.

Les modificateurs de sorts doivent **toujours** s'appliquer (même en négatif !).

> [!info] Un jet de combat n'est pas un [[Jet de sauvegarde|JdS]]
> Les jets de **sorts, d'attaques et de défense** faits pendant un combat sont une **mécanique propre au combat**, pas des jets de sauvegarde : ils gardent leur modificateur **même négatif**, et le total peut donc tomber **à 0 ou en dessous** (le sort ne fait alors rien, et les PA restent dépensés). La règle du **plancher à 0** ne concerne que les **JdS**, qui restent dus quand un sort en demande un.

> [!warning] Echec critique
> Si un joueur obtient 1, c'est un échec critique, ce qui signifie qu'on **ne prends pas compte des modificateurs** dans ce cas là.

##### Sorts passifs

Les sort dit passifs s'équipent de la même manière que les autres sorts, et sont toujours valable tant que leurs conditions sont respecté et qu'il est équipé.

> [!tip] Info
> Le coût en PA est écrit sur le sort en question, sauf indication contraire, chaque utilisation nécessite d'avoir les PA nécessaires, les sorts de défenses peuvent coûter des PA où avoir des effets supplémentaires en dépensant d'éventuels PA.

##### Attaquer

![[Attaquer#^9f4a2d]]


##### Se concentrer

Passe son tour au joueur et gagne 2 PA.


#### Défense ennemie

Après une attaque ou un sort, l'ennemi utilise sa compétence de défense s'il en a une et la résout selon le tableau (l'ennemi pourra alors contre attaquer, renvoyer une partie des dégâts, attaquer à chaque dégâts reçus, ou simplement **réduire** tout ou parti des dégâts qu'il allait recevoir).
L'ennemi utilise forcément sa défense en [[Mode normal]] et le MJ peut décider de ne pas l'utiliser en [[Mode difficile]]. Un ennemi (comme les PJ) est toujours obligé de lancer les Jets de sauvegardes.

#### Défense

Le joueur possède aussi une unique compétence de défense qu'il aura équipé au préalable. Le joueur **peut** résoudre sa compétence de défense, comme les ennemis, et contrer,  renvoyer, réduire etc. en réaction à une attaque (ennemi comme allié).
Généralement, il lance un dé selon le DD affiché et applique les effets annoncés dans le tableau.
En cas de doute, les sorts de défense fonctionnent de la même manière que les sorts normaux, au détail près qu'ils ne coûtent *généralement* pas de PA.

> [!warning] Sorts de zone (AOE) → aucune défense
> Un **sort de zone** (AOE), qui frappe **plusieurs cibles** à la fois, **ne provoque pas de tour de défense** : aucune cible ne peut résoudre sa **compétence de défense** en réaction (ni un ennemi, ni un PJ pris dans la zone). En revanche, les **Jets de sauvegarde** éventuels du sort **restent dus** — ils font partie du sort lui-même. Terme défini dans le [[Glossaire]].

##### Jet de défense

Dépend de la défense du personnage, en général il est possible de diviser/bloquer un certains nombre de dégâts selon les différentes conditions et DD annoncés.

Les arrondis se feront toujours supérieur
chaque ligne remplace la précédente sur **la même colonne**. Si la case est vide, elle **applique** la ligne précédente sur la même colonne

> [!example]
> 
> 
> | DD 1D20 | Effet              | Effet 2      | Effet 3     |
> |-----------|--------------------|---------------------------|-------------|
> | 5+        | Bloque le nombre   |                           |             |
> | 8+        | Bloque le nombre   | 1 Brûlure à l'attaquant   |             |
> | 11+       | Dégâts / 2         | 2 Brûlures à l'attaquant  |             |
> | 20        | Annule les dégâts  | 2 Brûlures à l'attaquant  | Soigne de 5 |
> 
> * Sur un DD 20, si le personnage fait 13, il subit des dégâts réduits de moitié et inflige 2 brûlures à l’attaquant
> * Si le personnage fait 20, les dégâts sont annulés et il se soigne de 5, sans appliquer de brûlure
> * Sur un 9, le joueur bloque le nombre et applique 1 brûlure à l’attaquant
> * Sur un 1, le joueur ne bloque rien et n’applique aucun effet

### Ennemis

1. L'ennemi attaque un joueur aléatoirement en [[Mode normal]]. C'est le MJ qui choisie la meilleure décision d'après lui en [[Mode difficile]].
2. L'ennemi lance un dé pour déterminer une attaque s'il en a plusieurs (attaque avec son arme ou sort, le choix est précisé sur la fiche du monstre). S'il n'en a qu'une, il l'utilise à chaque tour.
	* Si le joueur est touché, il applique les altérations d'état **s'il y en a** en posant le jeton correspondant sur la **piste de durée** de sa fiche de personnage, sur la colonne correspondant au **nombre de tours** à appliquer (ou sur **Permanent (P)** si le jeton ne se décompte pas). (Certaines altérations nécessiteront des jets de dés).
	* Si le joueur n'est pas touché car il a bloqué/esquivé/réduit 100% des dégâts, les altérations ne s'appliquent généralement pas, sauf si précisé. Dans le cas des attaques bloqués, cela dépends des types d'[[Altérations.base|Altérations]].

3. Si le joueur ciblé est attaqué par une attaque ou un sort, il **peut** maintenant utiliser son sort spécial de défense. Certains sorts possèdent des [[Jet de sauvegarde|Jets de sauvegardes]] à réussir afin d'éviter un sort, le joueur **peut** annuler l'effet d'un sort s'il réussi son jet.

# Entrée/Sortie d'un joueur

Les joueurs ne peuvent pas quitter librement un combat en cours. Mais un combat peut **s'arrêter**, ou un personnage **fuir**, dans les cas ci-dessous.

> [!info] Arrêter ou fuir un combat
> Possible si l'**une** de ces conditions est réunie **et** que le MJ la valide :
> - **un camp ne veut plus se battre** (reddition, supplication, désengagement mutuel) ;
> - **les conditions s'y prêtent** : voie de fuite, objectif atteint, ennemi neutralisé ou sans intérêt à se battre, distance suffisante sur la roue ;
> - **le MJ le décide**.
>
> **Trêve** (les deux camps renoncent) : le combat s'arrête aussitôt, on repasse en temps réel et on applique la fin de combat habituelle.
> **Fuite** (un seul personnage) : déclarée à son tour. Hors de portée de tout ennemi → il part sans jet ; sinon, **JdS (+VIT)** pour rompre le contact (échec = tour perdu, il reste engagé). Un ennemi peut le poursuivre ou le laisser filer.

Un combat peut débuter sans que tous les joueurs y participent. Les joueurs absents sont tout de même représentés sur la [[Système de Vitesse (Roue d’Initiative)|Roue d'initiative]] et se déplacent normalement selon leurs statistiques de [[Vitesse (VIT)]]. Ils ne peuvent cependant ni être ciblés, ni attaquer. Lorsque c'est leur tour dans le combat, ils peuvent interagir avec l'environnement extérieur au combat pour une séquence d'actions équivalant à une dizaine de secondes environ — c'est le MJ qui tranche en cas de doute.

Si le joueur se rapproche et est vue par un ennemi qui était en combat avec les PJ, il rejoint alors le combat et met fin à son tour.

Le joueur hors combat ne pourra jamais influencer le combat en cours, même en servant d'éléments de la map (faire effondrer un objet sur un ennemi, le pousser quand il ne vous voit pas etc...). Ce qu'il peut toujours faire pour agir sur des ennemis ou carte éloigné(s) du combat.

> [!example] Exemple
>  Le combat débute avec les joueurs A et C ainsi que l'ennemi X. Le joueur B n'y participe pas, mais est tout de même placé sur la roue. Lorsque son tour arrive, il décide de courir vers ses alliés : le MJ estime qu'il parcourt une cinquantaine de mètres. B souhaite ensuite actionner un levier pour rejoindre la salle du combat, mais le MJ considère qu'il n'a plus le temps — il devra attendre son prochain tour pour le faire.

Il est possible, dans certains cas, d'exploiter tout de même cette situation pour en effet, par exemple, pour activer un levier et mettre fin au combat. Mais dans ce cas, le levier **fera "parti"** du combat (ennemi "levier" ayant ses propres mécaniques avec qui les ennemis pourront interagir à chaque tour).
# Fin du combat

* Les PJ reçoivent les loots
	* Pièces de bronze, argent ou or de chacun des ennemis
	* Armes des ennemis
	* loots des monstres + loot du combat

* Les PJ gardent les PV actuels, ils peuvent retirer tous les jetons d'altération
* Les PJ gardent leurs points de [[Shell Control]].