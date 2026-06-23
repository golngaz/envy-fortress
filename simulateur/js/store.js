/* =============================================================================
 *  STORE  —  état du combat + persistance locale
 * -----------------------------------------------------------------------------
 *  Le simulateur ne décide jamais d'une victoire/défaite : fiche vivante.
 *  Jetons rangés sur une PISTE DE DURÉE (slots 1..MAX_DUR) + zone Permanente.
 * ===========================================================================*/
window.Store = (function () {
  const KEY = "fdle-simu-v1";
  const MAX_DUR = 6;
  let state = { combatants: [], turn: 1, activeIdx: 0, log: [], resolution: null, chooser: null };
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    state.combatants = state.combatants || [];
    state.turn = state.turn || 1;
    if (state.activeIdx == null) state.activeIdx = 0;
    state.log = state.log || [];
    if (state.resolution === undefined) state.resolution = null;
    if (state.chooser === undefined) state.chooser = null;
    state.combatants.forEach(migrate);
  }

  /** Migration douce des anciens objets combattants. */
  function migrate(c) {
    if (!c.tokensTrack) {
      c.tokensTrack = {};
      // ancien format : c.tokens {jetonId:count} -> durée 1
      if (c.tokens && Object.keys(c.tokens).length) c.tokensTrack["1"] = c.tokens;
    }
    if (!c.tokensPerm) c.tokensPerm = {};
    delete c.tokens;
    if (c.kind === "pj" && !c.loadout) c.loadout = { sorts: [], defense: null, shell: null };
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    listeners.forEach(fn => fn(state));
  }
  function subscribe(fn) { listeners.push(fn); }
  function get() { return state; }
  function uid() { return "c" + Math.random().toString(36).slice(2, 9); }

  /* ----- stats ----- */
  function statsOf(c) {
    if (c.kind === "pj") {
      const classe = (window.DB.classes || []).find(k => k.id === c.classeId)
        || { stats: { CON:0,FOR:0,VIT:0,CTRL:0,INT:0,VOL:0 } };
      return Rules.statsPersonnage(classe, c.bonus || {});
    }
    return c.stats || { CON:0,FOR:0,VIT:0,CTRL:0,INT:0,VOL:0 };
  }
  function deriveOf(c) { return Rules.derive(statsOf(c), c.level || 1); }

  /* ----- ajout / édition / suppression ----- */
  function defaults(c) {
    const d = Rules.derive(statsOf(c), c.level || 1);
    if (c.pvMax == null) c.pvMax = d.PV;
    if (c.pv == null) c.pv = d.PV;
    if (c.pa == null) c.pa = 0;
    if (c.shell == null) c.shell = 0;
    if (!c.tokensTrack) c.tokensTrack = {};
    if (!c.tokensPerm) c.tokensPerm = {};
    if (c.abs == null) c.abs = 0;
    if (c.kind === "pj" && !c.loadout) c.loadout = { sorts: [], defense: null, shell: null };
    return c;
  }

  function addCombatant(c) {
    c.id = uid();
    defaults(c);
    state.combatants.push(c);
    save();
    return c;
  }

  /** Met à jour les champs d'identité/équipement sans toucher PV/PA/jetons. */
  function updateCombatant(id, data) {
    const c = find(id); if (!c) return;
    Object.assign(c, data);
    // recalc PV max si demandé (le combattant n'a pas encore agi)
    save();
  }

  function removeCombatant(id) {
    state.combatants = state.combatants.filter(c => c.id !== id);
    if (state.resolution && (state.resolution.attackerId === id ||
        (state.resolution.targets || []).indexOf(id) >= 0)) state.resolution = null;
    if (state.activeIdx >= state.combatants.length) state.activeIdx = 0;
    save();
  }
  function find(id) { return state.combatants.find(c => c.id === id); }

  /* ----- jetons (piste de durée) ----- */
  function addToken(id, jetonId, delta, where) {
    // where : "P" (permanent) ou un nombre de durée 1..MAX_DUR
    const c = find(id); if (!c) return;
    let bag;
    if (where === "P") bag = c.tokensPerm;
    else {
      const k = String(where);
      if (!c.tokensTrack[k]) c.tokensTrack[k] = {};
      bag = c.tokensTrack[k];
    }
    const jeton = (window.DB.jetons || []).find(j => j.id === jetonId);
    let next = (bag[jetonId] || 0) + delta;
    if (next < 0) next = 0;
    if (jeton && jeton.max != null && next > jeton.max) next = jeton.max;
    if (next === 0) delete bag[jetonId]; else bag[jetonId] = next;
    // nettoie les slots vides
    if (where !== "P" && !Object.keys(c.tokensTrack[String(where)] || {}).length)
      delete c.tokensTrack[String(where)];
    save();
  }

  /** Réduit toute la piste d'un tour (slot d -> d-1 ; slot 1 expire). */
  function shiftTokens(id) {
    const c = find(id); if (!c) return;
    const t = c.tokensTrack || {}, nt = {};
    for (let d = 1; d <= MAX_DUR - 1; d++) {
      if (t[d + 1]) nt[d] = t[d + 1];
    }
    c.tokensTrack = nt; // slot 1 (expiré) supprimé, dernier slot vidé
    save();
  }

  /* ----- résolution / chooser ----- */
  function setChooser(id, type) { state.chooser = id ? { id: id, type: type } : null; save(); }
  function clearChooser() { state.chooser = null; save(); }
  function setResolution(res) { state.resolution = res; save(); }
  function clearResolution() { state.resolution = null; save(); }

  /* ----- tour global ----- */
  function nextTurn() {
    state.combatants.forEach(c => {
      const s = statsOf(c);
      c.speed = Rules.derive(s, c.level || 1).casesABS;
      c.vit = s.VIT;
    });
    // tours bonus = passages de la flèche PENDANT ce tour global uniquement
    const before = Wheel.lapsToArrow(state.combatants);
    Wheel.advance(state.combatants);
    const after = Wheel.lapsToArrow(state.combatants);
    state.combatants.forEach(c => {
      c.bonusReplays = Math.max(0, (after[c.id] || 0) - (before[c.id] || 0));
    });
    state.turn += 1;
    state.activeIdx = 0;
    save();
  }
  function resetWheel() {
    state.combatants.forEach(c => { c.abs = 0; c.bonusReplays = 0; });
    state.turn = 1; state.activeIdx = 0; save();
  }
  function log(msg) {
    state.log.unshift({ t: state.turn, m: msg });
    if (state.log.length > 60) state.log.pop();
    save();
  }
  function clearAll() {
    state = { combatants: [], turn: 1, activeIdx: 0, log: [], resolution: null, chooser: null };
    save();
  }

  return {
    MAX_DUR, load, save, subscribe, get, uid,
    statsOf, deriveOf,
    addCombatant, updateCombatant, removeCombatant, find,
    addToken, shiftTokens,
    setChooser, clearChooser, setResolution, clearResolution,
    nextTurn, resetWheel, log, clearAll
  };
})();
