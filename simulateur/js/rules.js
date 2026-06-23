/* =============================================================================
 *  MOTEUR DE RÈGLES  —  calculs des statistiques dérivées
 * -----------------------------------------------------------------------------
 *  Source de vérité : campagne/personnages/persos.base
 *
 *    mod(stat)   = floor(stat/6) - 1
 *    PV          = 8 + 4·level + ceil(modCON · level · 1.5)
 *    casesABS    = floor(1 + VIT/3)        (déplacement par tour global)
 *    Tours       = floor(casesABS / 6)
 *    cases       = casesABS % 6
 *    Poids       = 30 + 3·CON + level·10
 *
 *  NB : le doc "Système de Vitesse" mentionne un ancien modèle (+2 bonus) ;
 *  persos.base (les fiches réelles) fait foi — c'est ce qui est implémenté ici.
 * ===========================================================================*/
window.Rules = (function () {
  const STATS = ["CON", "FOR", "VIT", "CTRL", "INT", "VOL"];

  function mod(stat) {
    return Math.floor(stat / 6) - 1;
  }

  function casesABS(vit) {
    return Math.floor(1 + vit / 3);
  }

  /** Calcule toutes les stats dérivées à partir des 6 stats finales + level. */
  function derive(stats, level) {
    const lvl = level || 1;
    const cAbs = Math.max(0, casesABS(stats.VIT));
    const pv = 8 + 4 * lvl + Math.ceil(mod(stats.CON) * lvl * 1.5);
    return {
      mods: {
        CON: mod(stats.CON), FOR: mod(stats.FOR), VIT: mod(stats.VIT),
        CTRL: mod(stats.CTRL), INT: mod(stats.INT), VOL: mod(stats.VOL)
      },
      PV: pv,
      casesABS: cAbs,
      tours: Math.floor(cAbs / 6),
      cases: cAbs % 6,
      poids: 30 + 3 * stats.CON + lvl * 10
    };
  }

  /** Stats finales d'un PJ = base de classe + bonus perso. */
  function statsPersonnage(classe, bonus) {
    const out = {};
    STATS.forEach(s => {
      out[s] = (classe.stats[s] || 0) + (bonus[s] || 0);
    });
    return out;
  }

  /** Formate un modificateur signé : +1, -1, +0. */
  function fmtMod(m) {
    return (m >= 0 ? "+" : "") + m;
  }

  return { STATS, mod, casesABS, derive, statsPersonnage, fmtMod };
})();
