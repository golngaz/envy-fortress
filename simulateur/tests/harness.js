/* =============================================================================
 *  HARNAIS DE TEST minimal — partagé Node + navigateur
 * -----------------------------------------------------------------------------
 *  Pas de dépendance. Une « suite » est une fonction qui reçoit `eq` (une
 *  fonction d'assertion d'égalité) et enregistre des vérifications nommées.
 *
 *    function maSuite(eq) {
 *      eq("nom du test", valeurObtenue, valeurAttendue);
 *    }
 *
 *  `runSuites([...])` exécute les suites et renvoie un résumé exploitable aussi
 *  bien par le runner Node (`tests/run.js`) que par la page `tests/index.html`.
 * ===========================================================================*/
(function (root, factory) {
  "use strict";
  var H = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = H;
  if (typeof window !== "undefined") window.TestHarness = H;
})(this, function () {
  "use strict";

  /** Égalité structurelle simple (suffisante : on ne compare que nombres,
   *  chaînes et tableaux de chaînes). */
  function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /** Exécute les suites et renvoie un résumé { checks, failed, passed, total, text }. */
  function runSuites(suites) {
    var checks = [];
    function eq(name, got, expected) {
      checks.push({ name: name, ok: deepEqual(got, expected), got: got, expected: expected });
    }
    suites.forEach(function (suite) { suite(eq); });

    var failed = checks.filter(function (c) { return !c.ok; });
    return {
      checks: checks,
      failed: failed,
      passed: checks.length - failed.length,
      total: checks.length,
      text: (checks.length - failed.length) + "/" + checks.length + " tests passent."
    };
  }

  return { deepEqual: deepEqual, runSuites: runSuites };
});
