/* =============================================================================
 *  JETONS / ALTÉRATIONS  —  La Forteresse de l'Envie
 * -----------------------------------------------------------------------------
 *  Configuration LIBREMENT éditable des jetons d'état du jeu.
 *  Pour ajouter / modifier un jeton, copiez un bloc et changez les champs :
 *
 *    id        : identifiant unique (sans espace)
 *    nom       : nom affiché
 *    icone     : un emoji (le "logo" du jeton)
 *    couleur   : couleur CSS (hex) du jeton
 *    negatif   : true = altération néfaste, false = bonus
 *    max       : nombre maximum de jetons cumulables (null = illimité)
 *    permanent : true si le jeton va par défaut sur la case "Permanent (P)"
                (il ne perd alors jamais de tour et n'expire pas)
 *    ignoreBouclier : (info) le jeton ignore-t-il le jeton Bouclier
 *    desc      : description courte rappelée au survol / sur la fiche
 *
 *  Ces données sont chargées dans window.DB.jetons.
 * ===========================================================================*/
window.DB = window.DB || {};
window.DB.jetons = [
  {
    id: "pa", nom: "PA", icone: "⚡", couleur: "#f4b740",
    negatif: false, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Donne +1 PA au début du tour."
  },
  {
    id: "bouclier", nom: "Bouclier", icone: "🛡️", couleur: "#3d8bff",
    negatif: false, max: 1, permanent: false, ignoreBouclier: false,
    desc: "Dépensé AVANT une attaque défendable : DD 1D10 → 2+ réduit la valeur du dé, 10 annule tout. Expire après usage (même échec critique)."
  },
  {
    id: "fantomatique", nom: "Fantomatique", icone: "👻", couleur: "#39c5c0",
    negatif: false, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Quand attaqué, consomme 1 jeton pour une défense supplémentaire : DD 1D10 → 4+ annule la moitié des dégâts, 8 annule tout."
  },
  {
    id: "controle", nom: "Contrôle", icone: "🎮", couleur: "#43c463",
    negatif: false, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Jetons stockés en zone Contrôle. 10 jetons = activer Shell Control. Certaines compétences en dépensent."
  },
  {
    id: "brulure", nom: "Brûlure", icone: "🔥", couleur: "#ff5a2b",
    negatif: true, max: 15, permanent: false, ignoreBouclier: false,
    desc: "Au début de SON tour, le porteur subit 2 dégâts bruts par brûlure. Les immunisés au feu n'en reçoivent jamais."
  },
  {
    id: "temperature", nom: "Température", icone: "🌡️", couleur: "#ff8c42",
    negatif: true, max: 20, permanent: false, ignoreBouclier: true,
    desc: "Chaque ajout inflige 1 dégât ; en présence d'autres jetons, chacun gagne 1 tour. À 7 tours, il expire et se transforme en 2 Brûlures."
  },
  {
    id: "paralyse", nom: "Paralysé", icone: "🥶", couleur: "#8b5cf6",
    negatif: true, max: 1, permanent: false, ignoreBouclier: true,
    desc: "Début de tour : Jet de résistance (CON). Échec → passe son tour. Le jeton perd 1 tour dans tous les cas."
  },
  {
    id: "expose", nom: "Exposé", icone: "🎯", couleur: "#e23b3b",
    negatif: true, max: 1, permanent: false, ignoreBouclier: true,
    desc: "Ne peut pas se défendre. Le jeton perd 1 tour après chaque attaque reçue."
  },
  {
    id: "menace", nom: "Menacé", icone: "❗", couleur: "#c0392b",
    negatif: true, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Subit des dégâts supplémentaires à chaque attaque à l'arme reçue : DD 1D4 ajouté aux dégâts. Le jeton perd 1 tour à chaque attaque à l'arme reçue."
  },
  {
    id: "silence", nom: "Silence", icone: "🤐", couleur: "#6b7fa3",
    negatif: true, max: 1, permanent: false, ignoreBouclier: false,
    desc: "Aucun sort : ni sort, ni sort de défense, ni Shell Control (les passifs cessent). Arme, potion, concentration et JdS restent possibles. Le jeton perd 1 tour à chaque tour de son porteur."
  },
  {
    id: "affaiblissement", nom: "Affaiblissement", icone: "📉", couleur: "#7f8c8d",
    negatif: true, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Au moment d'attaquer : DD 1D4 soustrait à l'attaque (total ≤ 0 = pas d'attaque). Le jeton perd 1 tour après chaque utilisation."
  }
];
