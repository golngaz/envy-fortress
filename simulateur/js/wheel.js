/* =============================================================================
 *  ROUE D'INITIATIVE  —  Système de Vitesse (modèle « un seul tour »)
 * -----------------------------------------------------------------------------
 *  La roue a 6 cases. Chaque pion a une position `pos` dans [0,6) — on NE retient
 *  PAS le nombre de tours d'avance (modèle mono-tour : si un pion en double un
 *  autre puis se fait redoubler, les deux rejouent, sans accumulation).
 *
 *  - La flèche marque « le dernier de la course » = le pion le plus lent
 *    (plus faible casesABS). Elle le suit.
 *  - Doubler = passer la flèche. Chaque passage donne un TOUR BONUS, ajouté à la
 *    TOUTE FIN de la frise de priorité (et non « immédiatement après »).
 *  - L'ordre de base : le plus éloigné de la flèche (vers l'avant) joue en premier.
 * ===========================================================================*/
window.Wheel = (function () {
  const SIZE = 6;

  /** Position visuelle 0..5. */
  function caseOf(p) { return (((p.pos || 0) % SIZE) + SIZE) % SIZE; }

  /** Distance « vers l'avant » de pos par rapport à la flèche F (0..5). */
  function forwardDist(pos, F) { return (((pos - F) % SIZE) + SIZE) % SIZE; }

  /** Nombre de passages de la position F en avançant de `delta` cases depuis oldPos. */
  function crossingsForward(oldPos, delta, F) {
    if (delta <= 0) return 0;
    let first = (((F - oldPos) % SIZE) + SIZE) % SIZE;
    if (first === 0) first = SIZE;                 // pile sur F → tour complet pour la « passer »
    return delta >= first ? 1 + Math.floor((delta - first) / SIZE) : 0;
  }

  /** Nombre de passages de F en reculant de `delta` cases (delta > 0). */
  function crossingsBackward(oldPos, delta, F) {
    if (delta <= 0) return 0;
    let first = (((oldPos - F) % SIZE) + SIZE) % SIZE;
    if (first === 0) first = SIZE;
    return delta >= first ? 1 + Math.floor((delta - first) / SIZE) : 0;
  }

  /** La flèche = le pion le plus lent (casesABS mini). Égalité → garde le courant. */
  function slowest(pawns, currentId) {
    if (!pawns.length) return null;
    let min = Infinity;
    pawns.forEach(p => { const s = p.speed || 0; if (s < min) min = s; });
    const cands = pawns.filter(p => (p.speed || 0) === min).map(p => p.id);
    if (currentId && cands.indexOf(currentId) >= 0) return currentId;
    return cands[0];
  }

  /** Ordre de base (chaque pion une fois) : le plus en avant de la flèche d'abord. */
  function baseOrder(pawns, F) {
    return pawns.slice().sort((a, b) => {
      const da = forwardDist(caseOf(a), F), db = forwardDist(caseOf(b), F);
      if (db !== da) return db - da;                 // plus éloigné de la flèche d'abord
      if ((b.vit || 0) !== (a.vit || 0)) return (b.vit || 0) - (a.vit || 0);
      return (a.isPlayer === b.isPlayer) ? 0 : (a.isPlayer ? -1 : 1); // PJ prioritaires
    });
  }

  return { SIZE, caseOf, forwardDist, crossingsForward, crossingsBackward, slowest, baseOrder };
})();
