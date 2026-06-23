/* =============================================================================
 *  ROUE D'INITIATIVE  —  Système de Vitesse
 * -----------------------------------------------------------------------------
 *  La roue a 6 cases. Chaque pion possède une position ABSOLUE cumulée (abs)
 *  et une vitesse de déplacement = casesABS (cases parcourues par tour global).
 *
 *  - La flèche marque le pion le plus en retard (le plus lent) ; elle le suit.
 *    On la modélise par arrowAbs = min(abs).
 *  - Ordre de jeu : le plus éloigné de la flèche (abs - arrowAbs le + grand)
 *    joue en premier. Égalité → VIT la plus élevée, puis priorité aux PJ.
 *  - Rejeu : un pion qui dépasse la flèche d'un tour complet (6 cases) rejoue.
 *    nbActivations = floor((abs - arrowAbs)/6) + 1.
 *
 *  Tout est ajustable manuellement (repousser, déplacer) côté UI : ces
 *  fonctions ne font que recalculer l'ordre à partir des positions courantes.
 * ===========================================================================*/
window.Wheel = (function () {
  const SIZE = 6;

  /** Avance tous les pions de leur vitesse (un tour global). */
  function advance(pawns) {
    pawns.forEach(p => {
      p.abs = (p.abs || 0) + Math.max(0, p.speed || 0);
    });
  }

  function arrowAbs(pawns) {
    if (!pawns.length) return 0;
    return Math.min.apply(null, pawns.map(p => p.abs || 0));
  }

  /** Position visuelle sur la roue (0..5). */
  function caseOf(pawn) {
    return ((pawn.abs || 0) % SIZE + SIZE) % SIZE;
  }

  /** Nombre de tours bonus gagnés en passant la flèche PENDANT un tour global.
   *  Les tours bonus sont propres au tour global courant (`pawn.bonusReplays`),
   *  recalculés par Store.nextTurn — ils disparaissent au tour global suivant. */
  function activations(pawn) {
    return 1 + Math.max(0, pawn.bonusReplays || 0);
  }

  /**
   * Renvoie la liste ordonnée des activations du tour :
   * [{ pawn, repeat, total }] — repeat = n° d'activation (1, 2, …) pour les rejeux.
   */
  function order(pawns) {
    const arrow = arrowAbs(pawns);
    // Tri principal : distance à la flèche décroissante.
    const sorted = pawns.slice().sort((a, b) => {
      const da = (a.abs || 0) - arrow;
      const db = (b.abs || 0) - arrow;
      if (db !== da) return db - da;
      if ((b.vit || 0) !== (a.vit || 0)) return (b.vit || 0) - (a.vit || 0);
      // priorité aux PJ
      return (a.isPlayer === b.isPlayer) ? 0 : (a.isPlayer ? -1 : 1);
    });

    const seq = [];
    sorted.forEach(p => {
      const n = activations(p);
      for (let i = 1; i <= n; i++) seq.push({ pawn: p, repeat: i, total: n });
    });
    return seq;
  }

  /** Nombre de tours bonus pour ce tour global, pour chaque pion :
   *  (laps après déplacement) − (laps avant déplacement), relatif à la flèche.
   *  À appeler AVANT puis APRÈS Wheel.advance via beforeLaps()/afterLaps(). */
  function lapsToArrow(pawns) {
    const arrow = arrowAbs(pawns);
    const out = {};
    pawns.forEach(p => { out[p.id] = Math.floor(((p.abs || 0) - arrow) / SIZE); });
    return out;
  }

  return { SIZE, advance, arrowAbs, caseOf, activations, lapsToArrow, order };
})();
