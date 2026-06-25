/* =============================================================================
 *  ROUE D'INITIATIVE  —  moteur (Système de Vitesse)
 * -----------------------------------------------------------------------------
 *  Moteur pur et testable (`Wheel.createEngine()`), validé par
 *  `tests/wheel.test.js`. `store.js` ne fait que le piloter.
 *
 *  MODÈLE (repensé à partir des tests) :
 *
 *  • POSITIONS ABSOLUES — chaque pion a une position entière cumulée `a` ; la
 *    case visible (0..5) = ((a % 6) + 6) % 6. L'absolu sert à COMPTER les tours
 *    (laps) ; l'ORDRE et l'affichage de la flèche raisonnent en cases visibles.
 *
 *  • FLÈCHE — deux quantités complémentaires :
 *      - `farrow` (case 0..5, affichée) = la queue de course. Au tour global :
 *        la case du pion le plus en retard. Un RECUL depuis la case de la flèche
 *        la fait SUIVRE le pion reculé (« la flèche suit le dernier joueur ») ;
 *        sinon elle ne bouge pas vers l'avant tant que sa case reste occupée, et
 *        avance jusqu'au prochain pion si elle se vide.
 *      - `fa` (position ABSOLUE) = la ligne de flèche, prise en MINIMUM courant
 *        sur le tour (elle ne « remonte » jamais avant le prochain tour global).
 *        C'est la référence stable pour compter les tours : un pion lapé qui
 *        ré-avance ne fait pas disparaître les tours déjà gagnés par les autres.
 *
 *  • ORDRE DE BASE (frise), FIGÉ au tour global (et à l'ajout/retrait) : le pion
 *    le plus loin de la flèche (vers l'avant, en cases) joue d'abord ; celui collé
 *    à la flèche joue en dernier. Égalité → VIT la plus haute, puis PJ. Un
 *    déplacement MANUEL (avance/recul) ne réordonne PAS la base.
 *
 *  • CUBES BONUS (rejeux), ajoutés à la FIN de la frise, dans cet ordre :
 *      1. TOURS (laps) : `lap(P) = ⌊(P.a − fa)/6⌋`, comptabilisé en HIGH-WATER
 *         (`_lapHi`, monotone dans le tour). Journalisé au fil de l'eau (`lapLog`)
 *         → ordre CHRONOLOGIQUE ([M1,PJ,M1,PJ] et non [M1,M1,PJ,PJ]). Un tour gagné
 *         NE SE RETIRE JAMAIS : la frise ne fait qu'AJOUTER des cubes (un pion qui
 *         recule ne rend pas son tour ; tout repart au tour global).
 *      2. SOUS-TOURS : un pion qui partait derrière/sur la flèche et l'a dépassée
 *         par l'avant rejoue une fois.
 *      3. RECAPTURES : un pion qui était DEVANT la flèche, repoussé sur/derrière
 *         elle, fait rejouer la flèche.
 *
 *  • MODÈLE « UN SEUL TOUR » : toute la mémoire (high-water, `fa`, `lapLog`) se
 *    remet à zéro au tour global.
 * ===========================================================================*/
(function (root, factory) {
  var W = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = W;
  if (typeof window !== "undefined") window.Wheel = W;
})(this, function () {
  "use strict";

  var SIZE = 6;

  /** Case affichée 0..5 à partir d'une position absolue. */
  function caseAbs(a) { return (((a || 0) % SIZE) + SIZE) % SIZE; }

  /** Accepte un pion (objet avec `.wa` ou `.a`) OU un nombre ; renvoie 0..5. */
  function caseOf(x) {
    if (x == null) return 0;
    if (typeof x === "number") return caseAbs(x);
    if (x.wa != null) return caseAbs(x.wa);
    if (x.a != null) return caseAbs(x.a);
    return caseAbs(x.pos);
  }

  function key(p, q) { return p + " " + q; }

  /* ------------------------------------------------------------------ Moteur */
  function createEngine() {
    var E = {
      pawns: [],        // {id, vit, speed, isPlayer, a}
      frieze: [],       // {id, bonus}
      base: [],         // ordre de base FIGÉ (recalculé au tour global, pas aux nudges)
      turn: 1,
      farrow: 0,        // case de la flèche (0..5, affichée)
      fa: 0,            // ligne de flèche en absolu (minimum courant du tour)
      flecheId: null,   // pion porteur de la flèche (sur `farrow`)
      lapLog: [],       // cubes « tour » dans l'ordre chronologique
      _anchor: {},      // position au début du tour
      _peak: {},        // plus haute position atteinte dans le tour
      _hi: {},          // plus grand écart P.a - Q.a atteint dans le tour (high-water)
      _lapHi: {}        // plus grand nombre de tours atteint dans le tour (high-water) → un tour gagné ne se retire jamais
    };

    function find(id) {
      for (var i = 0; i < E.pawns.length; i++) if (E.pawns[i].id === id) return E.pawns[i];
      return null;
    }
    function onCase(c) { return E.pawns.filter(function (p) { return caseAbs(p.a) === c; }); }

    /* ---- setup ---- */
    function add(id, opts) {
      opts = opts || {};
      var vit = opts.vit || 0;
      E.pawns.push({
        id: id, vit: vit, isPlayer: !!opts.isPlayer,
        speed: opts.speed != null ? opts.speed : (1 + Math.floor(vit / 3)),
        a: 0
      });
      return E;
    }
    /** place sur une case 0..5 (position absolue initiale = la case). */
    function place(id, c) { var p = find(id); if (p) p.a = caseAbs(c); return E; }
    /** flèche initiale : premier pion sur la case `c`. */
    function setArrowCase(c) {
      E.farrow = caseAbs(c);
      var here = onCase(E.farrow);
      E.flecheId = here.length ? here[0].id : null;
      return E;
    }

    /* ---- flèche ---- */
    /** Meilleur pion de queue parmi `cands` : le plus en retard (a min), puis le
     *  plus lent, puis le PNJ. */
    function tailOf(cands) {
      var best = null;
      cands.forEach(function (p) {
        if (!best) { best = p; return; }
        if (p.a !== best.a) { if (p.a < best.a) best = p; return; }
        if ((p.vit || 0) !== (best.vit || 0)) { if ((p.vit || 0) < (best.vit || 0)) best = p; return; }
        if (!p.isPlayer && best.isPlayer) best = p;
      });
      return best;
    }
    /** (Re)calcule la flèche depuis zéro (tour global / départ). */
    function resetArrow() {
      var tail = tailOf(E.pawns);
      E.farrow = tail ? caseAbs(tail.a) : 0;
      E.flecheId = tail ? tail.id : null;
      E.fa = tail ? tail.a : 0;
    }
    /** Maintient `farrow`/`flecheId` après un nudge, et abaisse `fa` si besoin. */
    function settleArrow() {
      if (!E.pawns.length) { E.flecheId = null; return; }
      var guard = 0;
      while (!onCase(E.farrow).length && guard++ < SIZE) E.farrow = caseAbs(E.farrow + 1);
      var cur = E.flecheId != null ? find(E.flecheId) : null;
      if (!cur || caseAbs(cur.a) !== E.farrow) E.flecheId = tailOf(onCase(E.farrow)).id; // sinon hystérésis
      var line = find(E.flecheId).a;
      if (line < E.fa) E.fa = line;        // la ligne de flèche ne remonte pas dans le tour
    }
    function arrowCase() { return E.farrow; }

    /* ---- ordre de base ---- */
    function baseOrder() {
      var F = E.farrow;
      var ps = E.pawns.slice().sort(function (a, b) {
        var da = (caseAbs(a.a) - F + SIZE) % SIZE, db = (caseAbs(b.a) - F + SIZE) % SIZE;
        if (db !== da) return db - da;                       // plus loin de la flèche d'abord
        if ((b.vit || 0) !== (a.vit || 0)) return (b.vit || 0) - (a.vit || 0);
        return (a.isPlayer === b.isPlayer) ? 0 : (a.isPlayer ? -1 : 1);
      });
      return ps.map(function (p) { return p.id; });
    }

    /* ---- mémoire du tour (high-water) ---- */
    function resetRatchet() {
      E._anchor = {}; E._peak = {}; E._hi = {}; E._lapHi = {}; E.lapLog = [];
      E.pawns.forEach(function (p) { E._anchor[p.id] = p.a; E._peak[p.id] = p.a; });
      E.pawns.forEach(function (P) {
        E.pawns.forEach(function (Q) {
          if (P.id !== Q.id) E._hi[key(P.id, Q.id)] = P.a - Q.a;
        });
      });
    }
    function track() {
      E.pawns.forEach(function (P) {
        if (P.a > E._peak[P.id]) E._peak[P.id] = P.a;
        E.pawns.forEach(function (Q) {
          if (P.id === Q.id) return;
          var lead = P.a - Q.a, k = key(P.id, Q.id);
          if (lead > E._hi[k]) E._hi[k] = lead;
        });
      });
    }

    /* ---- comptage des rejeux ---- */
    function anchorLead(P, F) { return E._anchor[P] - E._anchor[F]; }
    /** Sous-tour : P partait derrière/sur la flèche F et l'a dépassée par l'avant. */
    function subCount(P, F) {
      return (anchorLead(P, F) < 0 && E._hi[key(P, F)] >= 1) ? 1 : 0;
    }
    /** Recapture : P était devant F, repoussé sur/derrière elle → F rejoue. */
    function recaptured(P, F) {
      if (find(P).a >= E._peak[P]) return false;            // P n'a pas reculé
      return E._hi[key(P, F)] >= 1 && (find(P).a - find(F).a) <= 0;
    }

    /** Garde la base à jour des ajouts/retraits, SANS la réordonner. */
    function ensureBase() {
      var ids = {}; E.pawns.forEach(function (p) { ids[p.id] = true; });
      E.base = (E.base || []).filter(function (id) { return ids[id]; });
      E.pawns.forEach(function (p) { if (E.base.indexOf(p.id) < 0) E.base.push(p.id); });
    }

    /** Réconcilie `lapLog` avec le nombre de tours de chaque pion. Le comptage est
     *  MONOTONE dans le tour (high-water `_lapHi`) : un tour gagné ne se retire
     *  JAMAIS, même si le pion recule ensuite — la frise ne fait qu'AJOUTER des
     *  cubes (remise à zéro au seul tour global via `resetRatchet`). Les nouveaux
     *  cubes sont ajoutés dans l'ordre de base → chronologiquement au fil des actions. */
    function reconcileLaps(order) {
      var target = {}, counts = {};
      order.forEach(function (id) {
        var live = Math.max(0, Math.floor((find(id).a - E.fa) / SIZE));
        if (E._lapHi[id] == null || live > E._lapHi[id]) E._lapHi[id] = live; // high-water
        target[id] = E._lapHi[id];
        counts[id] = 0;
      });
      E.lapLog.forEach(function (id) { if (counts[id] != null) counts[id]++; });
      // retraits : ne se produisent plus via un nudge (cible monotone) ; conservés
      // pour le retrait d'un pion (syncPawns) et par robustesse.
      order.forEach(function (id) {
        while (counts[id] > target[id]) {
          E.lapLog.splice(E.lapLog.lastIndexOf(id), 1);
          counts[id]--;
        }
      });
      // ajouts (ordre de base)
      order.forEach(function (id) {
        while (counts[id] < target[id]) { E.lapLog.push(id); counts[id]++; }
      });
    }

    function recomputeBonuses() {
      ensureBase();
      var order = E.base.slice();
      reconcileLaps(order);

      var subs = {}, recF = 0, F = E.flecheId;
      order.forEach(function (id) { subs[id] = 0; });
      if (F != null) {
        E.pawns.forEach(function (P) {
          if (P.id === F) return;
          subs[P.id] = subCount(P.id, F);
          if (recaptured(P.id, F)) recF += 1;
        });
      }

      var cubes = E.lapLog.slice();                                   // 1) tours (chronologiques)
      order.forEach(function (id) { for (var i = 0; i < subs[id]; i++) cubes.push(id); }); // 2) sous-tours
      for (var r = 0; r < recF && F != null; r++) cubes.push(F);      // 3) recaptures → la flèche rejoue

      E.frieze = order.map(function (id) { return { id: id, bonus: false }; })
        .concat(cubes.map(function (id) { return { id: id, bonus: true }; }));
    }

    /* ---- opérations ---- */
    function start() { resetRatchet(); resetArrow(); E.base = baseOrder(); recomputeBonuses(); return E; }

    function globalTurn() {
      E.turn += 1;
      resetRatchet();
      E.pawns.forEach(function (p) { p.a += Math.max(0, p.speed || 0); });
      track();
      resetArrow();
      E.base = baseOrder();                 // l'ordre de jeu se (re)fixe au tour global
      recomputeBonuses();
      return E;
    }

    function nudge(id, delta) {
      var p = find(id); if (!p) return E;
      var beforeCase = caseAbs(p.a);
      p.a += delta;
      track();
      if (delta < 0 && beforeCase === E.farrow) E.farrow = caseAbs(p.a); // recul depuis la flèche → elle suit
      settleArrow();
      ensureBase();                          // base FIGÉE : un nudge ne réordonne pas
      recomputeBonuses();
      return E;
    }
    function advance(id) { return nudge(id, +1); }
    function retreat(id) { return nudge(id, -1); }

    /* ---- lecture ---- */
    function caseOfId(id) { var p = find(id); return p ? caseAbs(p.a) : 0; }
    function friezeIds() { return E.frieze.map(function (e) { return e.id; }); }
    function bonuses() { return E.frieze.filter(function (e) { return e.bonus; }); }

    /* ---- (dé)sérialisation pour le Store ---- */
    function serialize() { return JSON.parse(JSON.stringify(E)); }
    function hydrate(data) {
      if (!data) return;
      E.pawns = data.pawns || [];
      E.frieze = data.frieze || [];
      E.base = data.base || [];
      E.turn = data.turn || 1;
      E.farrow = data.farrow || 0;
      E.fa = data.fa || 0;
      E.flecheId = data.flecheId != null ? data.flecheId : null;
      E.lapLog = data.lapLog || [];
      E._anchor = data._anchor || {}; E._peak = data._peak || {}; E._hi = data._hi || {};
      E._lapHi = data._lapHi || {};
    }

    /** Synchronise la liste des pions avec des combattants (ajout/retrait/maj
     *  vitesse), en conservant la position `a` des pions déjà présents. */
    function syncPawns(list) {
      var byId = {}; E.pawns.forEach(function (p) { byId[p.id] = p; });
      var keep = {};
      list.forEach(function (it) {
        keep[it.id] = true;
        var p = byId[it.id];
        if (p) { p.vit = it.vit || 0; p.speed = it.speed; p.isPlayer = !!it.isPlayer; }
        else E.pawns.push({ id: it.id, vit: it.vit || 0, speed: it.speed,
                            isPlayer: !!it.isPlayer, a: it.a != null ? it.a : 0 });
      });
      E.pawns = E.pawns.filter(function (p) { return keep[p.id]; });
      if (E.flecheId != null && !keep[E.flecheId]) E.flecheId = null;
      E.lapLog = (E.lapLog || []).filter(function (id) { return keep[id]; });
      E.frieze = (E.frieze || []).filter(function (e) { return keep[e.id]; });
    }

    return {
      _state: E, add: add, place: place, setArrowCase: setArrowCase,
      start: start, globalTurn: globalTurn, nudge: nudge, advance: advance, retreat: retreat,
      updateArrow: settleArrow, recomputeBonuses: recomputeBonuses,
      baseOrder: baseOrder, arrowCase: arrowCase, caseOfId: caseOfId,
      friezeIds: friezeIds, bonuses: bonuses, find: find,
      serialize: serialize, hydrate: hydrate, syncPawns: syncPawns,
      get frieze() { return E.frieze; },
      get pawns() { return E.pawns; },
      get flecheId() { return E.flecheId; },
      get turn() { return E.turn; }
    };
  }

  return { SIZE: SIZE, caseAbs: caseAbs, caseOf: caseOf, createEngine: createEngine };
});
