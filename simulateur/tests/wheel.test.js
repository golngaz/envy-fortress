/* =============================================================================
 *  TESTS UNITAIRES — Roue d'initiative (js/wheel.js)
 * -----------------------------------------------------------------------------
 *  Exécution :
 *   • Node       : `npm test` (ou `node tests/run.js`).
 *   • Navigateur : page dédiée `tests/index.html` (servie par le serveur).
 *
 *  Les cases sont exprimées en 1..6 (comme l'énoncé des règles) via le wrapper
 *  `makeWheel()` ; le moteur travaille en interne en positions absolues.
 *
 *  Chaque scénario est encapsulé dans une fonction `suite*(eq)` ; `eq(nom, obtenu,
 *  attendu)` enregistre une assertion. La liste `SUITES` est consommée par le
 *  harnais (`tests/harness.js`).
 * ===========================================================================*/
(function (root, factory) {
  "use strict";
  var T = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = T;
  if (typeof window !== "undefined") window.WheelTests = T;
})(this, function () {
  "use strict";

  var Wheel = (typeof module !== "undefined" && module.exports)
    ? require("../js/wheel.js") : window.Wheel;

  /* ---------------------------------------------------------------------------
   *  Wrapper « 1..6 » autour du moteur (positions exprimées comme les règles).
   * ------------------------------------------------------------------------- */
  function makeWheel() {
    var e = Wheel.createEngine();
    return {
      add: function (id, vit, isPlayer, speed) {
        e.add(id, { vit: vit, isPlayer: !!isPlayer, speed: speed });
        return this;
      },
      place: function (id, case1) { e.place(id, case1 - 1); return this; },
      arrow: function (case1) { e.setArrowCase(case1 - 1); return this; },
      start: function () { e.start(); return this; },
      round: function () { e.globalTurn(); return this; },
      advance: function (id) { e.advance(id); return this; },
      retreat: function (id) { e.retreat(id); return this; },

      caseOf: function (id) { return e.caseOfId(id) + 1; },
      arrowCase: function () { return e.arrowCase() + 1; },
      frieze: function () { return e.friezeIds(); },
      nBonus: function () { return e.bonuses().length; },
      count: function (id) {
        return e.friezeIds().filter(function (x) { return x === id; }).length;
      }
    };
  }

  /* ---- décors réutilisables --------------------------------------------- */

  // PJ1 (VIT 0) et M1 (VIT 3) tous deux case 1, flèche case 1.
  function duo() {
    return makeWheel()
      .add("PJ1", 0, true).add("M1", 3)
      .place("PJ1", 1).place("M1", 1).arrow(1).start();
  }

  // Comme duo() mais M1 démarre case 2 (devant le PJ).
  function duoDevant() {
    return makeWheel()
      .add("PJ1", 0, true).add("M1", 3)
      .place("M1", 2).place("PJ1", 1).arrow(1).start();
  }

  // Trio PJ1 (0) / M1 (3) / M2 (6) tous case 1, flèche case 1.
  function trio() {
    return makeWheel()
      .add("PJ1", 0, true).add("M1", 3).add("M2", 6)
      .place("M1", 1).place("PJ1", 1).place("M2", 1).arrow(1).start();
  }

  // Trio PJ / M1 (3) / M2 (6) tous case 1 (variante au PJ nommé « PJ »).
  function trioPJ() {
    return makeWheel()
      .add("PJ", 0, true).add("M1", 3).add("M2", 6)
      .place("PJ", 1).place("M1", 1).place("M2", 1).arrow(1).start();
  }

  /* =====================================================================
   *  SUITE 1 — duo immobile/rapide, tour global et nudges simples
   * ===================================================================== */
  function suiteTourGlobalDuo(eq) {
    var w = duo().round();
    eq("1a PJ1 avance case 2", w.caseOf("PJ1"), 2);
    eq("1a M1 avance case 3", w.caseOf("M1"), 3);
    eq("1a flèche suit le dernier (PJ1) case 2", w.arrowCase(), 2);
    eq("1a frise M1 (devant) puis PJ1", w.frieze(), ["M1", "PJ1"]);

    w = duo().advance("M1");
    eq("1b avancer M1 ne bouge pas PJ1", w.caseOf("PJ1"), 1);
    eq("1b M1 passe case 2", w.caseOf("M1"), 2);
    eq("1b flèche reste case 1", w.arrowCase(), 1);
    eq("1b aucun rejeu", w.nBonus(), 0);

    w = duo().advance("PJ1");
    eq("1c avancer PJ1 ne bouge pas M1", w.caseOf("M1"), 1);
    eq("1c PJ1 passe case 2", w.caseOf("PJ1"), 2);
    eq("1c flèche reste case 1", w.arrowCase(), 1);
    eq("1c aucun rejeu", w.nBonus(), 0);
  }

  /* =====================================================================
   *  SUITE 2 — duo avec M1 devant : nudges, rejeu par dépassement de flèche
   * ===================================================================== */
  function suiteNudgesDuoDevant(eq) {
    var w = duoDevant().round();
    eq("2a PJ1 case 2", w.caseOf("PJ1"), 2);
    eq("2a flèche case 2", w.arrowCase(), 2);
    eq("2a M1 case 4", w.caseOf("M1"), 4);

    w = duoDevant().advance("M1");
    eq("2b PJ1 case 1", w.caseOf("PJ1"), 1);
    eq("2b flèche case 1", w.arrowCase(), 1);
    eq("2b M1 case 3", w.caseOf("M1"), 3);

    w = duoDevant().advance("PJ1");
    eq("2c PJ1 case 2", w.caseOf("PJ1"), 2);
    eq("2c M1 case 2", w.caseOf("M1"), 2);
    eq("2c flèche case 2", w.arrowCase(), 2);
    eq("2c aucun rejeu", w.nBonus(), 0);

    w = duoDevant().advance("PJ1").retreat("PJ1");
    eq("2d aller-retour PJ1 case 1", w.caseOf("PJ1"), 1);
    eq("2d M1 case 2", w.caseOf("M1"), 2);
    eq("2d flèche case 1", w.arrowCase(), 1);
    eq("2d aucun rejeu", w.nBonus(), 0);

    w = duoDevant().advance("PJ1").advance("PJ1");
    eq("2e PJ1 case 3", w.caseOf("PJ1"), 3);
    eq("2e M1 case 2", w.caseOf("M1"), 2);
    eq("2e flèche case 2", w.arrowCase(), 2);
    eq("2e PJ1 rejoue (x2 dans la frise)", w.count("PJ1"), 2);

    w = duoDevant().advance("PJ1").advance("PJ1").retreat("PJ1");
    eq("2f PJ1 case 2", w.caseOf("PJ1"), 2);
    eq("2f M1 case 2", w.caseOf("M1"), 2);
    eq("2f flèche case 2", w.arrowCase(), 2);
    eq("2f frise M1,PJ1,PJ1,M1", w.frieze(), ["M1", "PJ1", "PJ1", "M1"]);
  }

  /* =====================================================================
   *  SUITE 3 — trio : tours globaux, reculs, flèche qui suit le pion reculé
   * ===================================================================== */
  function suiteTrio(eq) {
    var w = trio().round();
    eq("3a PJ1 case 2", w.caseOf("PJ1"), 2);
    eq("3a flèche case 2", w.arrowCase(), 2);
    eq("3a M1 case 3", w.caseOf("M1"), 3);
    eq("3a M2 case 4", w.caseOf("M2"), 4);
    eq("3a frise M2,M1,PJ1", w.frieze(), ["M2", "M1", "PJ1"]);

    w = trio().round().round().round();
    eq("3b M1 case 1", w.caseOf("M1"), 1);
    eq("3b M2 case 4", w.caseOf("M2"), 4);
    eq("3b PJ1 case 4", w.caseOf("PJ1"), 4);
    eq("3b flèche case 4", w.arrowCase(), 4);
    eq("3b frise M1,M2,PJ1,M2", w.frieze(), ["M1", "M2", "PJ1", "M2"]);

    // 3c : la frise est FIGÉE depuis le dernier tour global (M1,M2,PJ1) ; M2 avait
    // gagné un tour (cube M2 en 3b). Le recul de M2 fait suivre la flèche (case 3)
    // mais NE RETIRE PAS le cube déjà gagné — la frise ne fait qu'ajouter.
    w = trio().round().round().round().retreat("M2");
    eq("3c M1 case 1", w.caseOf("M1"), 1);
    eq("3c M2 case 3", w.caseOf("M2"), 3);
    eq("3c PJ1 case 4", w.caseOf("PJ1"), 4);
    eq("3c flèche suit le pion reculé (case 3)", w.arrowCase(), 3);
    eq("3c frise garde le tour gagné M1,M2,PJ1,M2", w.frieze(), ["M1", "M2", "PJ1", "M2"]);
    eq("3c le tour gagné reste (sticky)", w.nBonus(), 1);

    w = trio().retreat("PJ1");
    eq("3d M2 case 1", w.caseOf("M2"), 1);
    eq("3d M1 case 1", w.caseOf("M1"), 1);
    eq("3d PJ1 recule case 6", w.caseOf("PJ1"), 6);
    eq("3d flèche suit PJ1 case 6", w.arrowCase(), 6);
    eq("3d aucun rejeu", w.nBonus(), 0);
    eq("3d frise M2,M1,PJ1", w.frieze(), ["M2", "M1", "PJ1"]);

    w = trio();
    for (var i = 0; i < 6; i++) w.retreat("PJ1");
    eq("3e PJ1 a fait un tour complet en arrière", [w.caseOf("M1"), w.caseOf("M2"), w.caseOf("PJ1")], [1, 1, 1]);
    eq("3e flèche case 1", w.arrowCase(), 1);
    eq("3e frise M2,M1,PJ1,M2,M1", w.frieze(), ["M2", "M1", "PJ1", "M2", "M1"]);
    w.retreat("M2");
    eq("3e-sub M2 recule → flèche case 6", w.arrowCase(), 6);

    w = trio();
    for (var j = 0; j < 6; j++) w.retreat("M2");
    eq("3f M2 a fait un tour complet en arrière", [w.caseOf("M1"), w.caseOf("M2"), w.caseOf("PJ1")], [1, 1, 1]);
    eq("3f frise M2,M1,PJ1,M1,PJ1", w.frieze(), ["M2", "M1", "PJ1", "M1", "PJ1"]);
  }

  /* =====================================================================
   *  SUITE 4 — déplacements MANUELS : base figée, seul un dépassement de
   *  flèche ajoute un cube (jamais le dépassement d'un pion quelconque)
   * ===================================================================== */
  function suiteNudgesManuels(eq) {
    // M2 avancé en case 4 puis reculé d'1 → reste DEVANT, la flèche ne bouge pas.
    var w = trioPJ().advance("M2").advance("M2").advance("M2").retreat("M2");
    eq("A M1 case 1", w.caseOf("M1"), 1);
    eq("A PJ case 1", w.caseOf("PJ"), 1);
    eq("A M2 case 3", w.caseOf("M2"), 3);
    eq("A flèche inchangée case 1", w.arrowCase(), 1);
    eq("A aucun rejeu", w.nBonus(), 0);
    eq("A frise inchangée M2,M1,PJ", w.frieze(), ["M2", "M1", "PJ"]);

    // Doubler un pion qui n'est PAS la flèche ne change rien ; seul le dépassement
    // de la flèche (lap) ajoute un cube — sans réordonner la base.
    w = trioPJ().advance("M2").advance("M2").advance("M2"); // M2 case 4
    for (var b1 = 0; b1 < 4; b1++) w.advance("M1");          // M1 → case 5 (dépasse M2)
    eq("B1 M1 case 5", w.caseOf("M1"), 5);
    eq("B1 frise inchangée M2,M1,PJ", w.frieze(), ["M2", "M1", "PJ"]);
    for (var b2 = 0; b2 < 2; b2++) w.advance("M1");          // M1 → case 1 (lape la flèche)
    eq("B2 M1 case 1", w.caseOf("M1"), 1);
    eq("B2 M2 case 4", w.caseOf("M2"), 4);
    eq("B2 PJ case 1", w.caseOf("PJ"), 1);
    eq("B2 flèche case 1", w.arrowCase(), 1);
    eq("B2 frise M2,M1,PJ,M1", w.frieze(), ["M2", "M1", "PJ", "M1"]);
    for (var b3 = 0; b3 < 4; b3++) w.advance("M1");          // M1 → case 5 (toujours 1 seul lap)
    eq("B3 M1 case 5", w.caseOf("M1"), 5);
    eq("B3 M2 case 4", w.caseOf("M2"), 4);
    eq("B3 PJ case 1", w.caseOf("PJ"), 1);
    eq("B3 flèche case 1", w.arrowCase(), 1);
    eq("B3 frise M2,M1,PJ,M1", w.frieze(), ["M2", "M1", "PJ", "M1"]);
  }

  /* =====================================================================
   *  SUITE 5 — reculs/avances lourds de M2 : tours-arrière permanents,
   *  cubes chronologiques, flèche qui ne « remonte » pas à l'avance
   * ===================================================================== */
  function suiteReculsLourds(eq) {
    var w = trioPJ();
    for (var i = 0; i < 11; i++) w.retreat("M2");
    eq("R 11 reculs : 1 tour-arrière (paire M1,PJ)", w.frieze(), ["M2", "M1", "PJ", "M1", "PJ"]);

    w.retreat("M2"); // 12e recul → 2e tour-arrière complet
    eq("R 12 reculs : flèche case 1", w.arrowCase(), 1);
    eq("R 12 reculs : 2 paires chronologiques", w.frieze(), ["M2", "M1", "PJ", "M1", "PJ", "M1", "PJ"]);

    w.advance("M2"); // ré-avance : flèche ne remonte pas, cubes permanents
    eq("R ré-avance : flèche reste case 1", w.arrowCase(), 1);
    eq("R ré-avance : cubes conservés (sticky)", w.frieze(), ["M2", "M1", "PJ", "M1", "PJ", "M1", "PJ"]);

    w.advance("M2").advance("M2").advance("M2").advance("M2");
    eq("R +4 avances : flèche case 1", w.arrowCase(), 1);
    eq("R +4 avances : cubes inchangés", w.frieze(), ["M2", "M1", "PJ", "M1", "PJ", "M1", "PJ"]);

    w.advance("M2"); // M2 repasse la flèche par l'avant → M2 rejoue
    eq("R M2 relape la flèche : flèche case 1", w.arrowCase(), 1);
    eq("R M2 relape la flèche : +cube M2", w.frieze(), ["M2", "M1", "PJ", "M1", "PJ", "M1", "PJ", "M2"]);
  }

  /* =====================================================================
   *  SUITE 6 — cas particuliers (immobile, égalité, lap rapide, reset…)
   * ===================================================================== */
  function suiteCasParticuliers(eq) {
    // Pion immobile (speed 0) ne bouge pas au tour global.
    var w = makeWheel()
      .add("PJ1", 0, true).add("S", 0, false, 0)
      .place("PJ1", 1).place("S", 1).arrow(1).start().round();
    eq("immobile S reste case 1", w.caseOf("S"), 1);
    eq("immobile PJ1 avance case 2", w.caseOf("PJ1"), 2);

    // Départ identique : jamais de rejeu, même après plusieurs tours.
    w = duo();
    for (var k = 0; k < 5; k++) w.round();
    eq("égalité — pas de rejeu après 5 tours", w.nBonus(), 0);

    // Très rapide : lap dès le 1er tour global.
    w = makeWheel()
      .add("PJ1", 0, true).add("F", 21)
      .place("PJ1", 1).place("F", 1).arrow(1).start().round();
    eq("rapide F rejoue (lap)", w.count("F"), 2);
    eq("rapide F case (1+8) mod6 → 3", w.caseOf("F"), 3);

    // Aller-retour neutre n'ajoute aucun rejeu.
    w = duoDevant().advance("M1").retreat("M1");
    eq("aller-retour M1 neutre", w.nBonus(), 0);

    // Reset par tour : un lap n'apparaît qu'au tour où il a lieu.
    w = makeWheel()
      .add("A", 0, true).add("B", 6)
      .place("A", 1).place("B", 1).arrow(1).start();
    w.round();
    eq("t1 B pas de rejeu", w.count("B"), 1);
    w.round();
    eq("t2 B pas de rejeu", w.count("B"), 1);
    w.round();
    eq("t3 B rejoue (lead 6)", w.count("B"), 2);

    // Utilitaires purs.
    eq("Wheel.caseOf(7)=1", Wheel.caseOf(7), 1);
    eq("Wheel.caseOf({wa:13})=1", Wheel.caseOf({ wa: 13 }), 1);
    eq("Wheel.SIZE=6", Wheel.SIZE, 6);
  }

  /* =====================================================================
   *  SUITE 7 — un tour bonus GAGNÉ ne se retire jamais au recul (ajout-seul)
   *  (régression : reculer un pion retirait son cube « tour »)
   * ===================================================================== */
  function suiteTourSticky(eq) {
    // F (VIT 21 → 8 cases) lape au tour global : cube bonus F.
    var w = makeWheel()
      .add("PJ1", 0, true).add("F", 21)
      .place("PJ1", 1).place("F", 1).arrow(1).start().round();
    eq("S7 F a gagné un tour (cube F)", w.count("F"), 2);

    // Le MJ repousse F d'une case : le tour gagné DOIT rester.
    w.retreat("F");
    eq("S7 recul 1 : F garde son tour", w.count("F"), 2);

    // Reculs supplémentaires : toujours pas de retrait.
    w.retreat("F").retreat("F").retreat("F");
    eq("S7 reculs multiples : F garde son tour", w.count("F"), 2);
    eq("S7 toujours exactement 1 cube bonus", w.nBonus(), 1);

    // Ré-avancer ne duplique pas le cube (high-water, pas de re-comptage).
    w.advance("F").advance("F").advance("F").advance("F");
    eq("S7 ré-avance : pas de doublon de tour", w.count("F"), 2);
  }

  var SUITES = [
    suiteTourGlobalDuo,
    suiteNudgesDuoDevant,
    suiteTrio,
    suiteNudgesManuels,
    suiteReculsLourds,
    suiteCasParticuliers,
    suiteTourSticky
  ];

  return { Wheel: Wheel, makeWheel: makeWheel, SUITES: SUITES };
});
