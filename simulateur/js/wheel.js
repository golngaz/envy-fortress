/* =============================================================================
 *  ROUE D'INITIATIVE — moteur (Système de Vitesse)
 * -----------------------------------------------------------------------------
 *  Moteur pur et testable (`Wheel.createEngine()`), validé par
 *  `tests/wheel.test.js`. `store.js` ne fait que le piloter (hydrate/serialize).
 *
 *  ┌─ VOCABULAIRE ───────────────────────────────────────────────────────────┐
 *  │ • positionAbsolue : entier cumulé d'un pion. La CASE visible (0..5) vaut  │
 *  │   positionAbsolue mod 6. L'absolu sert à compter les TOURS (laps) ;       │
 *  │   l'ordre de jeu et la flèche raisonnent en cases visibles.               │
 *  │ • flèche : marque « le dernier de la course ». Deux quantités :           │
 *  │     - arrowCase (0..5, affichée) = la queue de course, côté visuel.       │
 *  │     - arrowLine (absolu) = la ligne de référence pour compter les tours.  │
 *  │       Elle suit le porteur de la flèche, ne « remonte » pas dans le tour  │
 *  │       (collante) sauf transfert légitime → un pion lapé qui ré-avance ne  │
 *  │       fait pas disparaître les tours gagnés par les autres.               │
 *  │ • frise (frieze) : ordre de jeu du tour = ORDRE DE BASE (chaque pion une  │
 *  │   fois, figé au tour global) + CUBES BONUS ajoutés à la FIN.              │
 *  │ • cube bonus : un rejeu. Sources : un pion qui DÉPASSE la flèche (par     │
 *  │   tour global, par avancée, ou par repoussement) gagne un tour bonus.     │
 *  │ • « un seul tour » : au tour global, la mémoire du tour (high-water,      │
 *  │   lignes) est remise à zéro (resetTurnMemory) ET les positions sont       │
 *  │   repliées sur une seule fenêtre de tour (collapseToOneLap) — les écarts  │
 *  │   multi-tours accumulés s'effacent, donc les cubes bonus disparaissent    │
 *  │   d'un tour sur l'autre (sauf ceux gagnés pendant le tour en cours).      │
 *  └──────────────────────────────────────────────────────────────────────────┘
 *
 *  ── TYPES (JSDoc) ──────────────────────────────────────────────────────────
 *  @typedef {Object} Pion
 *  @property {string}  id                  identifiant unique du combattant.
 *  @property {number}  vitesse             statistique VIT (départage les égalités).
 *  @property {number}  vitesseDeplacement  cases parcourues par tour global (casesABS).
 *  @property {boolean} estJoueur           true = PJ, false = PNJ.
 *  @property {number}  positionAbsolue     position cumulée ; case visible = mod 6.
 *
 *  @typedef {Object} CubeFrise
 *  @property {string}  id     pion qui joue ce cube.
 *  @property {boolean} bonus  false = tour de base, true = rejeu (tour bonus).
 *
 *  @typedef {Object} EtatRoue
 *  @property {Pion[]}                pawns      pions présents.
 *  @property {CubeFrise[]}           frieze     ordre de jeu du tour (base + bonus).
 *  @property {string[]}              turnOrder  ordre de base figé (ids).
 *  @property {number}                turn       numéro du tour global.
 *  @property {number}                arrowCase  case 0..5 de la flèche (affichée).
 *  @property {number}                arrowLine  ligne de flèche en absolu.
 *  @property {?string}               flecheId   id du porteur de la flèche.
 *  @property {string[]}              lapCubes   cubes « tour » dans l'ordre chronologique.
 *  @property {Object<string,number>} startPos  position de chaque pion au début du tour.
 *  @property {Object<string,number>} peakPos   plus haute position atteinte ce tour, par pion.
 *  @property {Object<string,number>} leadPeak  plus grand écart par paire "idA idB".
 *  @property {Object<string,number>} lapPeak   plus grand nb de tours atteint ce tour, par pion.
 *
 *  @typedef {Object} OptionsPion   options de `add` (clés d'entrée du moteur).
 *  @property {number}  [vit]       vitesse (VIT).
 *  @property {boolean} [isPlayer]  true si PJ.
 *  @property {number}  [speed]     cases/tour (sinon dérivé de vit).
 *
 *  @typedef {Object} EntreePion    élément de liste pour `syncPawns`.
 *  @property {string}  id
 *  @property {number}  [vit]
 *  @property {number}  [speed]
 *  @property {boolean} [isPlayer]
 *  @property {number}  [a]         position absolue initiale (pions nouveaux).
 *
 *  @typedef {Object} Moteur        API publique d'un moteur de roue (cf. retour de createEngine).
 *  @property {EtatRoue} _state
 *  @property {(id:string, options?:OptionsPion)=>EtatRoue} add
 *  @property {(id:string, numeroCase:number)=>EtatRoue}    place
 *  @property {(numeroCase:number)=>EtatRoue}               setArrowCase
 *  @property {()=>EtatRoue}                                start
 *  @property {()=>EtatRoue}                                globalTurn
 *  @property {(id:string, delta:number)=>EtatRoue}         nudge
 *  @property {(id:string)=>EtatRoue}                       advance
 *  @property {(id:string)=>EtatRoue}                       retreat
 *  @property {()=>EtatRoue}                                reset
 *  @property {()=>void}                                    recomputeBonuses
 *  @property {()=>string[]}                                baseOrder
 *  @property {()=>number}                                  arrowCase
 *  @property {(id:string)=>number}                         caseOfId
 *  @property {()=>string[]}                                friezeIds
 *  @property {()=>CubeFrise[]}                             bonuses
 *  @property {(id:string)=>?Pion}                         find
 *  @property {()=>EtatRoue}                                serialize
 *  @property {(donnees:Object)=>void}                      hydrate
 *  @property {(liste:EntreePion[])=>void}                  syncPawns
 *  @property {CubeFrise[]} frieze
 *  @property {Pion[]}      pawns
 *  @property {?string}     flecheId
 *  @property {number}      turn
 * ===========================================================================*/
(function (root, factory) {
  var roueModule = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = roueModule;
  }

  if (typeof window !== "undefined") {
    window.Wheel = roueModule;
  }
})(this, function () {
  "use strict";

  /** Nombre de cases de la roue. @type {number} */
  var SIZE = 6;

  /* ----------------------------- helpers purs ----------------------------- */

  /** Case affichée 0..5 à partir d'une position absolue (gère les négatifs).
   *  @param {number} position
   *  @returns {number} */
  function caseAbs(position) {
    return (((position || 0) % SIZE) + SIZE) % SIZE;
  }

  /** Case 0..5 d'un pion (objet avec .wa / .positionAbsolue / .a / .pos)
   *  OU d'un nombre.
   *  @param {(number|Object)} valeur
   *  @returns {number} */
  function caseOf(valeur) {
    if (valeur == null) {
      return 0;
    }
    if (typeof valeur === "number") {
      return caseAbs(valeur);
    }
    if (valeur.wa != null) {
      return caseAbs(valeur.wa);
    }
    if (valeur.positionAbsolue != null) {
      return caseAbs(valeur.positionAbsolue);
    }
    if (valeur.a != null) {
      return caseAbs(valeur.a);
    }
    return caseAbs(valeur.pos);
  }

  /** Distance « vers l'avant » de numeroCase par rapport à la flèche caseFleche (0..5).
   *  @param {number} numeroCase
   *  @param {number} caseFleche
   *  @returns {number} */
  function aheadOfArrow(numeroCase, caseFleche) {
    return (numeroCase - caseFleche + SIZE) % SIZE;
  }

  /** Clé d'un couple ordonné de pions (pour les mémoires par paire).
   *  @param {string} idA
   *  @param {string} idB
   *  @returns {string} */
  function pairKey(idA, idB) {
    return idA + " " + idB;
  }

  /** Premier argument défini (≠ null/undefined) — pour hydrate rétro-compatible.
   *  @param {...*} valeurs
   *  @returns {*} */
  function firstDefined() {
    for (var index = 0; index < arguments.length; index++) {
      if (arguments[index] != null) {
        return arguments[index];
      }
    }
    return undefined;
  }

  /* -------------------------------- moteur -------------------------------- */

  /** Crée un moteur de roue indépendant.
   *  @returns {Moteur} */
  function createEngine() {

    /** État interne du moteur (exposé en lecture seule via `_state` au Store).
     *  @type {EtatRoue} */
    var self = {
      pawns: [],
      frieze: [],
      turnOrder: [],
      turn: 1,
      arrowCase: 0,
      arrowLine: 0,
      flecheId: null,
      lapCubes: [],
      startPos: {},
      peakPos: {},
      leadPeak: {},
      lapPeak: {}
    };

    /** Retrouve un pion par son id.
     *  @param {string} idCherche
     *  @returns {?Pion} */
    function find(idCherche) {
      for (var index = 0; index < self.pawns.length; index++) {
        if (self.pawns[index].id === idCherche) {
          return self.pawns[index];
        }
      }
      return null;
    }

    /** Pions actuellement sur la case visible `numeroCase`.
     *  @param {number} numeroCase
     *  @returns {Pion[]} */
    function pawnsOnCase(numeroCase) {
      return self.pawns.filter(function (pion) {
        return caseAbs(pion.positionAbsolue) === numeroCase;
      });
    }

    /* ------------------------------- setup -------------------------------- */

    /** Ajoute un pion (position absolue initiale 0). `options` utilise les clés
     *  d'entrée vit / isPlayer / speed (wrapper de tests et store.pawnList).
     *  @param {string} id
     *  @param {OptionsPion} [options]
     *  @returns {EtatRoue} */
    function add(id, options) {
      options = options || {};

      var vitesse = options.vit || 0;
      var estJoueur = !!options.isPlayer;

      // défaut = casesABS de rules.js : 1 + floor(vitesse/3) === floor(1 + vitesse/3).
      // Dupliqué volontairement pour garder le moteur sans dépendance (tests Node).
      var vitesseDeplacement = 1 + Math.floor(vitesse / 3);

      if (options.speed != null) {
        vitesseDeplacement = options.speed;
      }

      self.pawns.push({
        id: id,
        vitesse: vitesse,
        estJoueur: estJoueur,
        vitesseDeplacement: vitesseDeplacement,
        positionAbsolue: 0
      });
      return self;
    }

    /** Place un pion sur une case 0..5 (position absolue initiale = la case).
     *  @param {string} id
     *  @param {number} numeroCase
     *  @returns {EtatRoue} */
    function place(id, numeroCase) {
      var pion = find(id);

      if (pion) {
        pion.positionAbsolue = caseAbs(numeroCase);
      }
      return self;
    }

    /** Flèche initiale : premier pion présent sur la case `numeroCase`.
     *  @param {number} numeroCase
     *  @returns {EtatRoue} */
    function setArrowCase(numeroCase) {
      self.arrowCase = caseAbs(numeroCase);

      var pionsIci = pawnsOnCase(self.arrowCase);

      if (pionsIci.length) {
        self.flecheId = pionsIci[0].id;
      } else {
        self.flecheId = null;
      }
      return self;
    }

    /* ------------------------------- flèche ------------------------------- */

    /** `pion` est-il STRICTEMENT plus en queue que `meilleur` ?
     *  Ordre total : positionAbsolue croissante, puis vitesse croissante, puis
     *  PNJ avant PJ. Égalité totale → false (on garde l'incumbent : stable).
     *  @param {Pion} pion
     *  @param {Pion} meilleur
     *  @returns {boolean} */
    function isMoreBehind(pion, meilleur) {

      if (pion.positionAbsolue !== meilleur.positionAbsolue) {
        return pion.positionAbsolue < meilleur.positionAbsolue;
      }

      var vitessePion = pion.vitesse || 0;
      var vitesseMeilleur = meilleur.vitesse || 0;

      if (vitessePion !== vitesseMeilleur) {
        return vitessePion < vitesseMeilleur;
      }

      return !pion.estJoueur && meilleur.estJoueur;
    }

    /** Pion de queue parmi `candidats` (« le dernier de la course »).
     *  @param {Pion[]} candidats
     *  @returns {?Pion} */
    function mostBehind(candidats) {
      return candidats.reduce(function (meilleur, pion) {

        if (meilleur == null) {
          return pion;
        }

        if (isMoreBehind(pion, meilleur)) {
          return pion;
        }

        return meilleur;
      }, null);
    }

    /** (Re)pose la flèche sur la queue, à neuf (départ / tour global).
     *  @returns {void} */
    function anchorArrowToTail() {
      var pionQueue = mostBehind(self.pawns);

      if (pionQueue) {
        self.arrowCase = caseAbs(pionQueue.positionAbsolue);
        self.flecheId = pionQueue.id;
        self.arrowLine = pionQueue.positionAbsolue;
      } else {
        self.arrowCase = 0;
        self.flecheId = null;
        self.arrowLine = 0;
      }
    }

    /** Maintient arrowCase / flecheId après un déplacement manuel, et recale
     *  arrowLine :
     *   - transfert LÉGITIME (l'ancien dernier est passé devant le nouveau) →
     *     la ligne remonte sur le nouveau dernier ;
     *   - sinon (même porteur, ou pion lapé qui ré-avance) → la ligne ne remonte
     *     pas (collante : elle ne fait que descendre).
     *  @returns {void} */
    function updateArrowAfterMove() {

      if (!self.pawns.length) {
        self.flecheId = null;
        return;
      }

      var ancienFlecheId = self.flecheId;

      // la flèche avance jusqu'à la prochaine case occupée si la sienne se vide
      var securiteBoucle = 0;

      while (!pawnsOnCase(self.arrowCase).length && securiteBoucle < SIZE) {
        self.arrowCase = caseAbs(self.arrowCase + 1);
        securiteBoucle++;
      }

      var porteurAvant = null;

      if (ancienFlecheId != null) {
        porteurAvant = find(ancienFlecheId);
      }

      if (!porteurAvant || caseAbs(porteurAvant.positionAbsolue) !== self.arrowCase) {
        self.flecheId = mostBehind(pawnsOnCase(self.arrowCase)).id;
      }

      var porteurActuel = find(self.flecheId);
      var positionPorteur = porteurActuel.positionAbsolue;

      var ancienPorteur = null;

      if (self.flecheId !== ancienFlecheId && ancienFlecheId != null) {
        ancienPorteur = find(ancienFlecheId);
      }

      // Transfert « légitime » : l'ancien dernier est passé DEVANT le nouveau →
      // la ligne remonte sur le nouveau dernier. Sinon, la ligne est collante :
      // elle ne fait que descendre (pion lapé qui ré-avance, ou même porteur).
      var transfertLegitime = ancienPorteur && ancienPorteur.positionAbsolue >= positionPorteur;

      if (transfertLegitime) {
        self.arrowLine = positionPorteur;
      } else if (positionPorteur < self.arrowLine) {
        self.arrowLine = positionPorteur;
      }
    }

    /** Case visible de la flèche.
     *  @returns {number} */
    function arrowCase() {
      return self.arrowCase;
    }

    /* ----------------------------- ordre du tour -------------------------- */

    /** Ordre de base : le plus éloigné de la flèche (vers l'avant) joue d'abord ;
     *  celui collé à la flèche en dernier. Égalité → vitesse haute, puis PJ.
     *  @returns {string[]} */
    function computeTurnOrder() {
      var caseFleche = self.arrowCase;

      var pionsTries = self.pawns.slice().sort(function (pionA, pionB) {
        var distanceA = aheadOfArrow(caseAbs(pionA.positionAbsolue), caseFleche);
        var distanceB = aheadOfArrow(caseAbs(pionB.positionAbsolue), caseFleche);

        if (distanceB !== distanceA) {
          return distanceB - distanceA;
        }

        var vitesseA = pionA.vitesse || 0;
        var vitesseB = pionB.vitesse || 0;

        if (vitesseB !== vitesseA) {
          return vitesseB - vitesseA;
        }

        if (pionA.estJoueur === pionB.estJoueur) {
          return 0;
        }

        if (pionA.estJoueur) {
          return -1;
        }

        return 1;
      });

      return pionsTries.map(function (pion) {
        return pion.id;
      });
    }

    /** Garde turnOrder cohérent avec les pions présents, SANS le réordonner
     *  (un nudge ne change pas l'ordre de base).
     *  @returns {void} */
    function syncTurnOrder() {
      var pionsPresents = {};

      self.pawns.forEach(function (pion) {
        pionsPresents[pion.id] = true;
      });

      self.turnOrder = (self.turnOrder || []).filter(function (id) {
        return pionsPresents[id];
      });

      var dejaDansOrdre = {};

      self.turnOrder.forEach(function (id) {
        dejaDansOrdre[id] = true;
      });

      self.pawns.forEach(function (pion) {
        if (!dejaDansOrdre[pion.id]) {
          self.turnOrder.push(pion.id);
        }
      });
    }

    /* --------------------------- mémoire du tour -------------------------- */

    /** Remet à zéro toute la mémoire du tour (high-water, ancrages, cubes).
     *  On suit TOUTES les paires (pionA, pionB) : la flèche peut changer de
     *  porteur en cours de tour (recapture / transfert), donc n'importe quel
     *  pion peut devenir la référence — chacun doit déjà avoir ses écarts en
     *  high-water.
     *  @returns {void} */
    function resetTurnMemory() {
      self.startPos = {};
      self.peakPos = {};
      self.leadPeak = {};
      self.lapPeak = {};
      self.lapCubes = [];

      self.pawns.forEach(function (pion) {
        self.startPos[pion.id] = pion.positionAbsolue;
        self.peakPos[pion.id] = pion.positionAbsolue;
      });

      self.pawns.forEach(function (pionA) {
        self.pawns.forEach(function (pionB) {
          if (pionA.id !== pionB.id) {
            self.leadPeak[pairKey(pionA.id, pionB.id)] = pionA.positionAbsolue - pionB.positionAbsolue;
          }
        });
      });
    }

    /** Met à jour les high-water (sommets de position et d'écart) après un mouvement.
     *  @returns {void} */
    function recordPeaks() {
      self.pawns.forEach(function (pionA) {

        if (pionA.positionAbsolue > self.peakPos[pionA.id]) {
          self.peakPos[pionA.id] = pionA.positionAbsolue;
        }

        self.pawns.forEach(function (pionB) {

          if (pionA.id === pionB.id) {
            return;
          }

          var ecart = pionA.positionAbsolue - pionB.positionAbsolue;
          var cle = pairKey(pionA.id, pionB.id);

          if (ecart > self.leadPeak[cle]) {
            self.leadPeak[cle] = ecart;
          }
        });
      });
    }

    /* ----------------------------- cubes bonus ---------------------------- */

    /** Écart de positions au DÉBUT du tour entre `idPion` et la flèche `idFleche`.
     *  @param {string} idPion
     *  @param {string} idFleche
     *  @returns {number} */
    function startLead(idPion, idFleche) {
      return self.startPos[idPion] - self.startPos[idFleche];
    }

    /** Sous-tour : `idPion` partait derrière/sur la flèche `idFleche` et l'a
     *  dépassée par l'avant (vaut intrinsèquement 0 ou 1 → booléen).
     *  @param {string} idPion
     *  @param {string} idFleche
     *  @returns {boolean} */
    function hasSubTurn(idPion, idFleche) {
      return startLead(idPion, idFleche) < 0 && self.leadPeak[pairKey(idPion, idFleche)] >= 1;
    }

    /** Recapture : `idPion` était devant la flèche `idFleche`, repoussé
     *  dessus/derrière → la flèche rejoue.
     *  @param {string} idPion
     *  @param {string} idFleche
     *  @returns {boolean} */
    function triggersRecapture(idPion, idFleche) {

      if (find(idPion).positionAbsolue >= self.peakPos[idPion]) {
        return false;            // le pion n'a pas reculé
      }

      var ecartMax = self.leadPeak[pairKey(idPion, idFleche)];
      var positionRelative = find(idPion).positionAbsolue - find(idFleche).positionAbsolue;

      return ecartMax >= 1 && positionRelative <= 0;
    }

    /** Nombre de tours « vivants » d'un pion (relatif à la ligne de flèche).
     *  @param {string} id
     *  @returns {number} */
    function liveLaps(id) {
      var tours = Math.floor((find(id).positionAbsolue - self.arrowLine) / SIZE);
      return Math.max(0, tours);
    }

    /** Synchronise lapCubes (liste chronologique) avec le nombre de tours visé.
     *  Le visé est MONOTONE dans le tour (high-water lapPeak) : un tour gagné ne
     *  se retire jamais. Les ajouts suivent l'ordre fourni → ordre chronologique.
     *  @param {string[]} ids
     *  @returns {void} */
    function reconcileLapCubes(ids) {
      var cible = {};
      var comptes = {};

      ids.forEach(function (id) {
        var toursActuels = liveLaps(id);

        if (self.lapPeak[id] == null || toursActuels > self.lapPeak[id]) {
          self.lapPeak[id] = toursActuels;   // high-water
        }

        cible[id] = self.lapPeak[id];
        comptes[id] = 0;
      });

      self.lapCubes.forEach(function (id) {
        if (comptes[id] != null) {
          comptes[id]++;
        }
      });

      // retraits : ne surviennent plus via un nudge (cible monotone) ; gardés pour
      // le retrait d'un pion (syncPawns) et par robustesse.
      ids.forEach(function (id) {
        while (comptes[id] > cible[id]) {
          self.lapCubes.splice(self.lapCubes.lastIndexOf(id), 1);
          comptes[id]--;
        }
      });

      // ajouts dans l'ordre fourni
      ids.forEach(function (id) {
        while (comptes[id] < cible[id]) {
          self.lapCubes.push(id);
          comptes[id]++;
        }
      });
    }

    /** Reconstruit la frise depuis zéro = ordre de base + cubes bonus (tours,
     *  sous-tours, recaptures). Utilisé au départ et au tour global ; les nudges
     *  manipulent la frise de façon incrémentale (voir `nudge`).
     *  @returns {void} */
    function rebuildFrieze() {
      syncTurnOrder();

      var pawns = self.turnOrder.slice();
      reconcileLapCubes(pawns);

      var sousTours = {};
      var nbRecaptures = 0;
      var idFleche = self.flecheId;

      pawns.forEach(function (id) {
        sousTours[id] = false;
      });

      if (idFleche != null) {
        self.pawns.forEach(function (pion) {

          if (pion.id === idFleche) {
            return;
          }

          sousTours[pion.id] = hasSubTurn(pion.id, idFleche);

          if (triggersRecapture(pion.id, idFleche)) {
            nbRecaptures++;
          }
        });
      }

      var cubesBonus = self.lapCubes.slice();                 // 1) tours (chronologiques)

      pawns.forEach(function (id) {                            // 2) sous-tours (ordre de base)
        if (sousTours[id]) {
          cubesBonus.push(id);
        }
      });

      for (var index = 0; index < nbRecaptures && idFleche != null; index++) {  // 3) recaptures
        cubesBonus.push(idFleche);
      }

      var cubesBase = pawns.map(function (id) {
        return { id: id, bonus: false };
      });

      var cubesRejeu = cubesBonus.map(function (id) {
        return { id: id, bonus: true };
      });

      self.frieze = cubesBase.concat(cubesRejeu);
    }

    /* ------------------------------ opérations ---------------------------- */

    /** Modèle « un seul tour » : replie toutes les positions absolues dans une
     *  SEULE fenêtre de tour au-dessus de la queue. Les cases visibles (mod 6) et
     *  l'ordre intra-tour sont préservés, mais les écarts MULTI-TOURS accumulés
     *  (un pion très en avance, ou un autre repoussé loin derrière) sont effacés.
     *  Appelé au tour global : sans ça, `liveLaps` resterait ≥ 1 en permanence et
     *  les cubes bonus ne disparaîtraient jamais d'un tour sur l'autre.
     *  @returns {void} */
    function collapseToOneLap() {
      var pionQueue = mostBehind(self.pawns);

      if (!pionQueue) {
        return;
      }

      var positionQueue = pionQueue.positionAbsolue;
      var caseQueue = caseAbs(positionQueue);

      self.pawns.forEach(function (pion) {
        var avance = aheadOfArrow(caseAbs(pion.positionAbsolue), caseQueue);
        pion.positionAbsolue = positionQueue + avance;
      });
    }

    /** Démarre/recalcule la roue depuis l'état courant des positions.
     *  @returns {EtatRoue} */
    function start() {
      resetTurnMemory();
      anchorArrowToTail();
      self.turnOrder = computeTurnOrder();
      rebuildFrieze();
      return self;
    }

    /** Réinitialise la roue : tous les pions case 1 (position 0), tour 1, flèche
     *  et frise recalculées à neuf. (PV/PA/jetons des combattants : côté Store.)
     *  @returns {EtatRoue} */
    function reset() {
      self.pawns.forEach(function (pion) {
        pion.positionAbsolue = 0;
      });

      self.turn = 1;
      start();
      return self;
    }

    /** Joue un tour global : chaque pion avance de sa vitesse de déplacement, la
     *  flèche se replace sur la queue, l'ordre de base se refige.
     *  @returns {EtatRoue} */
    function globalTurn() {
      self.turn++;
      collapseToOneLap();   // « un seul tour » : on efface les avances accumulées AVANT d'avancer
      resetTurnMemory();

      self.pawns.forEach(function (pion) {
        pion.positionAbsolue += Math.max(0, pion.vitesseDeplacement || 0);
      });

      recordPeaks();
      anchorArrowToTail();
      self.turnOrder = computeTurnOrder();   // l'ordre de jeu se (re)fige au tour global
      rebuildFrieze();
      return self;
    }

    /** Déplacement manuel d'un pion de `delta` cases (la base figée n'est PAS
     *  réordonnée). Un dépassement de flèche ajoute un cube bonus à la FIN :
     *   - avance qui ATTEINT la flèche → le pion rejoue ;
     *   - recul DEPUIS la case de la flèche → la flèche suit le pion reculé, et
     *     les autres pions désormais sur cette case rejouent (par vitesse).
     *  @param {string} id
     *  @param {number} delta
     *  @returns {EtatRoue} */
    function nudge(id, delta) {
      var pawn = find(id);

      if (!pawn) {
        return self;
      }

      var caseAvant = caseAbs(pawn.positionAbsolue);
      pawn.positionAbsolue += delta;
      var caseApres = caseAbs(pawn.positionAbsolue);
      recordPeaks();

      if (delta < 0) {
        if (caseAvant === self.arrowCase) {
          var nouveauxTours = pawnsOnCase(caseApres)
            .filter(function (autre) { return autre.id !== pawn.id; })
            .map(function (autre) { return { id: autre.id, bonus: true }; });

          self.frieze = self.frieze.concat(_sortPawnByVitesse(nouveauxTours).reverse());
          self.arrowCase = caseApres;
        }
      } else if (caseApres === self.arrowCase) {
        self.frieze.push({ id: pawn.id, bonus: true });
      }

      reconcileLapCubes(self.pawns.map(function (pion) { return pion.id; }));
      updateArrowAfterMove();

      return self;
    }

    /** Avance un pion d'une case.
     *  @param {string} id
     *  @returns {EtatRoue} */
    function advance(id) {
      return nudge(id, +1);
    }

    /** Repousse un pion d'une case.
     *  @param {string} id
     *  @returns {EtatRoue} */
    function retreat(id) {
      return nudge(id, -1);
    }

    /* ------------------------------- lecture ------------------------------ */

    /** Case visible d'un pion (0..5).
     *  @param {string} id
     *  @returns {number} */
    function caseOfId(id) {
      var pion = find(id);

      if (pion) {
        return caseAbs(pion.positionAbsolue);
      }
      return 0;
    }

    /** Ids de la frise dans l'ordre de jeu.
     *  @returns {string[]} */
    function friezeIds() {
      return self.frieze.map(function (entree) {
        return entree.id;
      });
    }

    /** Cubes bonus (rejeux) de la frise.
     *  @returns {CubeFrise[]} */
    function bonuses() {
      return self.frieze.filter(function (entree) {
        return entree.bonus;
      });
    }

    /* ----------------------- (dé)sérialisation (Store) -------------------- */

    /** Copie profonde de l'état (pour persistance).
     *  @returns {EtatRoue} */
    function serialize() {
      return JSON.parse(JSON.stringify(self));
    }

    /** Normalise un pion sauvegardé vers les noms de propriétés actuels (accepte
     *  les anciens noms : vit / speed / isPlayer / a — sauvegardes antérieures).
     *  @param {Object} pionSauve
     *  @returns {Pion} */
    function migratePawn(pionSauve) {
      return {
        id: pionSauve.id,
        vitesse: firstDefined(pionSauve.vitesse, pionSauve.vit, 0),
        estJoueur: !!firstDefined(pionSauve.estJoueur, pionSauve.isPlayer, false),
        vitesseDeplacement: firstDefined(pionSauve.vitesseDeplacement, pionSauve.speed, 0),
        positionAbsolue: firstDefined(pionSauve.positionAbsolue, pionSauve.a, 0)
      };
    }

    /** Réhydrate l'état depuis un objet sérialisé (accepte les anciens noms de
     *  champs : base / farrow / fa / lapLog / _anchor / _peak / _hi / _lapHi).
     *  @param {Object} donnees
     *  @returns {void} */
    function hydrate(donnees) {
      if (!donnees) {
        return;
      }

      self.pawns = (donnees.pawns || []).map(migratePawn);
      self.frieze = donnees.frieze || [];
      self.turn = donnees.turn || 1;

      if (donnees.flecheId != null) {
        self.flecheId = donnees.flecheId;
      } else {
        self.flecheId = null;
      }

      self.turnOrder = firstDefined(donnees.turnOrder, donnees.base, []) || [];
      self.arrowCase = firstDefined(donnees.arrowCase, donnees.farrow, 0) || 0;
      self.arrowLine = firstDefined(donnees.arrowLine, donnees.fa, 0) || 0;
      self.lapCubes = firstDefined(donnees.lapCubes, donnees.lapLog, []) || [];
      self.startPos = firstDefined(donnees.startPos, donnees._anchor, {}) || {};
      self.peakPos = firstDefined(donnees.peakPos, donnees._peak, {}) || {};
      self.leadPeak = firstDefined(donnees.leadPeak, donnees._hi, {}) || {};
      self.lapPeak = firstDefined(donnees.lapPeak, donnees._lapHi, {}) || {};
    }

    /** Synchronise la liste des pions avec des combattants (ajout/retrait/maj
     *  vitesse). `liste` utilise les clés d'entrée vit / speed / isPlayer / a.
     *  La position des pions déjà présents est conservée.
     *  @param {EntreePion[]} liste
     *  @returns {void} */
    function syncPawns(liste) {
      var pionsParId = {};

      self.pawns.forEach(function (pion) {
        pionsParId[pion.id] = pion;
      });

      var aGarder = {};

      liste.forEach(function (entree) {
        aGarder[entree.id] = true;

        var pion = pionsParId[entree.id];

        if (pion) {
          pion.vitesse = entree.vit || 0;
          pion.vitesseDeplacement = entree.speed;
          pion.estJoueur = !!entree.isPlayer;
        } else {
          var positionInitiale = 0;

          if (entree.a != null) {
            positionInitiale = entree.a;
          }

          self.pawns.push({
            id: entree.id,
            vitesse: entree.vit || 0,
            vitesseDeplacement: entree.speed,
            estJoueur: !!entree.isPlayer,
            positionAbsolue: positionInitiale
          });
        }
      });

      self.pawns = self.pawns.filter(function (pion) {
        return aGarder[pion.id];
      });

      if (self.flecheId != null && !aGarder[self.flecheId]) {
        self.flecheId = null;
      }

      self.lapCubes = (self.lapCubes || []).filter(function (id) {
        return aGarder[id];
      });

      self.frieze = (self.frieze || []).filter(function (entree) {
        return aGarder[entree.id];
      });
    }

    /** Trie une liste par vitesse décroissante, puis PJ avant PNJ.
     *  (Utilisé pour ordonner les rejeux ajoutés lors d'un repoussement.)
     *  @param {Array<{vitesse?:number, estJoueur?:boolean}>} liste
     *  @returns {Array} la même liste, triée en place */
    function _sortPawnByVitesse(liste) {
      return liste.sort(function (a, b) {
        var vitesseA = a.vitesse || 0;
        var vitesseB = b.vitesse || 0;

        if (vitesseB !== vitesseA) {
          return vitesseB - vitesseA;
        }

        if (a.estJoueur === b.estJoueur) {
          return 0;
        }

        if (a.estJoueur) {
          return -1;
        }

        return 1;
      });
    }

    return {
      _state: self,
      add: add,
      place: place,
      setArrowCase: setArrowCase,
      start: start,
      globalTurn: globalTurn,
      nudge: nudge,
      advance: advance,
      retreat: retreat,
      reset: reset,
      recomputeBonuses: rebuildFrieze,
      baseOrder: computeTurnOrder,
      arrowCase: arrowCase,
      caseOfId: caseOfId,
      friezeIds: friezeIds,
      bonuses: bonuses,
      find: find,
      serialize: serialize,
      hydrate: hydrate,
      syncPawns: syncPawns,
      get frieze() { return self.frieze; },
      get pawns() { return self.pawns; },
      get flecheId() { return self.flecheId; },
      get turn() { return self.turn; }
    };
  }

  return {
    SIZE: SIZE,
    caseAbs: caseAbs,
    caseOf: caseOf,
    createEngine: createEngine
  };
});
