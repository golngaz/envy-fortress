/* =============================================================================
 *  STORE  —  état du combat + persistance locale
 * -----------------------------------------------------------------------------
 *  Le simulateur ne décide jamais d'une victoire/défaite : fiche vivante.
 *  Jetons rangés sur une PISTE DE DURÉE (slots 1..MAX_DUR) + zone Permanente.
 * ===========================================================================*/
window.Store = (function () {
  const KEY = "fdle-simu-v1";
  const LIBKEY = "fdle-simu-lib-v1";
  const MAX_DUR = 6;
  let state = { combatants: [], turn: 1, activeIdx: 0, log: [], resolution: null, chooser: null };
  let lib = { items: [] };
  const listeners = [];

  /** Normalise un objet état (champs manquants + migration des combattants). */
  function normalize(s) {
    s.combatants = s.combatants || [];
    s.turn = s.turn || 1;
    if (s.activeIdx == null) s.activeIdx = 0;       // = curseur dans la frise
    s.log = s.log || [];
    if (s.resolution === undefined) s.resolution = null;
    if (s.chooser === undefined) s.chooser = null;
    if (s.flecheId === undefined) s.flecheId = null;
    if (!Array.isArray(s.frieze)) s.frieze = null;
    s.combatants.forEach(migrate);
    if (!s.frieze) rebuildFrieze(s);
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    normalize(state);
    try {
      const r = localStorage.getItem(LIBKEY);
      if (r) lib = JSON.parse(r);
    } catch (e) { /* ignore */ }
    if (!lib.items) lib.items = [];
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
    // position mod-6 (remplace l'ancienne position absolue `abs`)
    if (c.pos == null) c.pos = c.abs != null ? (((c.abs % 6) + 6) % 6) : 0;
    delete c.abs; delete c.bonusReplays;
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
    if (c.pos == null) c.pos = 0;
    if (c.kind === "pj" && !c.loadout) c.loadout = { sorts: [], defense: null, shell: null };
    return c;
  }

  function addCombatant(c) {
    c.id = uid();
    defaults(c);
    state.combatants.push(c);
    rebuildFrieze(state);
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
    if (state.flecheId === id) state.flecheId = null;
    state.frieze = (state.frieze || []).filter(e => e.id !== id);
    if (state.activeIdx >= state.frieze.length) state.activeIdx = Math.max(0, state.frieze.length - 1);
    ensureFleche(state);
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

  /* ----- roue / frise de priorité ----- */
  function computeSpeeds(s) {
    s.combatants.forEach(c => {
      const st = statsOf(c);
      c.speed = Rules.derive(st, c.level || 1).casesABS;
      c.vit = st.VIT;
    });
  }
  function ensureFleche(s) {
    if (!s.combatants.length) { s.flecheId = null; return; }
    s.flecheId = Wheel.slowest(s.combatants, s.flecheId);
  }
  function flechePos(s) {
    s = s || state;
    const f = (s.combatants || []).find(c => c.id === s.flecheId);
    return f ? Wheel.caseOf(f) : 0;
  }

  /** (Re)construit la frise : ordre de base (chacun 1×) + tours bonus à la FIN. */
  function rebuildFrieze(s, doublings) {
    computeSpeeds(s);
    ensureFleche(s);
    const F = flechePos(s);
    const base = Wheel.baseOrder(s.combatants, F);
    const frieze = base.map(c => ({ id: c.id, bonus: false }));
    if (doublings) {
      Object.keys(doublings).forEach(id => {
        for (let i = 0; i < doublings[id]; i++) frieze.push({ id: id, bonus: true });
      });
    }
    s.frieze = frieze;
    s.activeIdx = 0;
  }

  /** Ajoute un tour bonus à la toute fin de la frise du tour courant. */
  function appendBonus(id) {
    if (!state.frieze) state.frieze = [];
    state.frieze.push({ id: id, bonus: true });
  }

  function nextTurn() {
    computeSpeeds(state);
    ensureFleche(state);
    const F0 = flechePos(state);                     // flèche « de départ »
    const doublings = {};
    state.combatants.forEach(c => {
      const oldPos = Wheel.caseOf(c);
      const sp = Math.max(0, c.speed || 0);
      c.pos = (oldPos + sp) % Wheel.SIZE;            // déplacement mod-6 (mono-tour)
      const n = Wheel.crossingsForward(oldPos, sp, F0);
      if (n > 0) doublings[c.id] = (doublings[c.id] || 0) + n;
    });
    rebuildFrieze(state, doublings);
    const nb = Object.values(doublings).reduce((a, b) => a + b, 0);
    if (nb) log(`${nb} tour(s) bonus ajouté(s) en fin de frise (dépassement de flèche).`);
    state.turn += 1;
    save();
  }

  /** Déplacement manuel d'un pion (±1 case). Un dépassement de flèche ajoute un
   *  tour bonus à la fin de la frise. */
  function nudge(id, delta) {
    const c = find(id); if (!c) return;
    const F = flechePos(state);
    const oldPos = Wheel.caseOf(c);
    c.pos = (((oldPos + delta) % Wheel.SIZE) + Wheel.SIZE) % Wheel.SIZE;
    let crossed = 0;
    if (delta > 0) crossed = Wheel.crossingsForward(oldPos, delta, F);
    else if (delta < 0) crossed = Wheel.crossingsBackward(oldPos, -delta, F);
    for (let i = 0; i < crossed; i++) appendBonus(id);
    // ré-ordonne la PARTIE DE BASE de la frise (l'avance change l'ordre), bonus conservés
    reorderBase();
    if (crossed) log(`${c.name} a doublé la flèche : +${crossed} tour bonus (fin de frise).`);
    save();
    return crossed;
  }

  /** Recalcule l'ordre des tours de base (sans bonus) après un déplacement manuel,
   *  en conservant les tours bonus déjà acquis à la fin. */
  function reorderBase() {
    const bonuses = (state.frieze || []).filter(e => e.bonus);
    const F = flechePos(state);
    const base = Wheel.baseOrder(state.combatants, F).map(c => ({ id: c.id, bonus: false }));
    state.frieze = base.concat(bonuses);
    if (state.activeIdx >= state.frieze.length) state.activeIdx = Math.max(0, state.frieze.length - 1);
  }

  function resetWheel() {
    state.combatants.forEach(c => { c.pos = 0; });
    state.flecheId = null;
    state.turn = 1;
    rebuildFrieze(state);
    save();
  }
  function log(msg) {
    state.log.unshift({ t: state.turn, m: msg });
    if (state.log.length > 60) state.log.pop();
    save();
  }
  function clearAll() {
    state = { combatants: [], turn: 1, activeIdx: 0, log: [], resolution: null, chooser: null,
      flecheId: null, frieze: [] };
    save();
  }

  /* ----- bibliothèque (modèles réutilisables) ----- */
  function saveLib() {
    try { localStorage.setItem(LIBKEY, JSON.stringify(lib)); } catch (e) {}
    listeners.forEach(fn => fn(state));
  }
  function getLibrary() { return lib.items; }

  /** Copie « neutre » d'un combattant : identité/équipement conservés,
   *  ressources de combat réinitialisées (PV au max, PA/Shell/jetons à 0). */
  function cleanTemplate(c) {
    const t = JSON.parse(JSON.stringify(c));
    delete t.id; delete t.speed; delete t.vit;
    t.pa = 0; t.shell = 0; t.pos = 0;
    t.tokensTrack = {}; t.tokensPerm = {};
    const d = Rules.derive(statsOf(t), t.level || 1);
    t.pvMax = d.PV; t.pv = d.PV;
    return t;
  }
  function saveToLibrary(id) {
    const c = find(id); if (!c) return;
    lib.items.push(cleanTemplate(c)); saveLib();
  }
  function removeFromLibrary(i) { lib.items.splice(i, 1); saveLib(); }
  function addFromLibrary(i) {
    const t = lib.items[i]; if (!t) return null;
    return addCombatant(JSON.parse(JSON.stringify(t)));
  }

  /** Duplique un combattant présent dans le combat (ressources réinitialisées). */
  function duplicate(id) {
    const c = find(id); if (!c) return null;
    const t = cleanTemplate(c);
    t.name = (c.name || "") + " (copie)";
    return addCombatant(t);
  }

  /* ----- export / import du combat complet ----- */
  function exportJSON() {
    return JSON.stringify({ version: 1, kind: "fdle-combat", state: state }, null, 2);
  }
  function importJSON(text) {
    const obj = JSON.parse(text);
    const s = (obj && obj.state) ? obj.state : obj; // tolère un état brut
    if (!s || !Array.isArray(s.combatants)) throw new Error("Format de combat invalide.");
    state = normalize(s);
    save();
  }

  return {
    MAX_DUR, load, save, subscribe, get, uid,
    statsOf, deriveOf,
    addCombatant, updateCombatant, removeCombatant, find, duplicate,
    addToken, shiftTokens,
    setChooser, clearChooser, setResolution, clearResolution,
    nextTurn, nudge, resetWheel, flechePos, log, clearAll,
    getLibrary, saveToLibrary, removeFromLibrary, addFromLibrary,
    exportJSON, importJSON
  };
})();
