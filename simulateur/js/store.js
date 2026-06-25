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
    if (s.wheel === undefined) s.wheel = null;
    if (!Array.isArray(s.frieze)) s.frieze = null;
    s.combatants.forEach(migrate);
    if (!s.frieze || !s.wheel) refreshWheel(s);
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
    // position absolue cumulée `wa` (remplace les anciens `pos` mod-6 / `abs`)
    if (c.wa == null) c.wa = (c.pos != null ? c.pos : (c.abs != null ? c.abs : 0));
    delete c.abs; delete c.bonusReplays; delete c.pos;
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
    if (c.wa == null) c.wa = 0;
    if (c.kind === "pj" && !c.loadout) c.loadout = { sorts: [], defense: null, shell: null };
    return c;
  }

  function addCombatant(c) {
    c.id = uid();
    defaults(c);
    state.combatants.push(c);
    refreshWheel(state);
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
    refreshWheel(state);
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

  /* ----- roue / frise de priorité (délègue à js/wheel.js) ----- */
  let _engine = null;
  function engine() { if (!_engine) _engine = Wheel.createEngine(); return _engine; }

  function computeSpeeds(s) {
    s.combatants.forEach(c => {
      const st = statsOf(c);
      c.speed = Rules.derive(st, c.level || 1).casesABS;
      c.vit = st.VIT;
    });
  }

  /** Liste de pions pour le moteur (positions absolues `wa`). */
  function pawnList(s) {
    computeSpeeds(s);
    return s.combatants.map(c => ({
      id: c.id, speed: c.speed, vit: c.vit,
      isPlayer: c.kind === "pj", a: c.wa != null ? c.wa : 0
    }));
  }

  /** Réhydrate le moteur depuis l'état puis synchronise la liste des pions. */
  function syncEngine(s) {
    const e = engine();
    if (s.wheel) e.hydrate(s.wheel);
    else { e._state.pawns = []; e._state.frieze = []; e._state.flecheId = null; }
    e.syncPawns(pawnList(s));
    return e;
  }

  /** Recopie l'état du moteur vers le Store (positions, frise, flèche, tour). */
  function pullEngine(s) {
    const e = engine();
    e.pawns.forEach(p => { const c = (s.combatants || []).find(x => x.id === p.id); if (c) c.wa = p.a; });
    s.frieze = e.frieze.map(x => ({ id: x.id, bonus: x.bonus }));
    s.flecheId = e.flecheId;
    s.turn = e.turn;
    s.wheel = e.serialize();
    if (s.activeIdx == null) s.activeIdx = 0;
    if (s.activeIdx >= s.frieze.length) s.activeIdx = Math.max(0, s.frieze.length - 1);
  }

  /** Recalcule flèche + frise sans déplacement (ajout/retrait/équipement). */
  function refreshWheel(s) {
    const e = syncEngine(s);
    e._state.turn = s.turn || e.turn || 1;
    e.start();
    pullEngine(s);
  }

  function flechePos(s) {
    s = s || state;
    const c = (s.combatants || []).find(x => x.id === s.flecheId);
    return c ? Wheel.caseOf(c) : 0;
  }

  function nextTurn() {
    const e = syncEngine(state);
    e._state.turn = state.turn || 1;
    e.globalTurn();
    const nb = e.bonuses().length;
    pullEngine(state);
    state.activeIdx = 0;                 // nouveau tour → curseur en tête de frise
    if (nb) log(`${nb} tour(s) bonus en fin de frise (dépassement de flèche).`);
    save();
  }

  /** Déplacement manuel d'un pion (±1 case) : avance / repousse sur la roue. */
  function nudge(id, delta) {
    const c = find(id); if (!c) return;
    const e = syncEngine(state);
    const before = e.bonuses().length;
    e.nudge(id, delta);
    const crossed = Math.max(0, e.bonuses().length - before);
    pullEngine(state);
    if (crossed) log(`${c.name} a doublé la flèche : +${crossed} tour bonus (fin de frise).`);
    save();
    return crossed;
  }

  function resetWheel() {
    const e = syncEngine(state);
    e.pawns.forEach(p => { p.a = 0; });
    e._state.flecheId = null;
    e._state.turn = 1;
    e.start();
    state.turn = 1;
    pullEngine(state);
    state.activeIdx = 0;
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
    t.pa = 0; t.shell = 0; t.wa = 0;
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
