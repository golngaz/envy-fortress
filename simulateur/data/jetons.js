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
 *    permanent : true si le jeton va par défaut dans la zone "Permanentes"
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
    desc: "Dépensé AVANT une attaque défendable : 1D10 → 2+ réduit la valeur du dé, 10 annule tout. Supprimé après usage."
  },
  {
    id: "fantomatique", nom: "Fantomatique", icone: "👻", couleur: "#39c5c0",
    negatif: false, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Quand attaqué, consomme 1 jeton pour une défense supplémentaire : 1D10 → 4+ annule la moitié des dégâts, 8 annule tout."
  },
  {
    id: "controle", nom: "Contrôle", icone: "🎮", couleur: "#43c463",
    negatif: false, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Jetons stockés en zone Contrôle. 10 jetons = activer Shell Control. Certaines compétences en dépensent."
  },
  {
    id: "brulure", nom: "Brûlure", icone: "🔥", couleur: "#ff5a2b",
    negatif: true, max: 15, permanent: false, ignoreBouclier: false,
    desc: "Au début de chaque tour, chaque brûlure inflige 2 dégâts bruts. Les immunisés au feu n'en reçoivent jamais."
  },
  {
    id: "temperature", nom: "Température", icone: "🌡️", couleur: "#ff8c42",
    negatif: true, max: 20, permanent: false, ignoreBouclier: true,
    desc: "Chaque ajout inflige 1 dégât ; en présence d'autres jetons, chacun augmente. Au palier 12 → se transforme en Brûlure (2)."
  },
  {
    id: "paralyse", nom: "Paralysé", icone: "🥶", couleur: "#8b5cf6",
    negatif: true, max: 1, permanent: false, ignoreBouclier: true,
    desc: "Début de tour : Jet de résistance (CON). Échec → passe son tour. Descend le jeton dans tous les cas."
  },
  {
    id: "expose", nom: "Exposé", icone: "🎯", couleur: "#e23b3b",
    negatif: true, max: 1, permanent: false, ignoreBouclier: true,
    desc: "Ne peut pas se défendre. Descend d'un cran après chaque attaque reçue."
  },
  {
    id: "menace", nom: "Menacé", icone: "❗", couleur: "#c0392b",
    negatif: true, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Subit des dégâts supplémentaires à chaque attaque à l'arme reçue : 1D4 ajouté aux dégâts. Descend à chaque attaque arme reçue."
  },
  {
    id: "affaiblissement", nom: "Affaiblissement", icone: "📉", couleur: "#7f8c8d",
    negatif: true, max: 10, permanent: false, ignoreBouclier: false,
    desc: "Au moment d'attaquer : 1D4 soustrait à l'attaque (total ≤ 0 = pas d'attaque). Descend après chaque utilisation."
  }
];
