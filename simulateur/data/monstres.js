/* =============================================================================
 *  MONSTRES (bestiaire pré-rempli)  —  La Forteresse de l'Envie
 * -----------------------------------------------------------------------------
 *  Stats de base + passif + attaques + défense (cartes / sélection d'action).
 *  PV et cases sont calculés par le simulateur (mêmes formules que les PJ).
 *
 *    passif   : texte affiché en encadré sur la fiche
 *    attaques : [{ nom, de, desc?, table? }] — listées au clic, 🎲 = tirage
 *    defense  : { nom, de?, desc?, table? } — affichée face à l'attaque adverse
 * ===========================================================================*/
window.DB = window.DB || {};
window.DB.monstres = [
  {
    id: "soldat-bleu", nom: "Le Soldat Bleu", level: 1,
    stats: { CON: 0, FOR: 10, VIT: 0, CTRL: 0, INT: 0, VOL: 2 },
    passif: "Apparence de géant vulnérable + casque magique. Lorsqu'il est attaqué pendant le tour des joueurs, il s'équipe de son Armure spirituelle APRÈS l'attaque (JdS d'observation INT pour la repérer). Après avoir lancé Bannissement, il perd définitivement l'armure.",
    attaques: [
      { nom: "Attaque de base", de: "1D20 (1-17)", desc: "Frappe au Morgenstern du géant bleu (dégâts de l'arme + FOR)." },
      { nom: "Bannissement du soldat bleu", de: "1D20 (18+)", desc: "Capacité spéciale de bannissement. Après usage, perd l'armure spirituelle." }
    ],
    defense: {
      nom: "Garde du géant",
      table: {
        entetes: ["DD", "Condition", "Effet"],
        lignes: [
          ["1+", "Possède l'armure spirituelle", "Bloque tous les dégâts"],
          ["10+", "—", "Bloque 5"]
        ]
      }
    },
    notes: ""
  },
  {
    id: "lapin-rouge", nom: "Lapin rouge aux yeux bleus (exemple)", level: 10,
    stats: { CON: 10, FOR: 10, VIT: 0, CTRL: 0, INT: 10, VOL: 2 },
    passif: "Fiche d'exemple. Les stats servent surtout aux Jets de sauvegarde (JdS).",
    attaques: [
      {
        nom: "Coup de boule (FOR)", de: "1D20",
        table: {
          entetes: ["DD 1D20", "Attaque", "Effet"],
          lignes: [
            ["2+", "Dégâts du dé", "—"],
            ["15+", "Dégâts du dé +5", "Brûle la cible"],
            ["20+", "Dégâts du dé ×2", "Brûle (si ≤10 au tour précédent)"]
          ]
        }
      },
      {
        nom: "Feu Infernal", de: "1D4",
        table: {
          entetes: ["DD 1D4", "Effet", "JdS"],
          lignes: [["2+", "Dégât du dé + 2 Brûlures 🔥", "CON DD10 +INT"]]
        }
      }
    ],
    defense: {
      nom: "Tu as osé", de: "1D4",
      table: {
        entetes: ["DD 1D4", "Dégât", "Effet", "JdS"],
        lignes: [["1+", "Dégâts du dé", "Inflige une brûlure 🔥", "CON"]]
      }
    },
    notes: ""
  }
];
