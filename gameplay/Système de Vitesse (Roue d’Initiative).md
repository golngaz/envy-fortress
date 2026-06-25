---
joueur: visible
---
# La roue d'initiative

La roue détermine, à chaque tour, **qui joue et dans quel ordre**. Tout dépend de
la **Vitesse (VIT)** : plus on est rapide, plus on avance sur la roue — et les plus
rapides peuvent même **rejouer** dans le même tour.

> [!abstract] La roue en un coup d'œil
> - **6 cases** disposées en cercle ; chaque combattant a un **pion**.
> - Une **flèche** marque le **dernier de la course** (le pion le plus en retard).
> - **Début du combat** : tous les pions sur la **case 1**, flèche sur la **case 1**.
> - À chaque **[[tour global]]**, les pions avancent, puis on en déduit l'ordre de jeu.

---

# 1. Les pions avancent

À chaque tour global, chaque pion avance de son **nombre de cases** (indiqué sur la
fiche). On le calcule à partir de la VIT :

> **cases = ⌊1 + VIT ⁄ 3⌋**  *(arrondi à l'inférieur)*
> - **VIT 0 → 1 case** ; chaque tranche de **3 VIT** ajoute **1 case** (VIT 3 → 2, VIT 6 → 3…).
> - Un nombre de cases **nul ou négatif** → le pion **ne bouge pas**.

La roue boucle : passé la case 6, on repart à la case 1 (case 7 = case 1, etc.).

> [!example]
> Un pion à **VIT 6** (soit « **3 cases** » sur la fiche) avance de **3 cases** par tour.
> Un pion à **VIT 0** avance d'**1 case** par tour.

---

# 2. La flèche suit le dernier

Une fois les pions déplacés, la **flèche se place sur le pion le plus en retard**
(le dernier). C'est lui qui marque le **début et la fin** du tour, et c'est par
rapport à lui qu'on lit l'ordre de jeu.

> [!info] À retenir
> La flèche **suit toujours le dernier**. Si un pion est **repoussé** en arrière et
> redevient le plus en retard, la flèche le **suit** sur sa nouvelle case.

---

# 3. L'ordre de jeu

On joue du **pion le plus avancé** (le plus loin devant la flèche) jusqu'au **pion
collé à la flèche** (le dernier), qui joue en dernier.

> [!note] En cas d'égalité (pions sur la même case)
> 1. La **Vitesse la plus haute** joue d'abord.
> 2. À VIT égale entre un PJ et un PNJ, **le PJ** est prioritaire.
> 3. Entre PJ à VIT égale, chacun lance un **dé** : le plus haut joue en premier.

---

# 4. Rejouer : dépasser la flèche

Un pion qui **dépasse la flèche** (c.-à-d. qui double le dernier de la course) gagne
un **tour bonus**. Cela arrive :

- en **avançant** suffisamment pour doubler le pion le plus en retard ;
- par un **[[Repousser|repoussement]]** : un pion poussé **derrière la flèche**, ou
  poussé au point de la faire passer.

> [!important] Frise de priorité — le bonus est différé
> Pour éviter les **boucles de rejeux**, le tour bonus n'est **pas** joué « tout de
> suite ». On l'ajoute à la **toute fin de la frise de priorité** : la rangée de
> petits **cubes colorés** sous la roue qui liste, dans l'ordre, tous les tours à
> jouer. On joue la frise **de gauche à droite**.
>
> - **1 cube par combattant** (rangés selon l'ordre de jeu ci-dessus).
> - **+ 1 cube bonus en fin de frise** pour chaque dépassement de flèche.

> [!warning] On rejoue en doublant **la flèche**, pas n'importe qui
> Doubler un pion **qui n'est pas le dernier** (la flèche) ne donne **aucun** tour
> bonus : seul le **dépassement de la flèche** compte. De même, **avancer/repousser à
> la main ne réordonne pas la frise** : l'ordre de jeu est fixé au **début du tour
> global** ; les ajustements manuels ne font qu'**ajouter des cubes bonus** (pour les
> dépassements de flèche), sans changer la suite déjà en train d'être jouée.

> [!note] Modèle « un seul tour »
> On ne compte **pas** le nombre de tours d'avance : peu importe qu'un pion en
> double un autre puis se fasse redoubler — **chaque dépassement vaut un cube**, et
> tout **repart à zéro** au tour global suivant. On peut donc jouer plusieurs fois
> dans un tour en étant plus rapide, mais sans enchaîner les rejeux instantanés.

---

# Exemple complet

Deux combattants partent **case 1**, flèche **case 1** :
- **PJ** — VIT 0 (« 1 case »),
- **Monstre** — VIT 3 (« 2 cases »).

**Tour global** : le PJ avance d'**1 case** (→ case 2), le Monstre de **2 cases**
(→ case 3). Le PJ est désormais le plus en retard : **la flèche le suit (case 2)**.
On lit l'ordre du plus avancé au dernier : **Monstre, puis PJ**. Personne n'a dépassé
la flèche → **aucun rejeu**.

> [!tip] Et si on **repousse** ?
> En repoussant le Monstre de la case 3 vers la case 1, on le fait passer **derrière
> la flèche** : il redevient le dernier (la flèche le suit) **et** gagne un cube bonus
> ajouté en fin de frise.

# ![[Repousser]]

---

# Résumé — à chaque tour global

1. **Chaque pion avance** de son nombre de cases (⌊1 + VIT ⁄ 3⌋).
2. **La flèche se place sur le dernier** (le plus en retard) et le suit.
3. On construit la **frise** : un cube par pion (du plus avancé au dernier), **+ un
   cube bonus en fin** pour chaque pion ayant **dépassé la flèche** ce tour-ci.
4. **On joue la frise de gauche à droite.**
