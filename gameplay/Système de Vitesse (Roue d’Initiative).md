---
joueur: visible
---
# Principe  

La roue comporte **6 cases** disposées en cercle. Il y a une flèche qui définit le début et la fin d'un **tour**. Le premier tour global, on place cette flèche au début de la case 1.
Chaque pion (joueur ou ennemi) avance sur la roue à chaque [[tour global]] selon sa **valeur de Vitesse** :  
- **Vitesse de base = +0** → avance de **1 case par tour**. 
- Si vitesse finalement négative, alors le pion ne bouge pas.


> [!example]    
> Vitesse +2 → avance de **3 cases par tour** (1 de base + 2 bonus).    
> Vitesse +8 → avance de **9 cases par tour**, soit **1 tour complet (6) + 3 cases** (modulo 6).

1. La flèche de départ se replace immédiatement sur la case du joueur le plus lent qu'elle marquait déjà. (c'est le joueurs le plus lent qui va alors toujours définir le début et la fin d'un tour à chaque tour global).
2. Lorsqu'un ou plusieurs pions dépassent la flèche de départ, ils rejouent immédiatement (voir [[#Tour complet]]).
3. La nouvelle position permet de savoir quel sera l'ordre ce tour ci.

> [!example] Exemple
> Un joueur A est sur la case 2 et la flèche sur la case 4 avec le joueur B. Le joueur B avance de 2 case et le joueur A de 3. Le joueur A se retrouve en case 5, le joueur B en case 6, la flèche est alors déplacée sur la case 5.

---  
  
# Détermination de l’ordre de jeu  
  
Au **début de chaque tour global**, l’ordre des tours individuels est déterminé par son ordre sur la roue : le joueur le plus éloigné de la flèche commence et le joueur collé à la flèche sera dernier.

## En cas d’égalité :  
* Celui ayant la **Vitesse la plus élevée** est prioritaire.  
* Si égalité de vitesse avec un/des PNJ, ce sont les PJ qui sont prioritaires.
  
---

# Tour complet

Lorsqu'un ou plusieurs pions dépassent la flèche de départ, ils rejouent immédiatement. Si un pion fait plusieurs tours, il peut rejouer autant de fois que nécessaires.

> [!success]  Je confirme  
  Il est en effet possible qu’un joueur ou un ennemi joue plusieurs fois d’affilée, voire presque à l’infini, en combinant ses actions avec des compétences de [[Vitesse (VIT)]]. Il suffit simplement d’être plus rapide. (ou de disposer d’une défense capable de contre-attaquer efficacement ?)  
> > [!tip] Imagine cette situation…    
> > Tu joues au *jeu des mains*, où l’objectif est de taper la main de ton adversaire. Mais il est beaucoup plus rapide que toi : tant qu’il esquive, tu ne peux jamais frapper. Il enchaîne les mouvements et frappe en boucle dès que tu es hors de portée, te laissant complètement bloqué tant que ta vitesse est insuffisante.

> [!note] Note
> Les égalités fonctionnent de la même manière que [[#En cas d’égalité|précédemment]] (faire 2 tours et tomber sur la même case qu'un joueur qui n'en a fait qu'un ne constitue pas une égalité).

# Résumé

Voici les étapes résumés au début de chaque tour global

1. Déplacement des joueurs en fonction de leur valeur de vitesse
2. La flèche de marquage de tour est déplacée **en même temps** sur le joueur le premier joueur devant elle (elle le "suit").
3. Les joueurs aillant dépassé le joueur le plus lent (marqué avec la flèche) rejouent.
4. Les joueurs jouent leur tour normalement, les plus éloignés de la flèche sont les plus rapides.
