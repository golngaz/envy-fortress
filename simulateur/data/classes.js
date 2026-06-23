/* =============================================================================
 *  CLASSES JOUABLES  —  La Forteresse de l'Envie
 * -----------------------------------------------------------------------------
 *  Valeurs de base des 6 stats (toujours 18 points au total) + passif(s).
 *  Le joueur ajoute par-dessus 12 points de bonus personnels (voir Création
 *  de personnage). Stats finales = base classe + bonus perso.
 * ===========================================================================*/
window.DB = window.DB || {};
window.DB.classes = [
  {
    id: "mage", nom: "Mage",
    stats: { CON: 0, FOR: 0, VIT: 0, CTRL: 7, INT: 7, VOL: 4 },
    passifs: [
      "Préparé : au début du tour, gagne un PA supplémentaire."
    ],
    desc: "Centré sur le contrôle de la partie, polyvalent, garde la main mise sur ses dés."
  },
  {
    id: "chevalier", nom: "Chevalier",
    stats: { CON: 6, FOR: 6, VIT: 3, CTRL: 0, INT: 0, VOL: 3 },
    passifs: [
      "Honneurs : sur une attaque au corps à corps, lance 1D20 ; sur 20 (critique) gagne un Bouclier (Permanent).",
      "Fidélité du chevalier : quand il reçoit un Bouclier, il peut le donner à un allié de la même colonne de jetons."
    ],
    desc: "Robuste et puissant, grosse armure. Il sait se battre et il aime ça."
  },
  {
    id: "architecte", nom: "Architecte",
    stats: { CON: 0, FOR: 0, VIT: 2, CTRL: 9, INT: 5, VOL: 2 },
    passifs: [
      "Inarrêtable : chaque fois que lui ou un allié utilise une compétence de Shell Control, l'Architecte gagne 2 points de Shell Control."
    ],
    desc: "Manipulateur des règles invisibles du réel. Excelle au contrôle et à l'altération du champ de bataille."
  },
  {
    id: "dueliste", nom: "Dueliste",
    stats: { CON: 4, FOR: 7, VIT: 7, CTRL: 0, INT: 0, VOL: 0 },
    passifs: [
      "Je suis le vent : pour chaque ennemi doublé sur la roue de vitesse, gagne 1 PA. S'il se fait doubler, il perd 1 PA.",
      "Premier arrivé, premier servi : s'il dépasse la ligne de départ, il gagne 1 PA."
    ],
    desc: "Rapide et offensif, enchaîne les attaques et exploite les altérations d'état."
  },
  {
    id: "scelerat", nom: "Scélérat",
    stats: { CON: 4, FOR: 0, VIT: 6, CTRL: 6, INT: 0, VOL: 2 },
    passifs: [
      "Fourberie : s'il a utilisé un sort, il peut tout de même attaquer en infligeant la moitié des dégâts (après défense)."
    ],
    desc: "Fourbe et opportuniste, prend des décisions rapides pour avoir un coup d'avance."
  }
];
