---
joueur: visible
---
# Flèche

Indicateur déterminant le début du tour sur la roue, elle se déplace en suivant le dernier joueur.
On la place au début de la première case au début du combat.

# Détermination de l’ordre de jeu  
  
Au **début de chaque tour global**, l’ordre des tours individuels est déterminé par son ordre sur la roue : le joueur le plus éloigné de la flèche commence et le joueur collé à la flèche sera dernier.
Le premier tour, tous les joueurs se placent sur la première case, puis avancent de leur [[Bonus de nombre de cases]] : c'est ce premier déplacement qui les étale sur la roue et fixe l'ordre.
# Principe  

La roue comporte **6 cases** disposées en cercle. Il y a une [[Système de Vitesse (Roue d’Initiative)#Flèche|Flèche]] qui définit le début et la fin d'un **tour**. Le premier tour global, on place cette flèche au début de la case 1.
Chaque pion (joueur ou ennemi) avance sur la roue à chaque [[tour global]] selon sa **valeur de Vitesse**. Le nombre de cases parcourues par tour est le **[[Bonus de nombre de cases]]** affiché sur la fiche, calculé comme `cases = ⌊1 + VIT/3⌋` :
- **VIT = 0** → avance de **1 case par tour**.
- Chaque tranche de **3 points de VIT** ajoute **1 case** (VIT 3 → 2, VIT 6 → 3, …).
- Si la valeur finale est nulle ou négative, le pion **ne bouge pas**.

> [!example]    
> VIT 6 (soit « 3 cases » sur la fiche) → avance de **3 cases par tour**.    
> VIT 21 (soit « 8 cases ») → avance de **8 cases par tour**, soit **1 tour complet (6) + 2 cases** (modulo 6).

1. La flèche de départ se replace immédiatement sur la case du joueur le plus lent qu'elle marquait déjà. (c'est le joueurs le plus lent qui va alors toujours définir le début et la fin d'un tour à chaque tour global).
2. Lorsqu'un ou plusieurs pions dépassent la flèche de départ, ils rejouent immédiatement (voir [[#Tour complet]]).
3. La nouvelle position permet de savoir quel sera l'ordre ce tour ci.

> [!example] Exemple
> Un joueur A est sur la case 2 et la flèche sur la case 4 avec le joueur B. Le joueur B avance de 2 case et le joueur A de 3. Le joueur A se retrouve en case 5, le joueur B en case 6, la flèche est alors déplacée sur la case 5.

---  


## En cas d’égalité :  
* Celui ayant la **Vitesse la plus élevée** est prioritaire.  
* Si égalité de vitesse avec un/des PNJ, ce sont les PJ qui sont prioritaires.
* Si la Vitesse ne les départage pas (deux PJ à Vitesse égale sur la même case), les PJ concernés se départagent au **dé** : chacun lance, le plus haut joue en premier.
  
---

# Tour complet (dépassement de la flèche)

Lorsqu'un ou plusieurs pions **dépassent la flèche de départ**, ils gagnent un **tour bonus**. C'est aussi le cas lorsqu'un pion est amené à dépasser la flèche par un **[[Repousser|repoussement]]** (qu'il dépasse lui-même, ou qu'on repousse un autre pion derrière la flèche).

> [!important] Frise de priorité
> Pour **éviter les exploitations** (enchaîner des rejeux à l'infini), le tour bonus n'est **pas** joué « immédiatement après » : il est ajouté à la **toute fin de la _frise de priorité_** — une frise affichée sous la roue, faite de petits **cubes colorés** représentant, dans l'ordre, tous les tours du tour global en cours.
> - Chaque combattant a d'abord **un cube** (son tour normal), rangé par priorité (le plus éloigné de la flèche d'abord).
> - Chaque **dépassement de flèche** (par déplacement, avancée ou repoussement) ajoute **un cube bonus à la fin** de la frise.
> - On joue la frise **de gauche à droite**.

> [!note] Modèle « un seul tour »
> On ne retient **pas** le nombre de tours d'avance : peu importe qu'un pion en double un autre puis se fasse redoubler — chaque dépassement vaut **un** cube bonus, et tout repart à neuf au tour global suivant.

> [!success] Conséquence
> Il reste possible de jouer plusieurs fois dans un tour global en étant plus rapide (les cubes bonus s'accumulent en fin de frise), mais comme ils sont **différés à la fin**, on ne peut plus enchaîner une boucle de rejeux instantanés.

> [!note] Note
> Les égalités fonctionnent de la même manière que [[#En cas d’égalité|précédemment]].

# ![[Repousser]]

# Résumé

Voici les étapes résumés au début de chaque tour global

1. Déplacement des joueurs en fonction de leur valeur de vitesse.
2. La flèche reste sur le **plus lent** (le dernier de la course) et le suit.
3. On construit la **frise de priorité** : un cube par joueur (rangés par priorité, le plus éloigné de la flèche d'abord), puis **un cube bonus en fin de frise** pour chaque pion ayant **dépassé la flèche** ce tour-ci.
4. Les joueurs jouent leur tour en suivant la frise, **de gauche à droite**.
