/* =============================================================================
 *  APP  —  interface du simulateur de combat
 * ===========================================================================*/
(function () {
  "use strict";

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const num = (v, f) => { const n = parseInt(v, 10); return isNaN(n) ? f : n; };
  const parsePA = txt => { const m = String(txt == null ? "" : txt).match(/-?\d+/); return m ? Math.max(0, parseInt(m[0], 10)) : 0; };

  let editId = null;        // id du combattant en cours d'édition (modale), sinon null
  let mobAtkRows = [];      // tampon des lignes d'attaque (modale monstre)

  /* ------------------------------------------------------------------ Tabs */
  function initTabs() {
    $$(".tab").forEach(t => t.addEventListener("click", () => {
      $$(".tab").forEach(x => x.classList.remove("active"));
      $$(".view").forEach(v => v.classList.remove("active"));
      t.classList.add("active");
      $("#view-" + t.dataset.view).classList.add("active");
      if (t.dataset.view === "cartes") renderCartes();
    }));
  }

  /* =================================================================== HELPERS */
  function sortById(id) { return (window.DB.sorts || []).find(s => s.id === id); }
  function armeById(id) { return (window.DB.armes || []).find(a => a.id === id); }
  function classeById(id) { return (window.DB.classes || []).find(k => k.id === id); }

  function equippedSorts(c) {
    return ((c.loadout && c.loadout.sorts) || []).map(sortById).filter(Boolean);
  }

  /* =================================================================== COMBAT */
  function statLine(c) {
    const s = Store.statsOf(c), d = Store.deriveOf(c);
    return Rules.STATS.map(k =>
      `<span class="stat-chip" title="${k}"><b>${k}</b> ${s[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`
    ).join("");
  }

  /* ---- piste de jetons (durées) ---- */
  function tokenJetonMeta(id) {
    return (window.DB.jetons || []).find(x => x.id === id) || { icone: "●", nom: id, couleur: "#888" };
  }
  function tokenCellChips(c, where) {
    const bag = where === "P" ? (c.tokensPerm || {}) : ((c.tokensTrack || {})[String(where)] || {});
    const ids = Object.keys(bag);
    if (!ids.length) return "";
    return ids.map(id => {
      const j = tokenJetonMeta(id);
      return `<span class="tok-chip ${j.negatif?'neg':'pos'}" style="--tk:${j.couleur}" title="${esc(j.nom)} — ${esc(j.desc||'')}">
        <button class="tok-dn" data-id="${c.id}" data-jeton="${id}" data-where="${where}">−</button>
        <span class="tok-ico">${j.icone}</span><span class="tok-n">${bag[id]}</span>
        <button class="tok-up" data-id="${c.id}" data-jeton="${id}" data-where="${where}">+</button>
      </span>`;
    }).join("");
  }
  function tokenTrack(c) {
    let cols = `<div class="dur-col perm"><span class="dur-h">P</span><div class="dur-cell">${tokenCellChips(c,"P")}</div></div>`;
    for (let d = 1; d <= Store.MAX_DUR; d++) {
      cols += `<div class="dur-col"><span class="dur-h">${d}</span><div class="dur-cell">${tokenCellChips(c,d)}</div></div>`;
    }
    const jetonOpts = (window.DB.jetons || []).map(j =>
      `<option value="${j.id}">${j.icone} ${esc(j.nom)}</option>`).join("");
    let durOpts = `<option value="P">Perm.</option>`;
    for (let d = 1; d <= Store.MAX_DUR; d++) durOpts += `<option value="${d}"${d===2?' selected':''}>${d} tour(s)</option>`;
    return `
      <div class="cbt-tokens">
        <div class="tok-track-head">
          <span class="tok-label">Jetons par durée</span>
          <button class="tok-shift" data-id="${c.id}" title="Réduire toute la piste d'un tour">⬇️ −1 tour</button>
        </div>
        <div class="dur-track">${cols}</div>
        <div class="tok-addline">
          <select class="tok-sel-jeton" data-id="${c.id}">${jetonOpts}</select>
          <select class="tok-sel-dur" data-id="${c.id}">${durOpts}</select>
          <button class="tok-place" data-id="${c.id}">+ poser</button>
        </div>
      </div>`;
  }

  /* ---- équipement / passif ---- */
  function loadoutSummary(c) {
    if (c.kind === "pj") {
      const s = equippedSorts(c).map(x => esc(x.nom)).join(", ") || "—";
      const def = c.loadout && c.loadout.defense ? (sortById(c.loadout.defense)||{}).nom : null;
      const sh = c.loadout && c.loadout.shell ? (sortById(c.loadout.shell)||{}).nom : null;
      const arme = c.armeId ? (armeById(c.armeId)||{}).nom : null;
      return `<div class="equip-sum">
        <span>🗡️ ${arme?esc(arme):'—'}</span>
        <span>✨ ${s}</span>
        <span>🛡️ ${def?esc(def):'—'}</span>
        <span>🎮 ${sh?esc(sh):'—'}</span></div>`;
    }
    const atk = (c.attaques||[]).map(a => esc(a.nom)).join(", ") || "—";
    return `<div class="equip-sum">
      <span>⚔️ ${atk}</span>
      <span>🛡️ ${c.defense?esc(c.defense.nom):'—'}</span></div>
      ${c.passif?`<div class="mob-passif">★ Passif : ${esc(c.passif)}</div>`:''}`;
  }

  /* ---- panneau de choix d'action (inline) ---- */
  function chooserPanel(c) {
    const ch = Store.get().chooser;
    if (!ch || ch.id !== c.id) return "";
    if (ch.type === "sort") {
      const list = equippedSorts(c);
      if (!list.length) return `<div class="chooser">Aucun sort équipé. <b>⚙ Équipement</b> pour en ajouter.<button class="ch-cancel">✕</button></div>`;
      return `<div class="chooser"><span class="ch-h">Choisir un sort :</span>
        ${list.map(s => `<button class="ch-sort" data-id="${c.id}" data-sort="${s.id}">${esc(s.nom)} <em>${esc(s.pa)} PA</em></button>`).join("")}
        <button class="ch-cancel">✕</button></div>`;
    }
    if (ch.type === "mob-atk") {
      const list = c.attaques || [];
      if (!list.length) return `<div class="chooser">Aucune attaque définie. <b>⚙</b> pour en ajouter.<button class="ch-cancel">✕</button></div>`;
      return `<div class="chooser"><span class="ch-h">Choisir une attaque :</span>
        ${list.map((a,i) => `<button class="ch-mobatk" data-id="${c.id}" data-i="${i}">${esc(a.nom)}</button>`).join("")}
        <button class="ch-dice" data-id="${c.id}" title="Tirage aléatoire">🎲 hasard</button>
        <button class="ch-cancel">✕</button></div>`;
    }
    return "";
  }

  function actionRow(c) {
    if (c.kind === "pj") {
      return `<div class="cbt-actions">
        <button class="act" data-id="${c.id}" data-act="pa1">+1 PA</button>
        <button class="act" data-id="${c.id}" data-act="concentre">🧠 +2</button>
        <button class="act primary-act" data-id="${c.id}" data-act="sort">✨ Sort</button>
        <button class="act" data-id="${c.id}" data-act="attaque">🗡️ Attaquer</button>
        <button class="act" data-id="${c.id}" data-act="defense">🛡️ Défense</button>
        <button class="act" data-id="${c.id}" data-act="shell">🎮 Shell</button>
        <button class="act" data-id="${c.id}" data-act="potion">🧪</button>
      </div>`;
    }
    return `<div class="cbt-actions">
      <button class="act primary-act" data-id="${c.id}" data-act="mob-atk">⚔️ Attaque</button>
      <button class="act" data-id="${c.id}" data-act="mob-def">🛡️ Défense</button>
    </div>`;
  }

  function combatantCard(c, isActive) {
    const d = Store.deriveOf(c);
    const pvPct = Math.max(0, Math.min(100, Math.round(100 * c.pv / Math.max(1, c.pvMax))));
    const low = c.pv <= 0 ? "ko" : (pvPct <= 50 ? "warn" : "");
    const classe = c.kind === "pj" ? classeById(c.classeId) : null;

    return `
    <div class="combatant ${c.kind} ${isActive?'active':''} ${c.pv<=0?'down':''}" data-id="${c.id}">
      <div class="cbt-head">
        <span class="kind-badge ${c.kind}">${c.kind==='pj'?'PJ':'PNJ'}</span>
        <input class="cbt-name" data-id="${c.id}" value="${esc(c.name)}" />
        <span class="cbt-sub">${classe?esc(classe.nom):'Monstre'} · niv ${c.level||1}</span>
        <button class="icon-btn edit" data-id="${c.id}" title="Éditer / équipement">⚙</button>
        <button class="icon-btn del" data-id="${c.id}" title="Retirer">✕</button>
      </div>

      <div class="cbt-stats">${statLine(c)}</div>
      ${loadoutSummary(c)}

      <div class="cbt-resources">
        <div class="res pv ${low}">
          <label>❤️ PV</label>
          <button class="res-dn" data-id="${c.id}" data-res="pv" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="pv" value="${c.pv}" />
          <span class="res-max">/ <input class="res-max-in" data-id="${c.id}" data-res="pvMax" value="${c.pvMax}"/></span>
          <button class="res-up" data-id="${c.id}" data-res="pv" data-d="1">+</button>
          <button class="res-heal" data-id="${c.id}" title="PV au max">⟳</button>
          <div class="pv-bar"><span style="width:${pvPct}%"></span></div>
        </div>
        <div class="res pa">
          <label>⚡ PA</label>
          <button class="res-dn" data-id="${c.id}" data-res="pa" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="pa" value="${c.pa}" />
          <button class="res-up" data-id="${c.id}" data-res="pa" data-d="1">+</button>
        </div>
        <div class="res shell">
          <label>🎮 Shell</label>
          <button class="res-dn" data-id="${c.id}" data-res="shell" data-d="-1">−</button>
          <input class="res-val" data-id="${c.id}" data-res="shell" value="${c.shell}" />
          <span class="res-max">/10</span>
          <button class="res-up" data-id="${c.id}" data-res="shell" data-d="1">+</button>
        </div>
      </div>

      ${tokenTrack(c)}
      ${actionRow(c)}
      ${chooserPanel(c)}
    </div>`;
  }

  /* ------------------------------------------------------------- Résolution */
  function buildCardEl(owner, cardType, ref) {
    if (cardType === "sort" || cardType === "defense" || cardType === "shell") {
      const s = sortById(ref); return s ? Cards.sortCard(s) : msgCard("Aucun sort équipé");
    }
    if (cardType === "arme") { const a = armeById(ref); return a ? Cards.armeCard(a) : msgCard("Aucune arme équipée"); }
    if (cardType === "mob-atk") { const e = (owner.attaques||[])[ref]; return e ? Cards.mobCard(e, "attaque") : msgCard("—"); }
    if (cardType === "mob-def") { return owner.defense ? Cards.mobCard(owner.defense, "defense") : msgCard("Pas de défense"); }
    return msgCard("—");
  }
  function msgCard(txt) {
    const el = document.createElement("div");
    el.className = "carte-msg"; el.textContent = txt; return el;
  }
  function targetDefenseEl(t) {
    if (t.kind === "pj") {
      const id = t.loadout && t.loadout.defense;
      const s = sortById(id);
      return s ? Cards.sortCard(s) : msgCard(esc(t.name) + " : pas de défense équipée");
    }
    return t.defense ? Cards.mobCard(t.defense, "defense") : msgCard(esc(t.name) + " : pas de défense");
  }

  function renderResolution() {
    const zone = $("#reszone");
    const r = Store.get().resolution;
    if (!r) { zone.innerHTML = ""; zone.classList.remove("open"); return; }
    zone.classList.add("open");
    const attacker = Store.find(r.attackerId);
    if (!attacker) { Store.clearResolution(); zone.innerHTML = ""; return; }

    zone.innerHTML = `
      <div class="res-head">
        <span class="res-title">Résolution — <b>${esc(attacker.name)}</b></span>
        <button id="res-clear" class="btn ghost">✕ Effacer</button>
      </div>
      <div class="res-body">
        <div class="res-side attacker"><div class="res-cap">Attaquant · ${esc(attacker.name)}</div><div class="res-slot" id="res-atk-card"></div></div>
        <div class="res-arrow">⚔️ ➜ 🛡️</div>
        <div class="res-side target" id="res-target-side"></div>
      </div>`;

    // carte attaquant
    $("#res-atk-card").appendChild(buildCardEl(attacker, r.cardType, r.cardId));

    const tside = $("#res-target-side");
    if (r.needTarget) {
      tside.innerHTML = `<div class="res-cap">Choisir une cible :</div><div class="target-buttons" id="target-buttons"></div>`;
      const tb = $("#target-buttons");
      Store.get().combatants.forEach(t => {
        if (t.id === attacker.id) return;
        const b = document.createElement("button");
        b.className = "tgt-btn " + t.kind;
        b.textContent = t.name;
        b.dataset.target = t.id;
        tb.appendChild(b);
      });
      const oppSide = attacker.kind === "pj" ? "monstre" : "pj";
      const aoe = document.createElement("button");
      aoe.className = "tgt-btn aoe";
      aoe.textContent = "💥 AOE équipe adverse";
      aoe.dataset.aoe = oppSide;
      tb.appendChild(aoe);
      const none = document.createElement("button");
      none.className = "tgt-btn none"; none.textContent = "Sans cible"; none.dataset.none = "1";
      tb.appendChild(none);
    } else {
      const tgts = (r.targets || []).map(Store.find).filter(Boolean);
      if (!tgts.length) {
        tside.innerHTML = `<div class="res-cap">Aucune cible</div>`;
      } else {
        tside.innerHTML = `<div class="res-cap">${r.aoe?'💥 AOE — ':''}Défense de ${tgts.map(t=>esc(t.name)).join(", ")}</div><div class="res-defs" id="res-defs"></div>`;
        const dd = $("#res-defs");
        tgts.forEach(t => {
          const wrap = document.createElement("div");
          wrap.className = "res-def-item";
          const cap = document.createElement("div");
          cap.className = "res-def-name"; cap.textContent = t.name + (t.kind==='pj'?' (PJ)':' (PNJ)');
          wrap.appendChild(cap);
          wrap.appendChild(targetDefenseEl(t));
          dd.appendChild(wrap);
        });
      }
    }
  }

  /* ------------------------------------------------------------ Roue / SVG */
  function pawnsFromState() {
    return Store.get().combatants.map(c => ({
      ref: c, id: c.id, abs: c.abs || 0,
      isPlayer: c.kind === "pj", vit: Store.statsOf(c).VIT,
      bonusReplays: c.bonusReplays || 0
    }));
  }
  function shortName(name) { return (name || "?").split(/\s+/)[0].slice(0, 8); }

  function renderWheel() {
    const st = Store.get();
    const pawns = pawnsFromState();
    const arrow = Wheel.arrowAbs(pawns);
    const cx = 130, cy = 130, R = 95, n = Wheel.SIZE;
    let cases = "";
    for (let i = 0; i < n; i++) {
      const ang = (-90 + i * 360 / n) * Math.PI / 180;
      const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
      const here = pawns.filter(p => Wheel.caseOf(p) === i);
      const arrowHere = pawns.some(p => Wheel.caseOf(p) === i && (p.abs||0) === arrow);
      cases += `<circle cx="${x}" cy="${y}" r="26" class="wcase ${arrowHere?'arrow':''}"/>`;
      cases += `<text x="${x}" y="${y-30}" class="wnum">${i+1}</text>`;
      let oy = y - 6;
      here.forEach(p => {
        cases += `<text x="${x}" y="${oy}" class="wpawn ${p.isPlayer?'pj':'mob'}">${esc(shortName(p.ref.name))}</text>`;
        oy += 13;
      });
      if (arrowHere) cases += `<text x="${x}" y="${y+34}" class="warrow">▲ flèche</text>`;
    }
    $("#wheel-svg").innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${R}" class="wring"/>${cases}
      <text x="${cx}" y="${cy-6}" class="wcenter">Tour</text>
      <text x="${cx}" y="${cy+16}" class="wcenter big">${st.turn}</text>`;

    const seq = Wheel.order(pawns);
    $("#order-list").innerHTML = seq.map((e, idx) => {
      const active = idx === st.activeIdx;
      const rep = e.total > 1 ? ` <span class="rep">×rejeu ${e.repeat}/${e.total}</span>` : "";
      return `<li class="${active?'active':''} ${e.pawn.isPlayer?'pj':'mob'}" data-idx="${idx}">
        <span class="ord-n">${idx+1}</span> ${esc(e.pawn.ref.name)}${rep}</li>`;
    }).join("") || `<li class="muted">Aucun combattant</li>`;
    $("#turn-num").textContent = st.turn;
  }

  /* ------------------------------------------------------------------ Render */
  function renderCombat() {
    const st = Store.get();
    const seq = Wheel.order(pawnsFromState());
    const activeId = seq[st.activeIdx] ? seq[st.activeIdx].pawn.id : null;
    const wrap = $("#combatants");
    if (!st.combatants.length) {
      wrap.innerHTML = `<div class="empty">Aucun combattant. Ajoutez un PJ ou un monstre ci-dessus.</div>`;
    } else {
      wrap.innerHTML = st.combatants.map(c => combatantCard(c, c.id === activeId)).join("");
    }
    renderResolution();
    renderWheel();
    renderLog();
  }
  function renderLog() {
    const st = Store.get();
    $("#log").innerHTML = st.log.map(l =>
      `<li><span class="log-t">T${l.t}</span> ${esc(l.m)}</li>`).join("") || `<li class="muted">—</li>`;
  }

  /* ---------------------------------------------------------------- Events */
  function clampRes(c, res, val) {
    if (res === "shell") return Math.max(0, Math.min(10, val));
    if (res === "pv") return Math.min(val, c.pvMax);
    return Math.max(0, val);
  }

  function bindCombatEvents() {
    const root = $("#view-combat");

    root.addEventListener("click", e => {
      const t = e.target;
      const id = t.dataset.id;

      if (t.classList.contains("del")) { Store.removeCombatant(id); renderCombat(); return; }
      if (t.classList.contains("edit")) { openEdit(id); return; }

      if (t.classList.contains("res-up") || t.classList.contains("res-dn")) {
        const c = Store.find(id), res = t.dataset.res;
        c[res] = clampRes(c, res, (c[res]||0) + num(t.dataset.d,0)); Store.save(); renderCombat(); return;
      }
      if (t.classList.contains("res-heal")) { const c = Store.find(id); c.pv = c.pvMax; Store.save(); renderCombat(); return; }

      // jetons
      if (t.classList.contains("tok-up")) { Store.addToken(id, t.dataset.jeton, 1, t.dataset.where); renderCombat(); return; }
      if (t.classList.contains("tok-dn")) { Store.addToken(id, t.dataset.jeton, -1, t.dataset.where); renderCombat(); return; }
      if (t.classList.contains("tok-shift")) { Store.shiftTokens(id); Store.log(`${Store.find(id).name} : jetons réduits d'un tour.`); renderCombat(); return; }
      if (t.classList.contains("tok-place")) {
        const card = t.closest(".cbt-tokens");
        const jeton = card.querySelector(".tok-sel-jeton").value;
        const where = card.querySelector(".tok-sel-dur").value;
        Store.addToken(id, jeton, 1, where); renderCombat(); return;
      }

      // actions
      if (t.classList.contains("act")) { handleAction(Store.find(id), t.dataset.act); return; }

      // chooser
      if (t.classList.contains("ch-cancel")) { Store.clearChooser(); renderCombat(); return; }
      if (t.classList.contains("ch-sort")) { castSort(Store.find(t.dataset.id), t.dataset.sort); return; }
      if (t.classList.contains("ch-mobatk")) { mobAttack(Store.find(t.dataset.id), num(t.dataset.i,0)); return; }
      if (t.classList.contains("ch-dice")) {
        const c = Store.find(t.dataset.id); const n = (c.attaques||[]).length;
        if (n) mobAttack(c, Math.floor(Math.random()*n)); return;
      }

      // résolution : cibles
      if (t.id === "res-clear") { Store.clearResolution(); renderCombat(); return; }
      if (t.classList.contains("tgt-btn")) { chooseTarget(t); return; }

      // ordre
      const li = t.closest("#order-list li[data-idx]");
      if (li) { Store.get().activeIdx = num(li.dataset.idx,0); Store.save(); renderCombat(); }
    });

    root.addEventListener("change", e => {
      const t = e.target, id = t.dataset.id;
      if (t.classList.contains("res-val") || t.classList.contains("res-max-in")) {
        const c = Store.find(id), res = t.dataset.res;
        c[res] = clampRes(c, res, num(t.value, c[res]||0));
        if (res === "pvMax" && c.pv > c.pvMax) c.pv = c.pvMax;
        Store.save(); renderCombat();
      }
      if (t.classList.contains("cbt-name")) { const c = Store.find(id); c.name = t.value; Store.save(); }
    });
  }

  function handleAction(c, act) {
    if (!c) return;
    switch (act) {
      case "pa1":       c.pa += 1; Store.log(`${c.name} : +1 PA → ${c.pa}`); Store.save(); renderCombat(); break;
      case "concentre": c.pa += 2; Store.log(`${c.name} se concentre : +2 PA → ${c.pa}`); Store.save(); renderCombat(); break;
      case "potion":    Store.log(`${c.name} utilise une potion.`); Store.save(); renderCombat(); break;
      case "sort":      Store.setChooser(c.id, "sort"); renderCombat(); break;
      case "mob-atk":   Store.setChooser(c.id, "mob-atk"); renderCombat(); break;
      case "attaque":
        if (!c.armeId) { Store.log(`${c.name} n'a pas d'arme équipée (⚙ pour en équiper).`); Store.save(); renderCombat(); break; }
        Store.setResolution({ attackerId: c.id, cardType: "arme", cardId: c.armeId, targets: [], needTarget: true });
        Store.log(`${c.name} attaque à l'arme (${(armeById(c.armeId)||{}).nom||''}).`); renderCombat(); break;
      case "defense":
        if (!c.loadout || !c.loadout.defense) { Store.log(`${c.name} : pas de sort de défense équipé.`); Store.save(); renderCombat(); break; }
        Store.setResolution({ attackerId: c.id, cardType: "defense", cardId: c.loadout.defense, targets: [c.id], needTarget: false });
        renderCombat(); break;
      case "shell":
        if (!c.loadout || !c.loadout.shell) { Store.log(`${c.name} : pas de sort de Shell Control équipé.`); Store.save(); renderCombat(); break; }
        if (c.shell < 10) { Store.log(`${c.name} : Shell Control indisponible (${c.shell}/10).`); Store.save(); renderCombat(); break; }
        c.shell = 0;
        Store.setResolution({ attackerId: c.id, cardType: "shell", cardId: c.loadout.shell, targets: [], needTarget: true });
        Store.log(`${c.name} active Shell Control : ${(sortById(c.loadout.shell)||{}).nom||''} (−10 points).`);
        renderCombat(); break;
      case "mob-def":
        Store.setResolution({ attackerId: c.id, cardType: "mob-def", targets: [c.id], needTarget: false });
        renderCombat(); break;
    }
  }

  function castSort(c, sortId) {
    const s = sortById(sortId); if (!c || !s) return;
    const cost = parsePA(s.pa);
    c.pa = Math.max(0, (c.pa||0) - cost);
    Store.clearChooser();
    Store.setResolution({ attackerId: c.id, cardType: "sort", cardId: sortId, targets: [], needTarget: true });
    Store.log(`${c.name} lance ${s.nom} (−${cost} PA → ${c.pa}).`);
    renderCombat();
  }

  function mobAttack(c, i) {
    if (!c) return;
    const a = (c.attaques||[])[i]; if (!a) return;
    Store.clearChooser();
    Store.setResolution({ attackerId: c.id, cardType: "mob-atk", cardId: i, targets: [], needTarget: true });
    Store.log(`${c.name} prépare : ${a.nom}.`);
    renderCombat();
  }

  function chooseTarget(btn) {
    const r = Store.get().resolution; if (!r) return;
    if (btn.dataset.none) { r.targets = []; r.aoe = false; }
    else if (btn.dataset.aoe) {
      r.targets = Store.get().combatants.filter(c => c.kind === btn.dataset.aoe).map(c => c.id);
      r.aoe = true;
    } else {
      r.targets = [btn.dataset.target]; r.aoe = false;
    }
    r.needTarget = false;
    Store.setResolution(r);
    const names = r.targets.map(id => (Store.find(id)||{}).name).filter(Boolean).join(", ");
    Store.log(`Cible(s) : ${r.aoe?'AOE — ':''}${names||'aucune'}.`);
    renderCombat();
  }

  /* --------------------------------------------------------- Turn controls */
  function bindTurnControls() {
    $("#btn-next-turn").addEventListener("click", () => { Store.nextTurn(); Store.log(`— Tour global ${Store.get().turn} —`); renderCombat(); });
    $("#btn-next-actor").addEventListener("click", () => {
      const st = Store.get(), len = Wheel.order(pawnsFromState()).length;
      if (len) st.activeIdx = (st.activeIdx + 1) % len;
      Store.save(); renderCombat();
    });
    $("#btn-reset-wheel").addEventListener("click", () => {
      if (confirm("Réinitialiser la roue (case 1, tour 1) ? PV/PA/jetons conservés.")) { Store.resetWheel(); renderCombat(); }
    });
    $("#btn-clear").addEventListener("click", () => { if (confirm("Tout effacer ?")) { Store.clearAll(); renderCombat(); } });
    $("#btn-push").addEventListener("click", () => nudgeActive(-num($("#push-n").value,1)));
    $("#btn-pull").addEventListener("click", () => nudgeActive(num($("#push-n").value,1)));
  }
  function nudgeActive(delta) {
    const st = Store.get(), seq = Wheel.order(pawnsFromState()), e = seq[st.activeIdx];
    if (!e) return;
    const c = Store.find(e.pawn.id);
    c.abs = Math.max(0, (c.abs||0) + delta);
    Store.log(`${c.name} ${delta<0?'repoussé':'avancé'} de ${Math.abs(delta)} case(s).`);
    Store.save(); renderCombat();
  }

  /* ============================================================ Modale add/edit */
  function fillSelectClasses() {
    $("#pj-classe").innerHTML = (window.DB.classes||[]).map(k => `<option value="${k.id}">${esc(k.nom)}</option>`).join("");
    $("#pj-arme").innerHTML = `<option value="">— aucune —</option>` +
      (window.DB.armes||[]).map(a => `<option value="${a.id}">${esc(a.nom)}</option>`).join("");
    $("#pj-defense").innerHTML = `<option value="">— aucun —</option>` +
      (window.DB.sorts||[]).filter(s=>s.type==="defense").map(s => `<option value="${s.id}">${esc(s.nom)}</option>`).join("");
    $("#pj-shell").innerHTML = `<option value="">— aucun —</option>` +
      (window.DB.sorts||[]).filter(s=>s.type==="shell").map(s => `<option value="${s.id}">${esc(s.nom)}</option>`).join("");
    $("#pj-sorts").innerHTML = (window.DB.sorts||[])
      .filter(s => ["attaque","soin","utilitaire","passif"].indexOf(s.type) >= 0)
      .map(s => `<label class="spell-check"><input type="checkbox" value="${s.id}"/> <span>${esc(s.nom)} <em>${esc(s.pa)} PA · ${Cards.TYPE_LABEL[s.type]||s.type}</em></span></label>`).join("");
    $("#mob-preset").innerHTML = `<option value="">— vierge —</option>` +
      (window.DB.monstres||[]).map(m => `<option value="${m.id}">${esc(m.nom)}</option>`).join("");
  }

  function bindAddForms() {
    $("#btn-add-pj").addEventListener("click", () => openModal("pj"));
    $("#btn-add-mob").addEventListener("click", () => openModal("mob"));
    $$("[data-close-modal]").forEach(b => b.addEventListener("click", closeModal));
    $("#modal-backdrop").addEventListener("click", e => { if (e.target.id==="modal-backdrop") closeModal(); });

    ["pj-classe","pj-level","pj-con","pj-for","pj-vit","pj-ctrl","pj-int","pj-vol"]
      .forEach(idn => $("#"+idn).addEventListener("input", previewPJ));
    $("#pj-sorts").addEventListener("change", limitSorts);

    $("#mob-preset").addEventListener("change", () => loadPreset($("#mob-preset").value));
    ["mob-level","mob-con","mob-for","mob-vit","mob-ctrl","mob-int","mob-vol"]
      .forEach(idn => $("#"+idn).addEventListener("input", previewMob));
    $("#mob-add-atk").addEventListener("click", () => { mobAtkRows.push({nom:"",de:"",desc:""}); renderMobAtkRows(); });

    $("#form-pj").addEventListener("submit", e => { e.preventDefault(); submitPJ(); });
    $("#form-mob").addEventListener("submit", e => { e.preventDefault(); submitMob(); });
  }

  function limitSorts() {
    const checked = $$("#pj-sorts input:checked");
    if (checked.length > 6) { checked[checked.length-1].checked = false; alert("6 sorts maximum."); }
  }

  function openModal(which, prefill) {
    $("#modal-backdrop").classList.add("open");
    $("#pane-pj").classList.toggle("hidden", which !== "pj");
    $("#pane-mob").classList.toggle("hidden", which !== "mob");
    $("#form-pj").classList.toggle("hidden", which !== "pj");
    $("#form-mob").classList.toggle("hidden", which !== "mob");
    if (which === "pj") { if (!prefill) resetPJForm(); previewPJ(); }
    else { if (!prefill) resetMobForm(); previewMob(); }
  }
  function closeModal() { $("#modal-backdrop").classList.remove("open"); editId = null; $("#modal-title").textContent = ""; }

  function resetPJForm() {
    $("#pj-name").value=""; $("#pj-level").value=1; $("#pj-classe").selectedIndex=0; $("#pj-arme").value="";
    $("#pj-defense").value=""; $("#pj-shell").value="";
    ["con","for","vit","ctrl","int","vol"].forEach(s=>$("#pj-"+s).value=0);
    $$("#pj-sorts input").forEach(i=>i.checked=false);
  }
  function resetMobForm() {
    $("#mob-preset").value=""; $("#mob-name").value=""; $("#mob-level").value=1;
    ["con","for","vit","ctrl","int","vol"].forEach(s=>$("#mob-"+s).value=0);
    $("#mob-passif").value=""; $("#mob-def-nom").value=""; $("#mob-def-de").value=""; $("#mob-def-eff").value="";
    mobAtkRows = []; renderMobAtkRows();
  }

  function loadPreset(id) {
    const m = (window.DB.monstres||[]).find(x => x.id === id); if (!m) return;
    $("#mob-name").value = m.nom; $("#mob-level").value = m.level||1;
    Rules.STATS.forEach(s => $("#mob-"+s.toLowerCase()).value = m.stats[s]||0);
    $("#mob-passif").value = m.passif || "";
    const def = m.defense || {};
    $("#mob-def-nom").value = def.nom||""; $("#mob-def-de").value = def.de||"";
    $("#mob-def-eff").value = def.desc || (def.table ? "(voir fiche wiki)" : "");
    mobAtkRows = (m.attaques||[]).map(a => ({ nom:a.nom||"", de:a.de||"", desc:a.desc||(a.table?"(voir fiche)":""), table:a.table }));
    renderMobAtkRows(); previewMob();
  }

  function renderMobAtkRows() {
    $("#mob-atks").innerHTML = mobAtkRows.map((a,i) => `
      <div class="atk-row" data-i="${i}">
        <input class="atk-nom" data-i="${i}" placeholder="Nom" value="${esc(a.nom)}"/>
        <input class="atk-de" data-i="${i}" placeholder="Dé (1D20…)" value="${esc(a.de)}"/>
        <input class="atk-desc" data-i="${i}" placeholder="Effet" value="${esc(a.desc)}"/>
        <button type="button" class="atk-del" data-i="${i}">✕</button>
      </div>`).join("");
    $$("#mob-atks .atk-del").forEach(b => b.addEventListener("click", () => { mobAtkRows.splice(num(b.dataset.i,0),1); renderMobAtkRows(); }));
    $$("#mob-atks input").forEach(inp => inp.addEventListener("input", () => {
      const i = num(inp.dataset.i,0);
      if (inp.classList.contains("atk-nom")) mobAtkRows[i].nom = inp.value;
      if (inp.classList.contains("atk-de")) mobAtkRows[i].de = inp.value;
      if (inp.classList.contains("atk-desc")) mobAtkRows[i].desc = inp.value;
    }));
  }

  function readPJ() {
    const sorts = $$("#pj-sorts input:checked").map(i => i.value);
    return {
      kind: "pj",
      name: $("#pj-name").value.trim() || "Nouveau PJ",
      classeId: $("#pj-classe").value, level: num($("#pj-level").value,1),
      bonus: { CON:num($("#pj-con").value,0), FOR:num($("#pj-for").value,0), VIT:num($("#pj-vit").value,0),
        CTRL:num($("#pj-ctrl").value,0), INT:num($("#pj-int").value,0), VOL:num($("#pj-vol").value,0) },
      armeId: $("#pj-arme").value || null,
      loadout: { sorts: sorts, defense: $("#pj-defense").value || null, shell: $("#pj-shell").value || null }
    };
  }
  function previewPJ() {
    const c = readPJ(), s = Store.statsOf(c), d = Rules.derive(s, c.level);
    const total = Rules.STATS.reduce((a,k)=>a+(c.bonus[k]||0),0);
    $("#pj-preview").innerHTML = `
      <div class="prev-stats">${Rules.STATS.map(k=>`<span class="stat-chip"><b>${k}</b> ${s[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`).join("")}</div>
      <div class="prev-der">❤️ PV <b>${d.PV}</b> · 🎯 ${d.cases} cases + ${d.tours}t (abs ${d.casesABS}) · ⚖ ${d.poids}</div>
      <div class="prev-note ${total!==12?'warn':''}">Bonus perso : <b>${total}</b> / 12</div>`;
  }

  function readMob() {
    return {
      kind: "monstre",
      name: $("#mob-name").value.trim() || "Monstre",
      level: num($("#mob-level").value,1),
      stats: { CON:num($("#mob-con").value,0), FOR:num($("#mob-for").value,0), VIT:num($("#mob-vit").value,0),
        CTRL:num($("#mob-ctrl").value,0), INT:num($("#mob-int").value,0), VOL:num($("#mob-vol").value,0) },
      passif: $("#mob-passif").value.trim(),
      attaques: mobAtkRows.filter(a => a.nom.trim()).map(a => {
        const o = { nom:a.nom.trim(), de:a.de.trim(), desc:a.desc.trim() };
        if (a.table) o.table = a.table; return o;
      }),
      defense: ($("#mob-def-nom").value.trim() || $("#mob-def-eff").value.trim())
        ? { nom:$("#mob-def-nom").value.trim()||"Défense", de:$("#mob-def-de").value.trim(), desc:$("#mob-def-eff").value.trim() }
        : null
    };
  }
  function previewMob() {
    const c = readMob(), d = Rules.derive(c.stats, c.level);
    $("#mob-preview").innerHTML = `
      <div class="prev-stats">${Rules.STATS.map(k=>`<span class="stat-chip"><b>${k}</b> ${c.stats[k]} <i>(${Rules.fmtMod(d.mods[k])})</i></span>`).join("")}</div>
      <div class="prev-der">❤️ PV <b>${d.PV}</b> · 🎯 ${d.cases} cases + ${d.tours}t (abs ${d.casesABS}) · ⚖ ${d.poids}</div>`;
  }

  function submitPJ() {
    const data = readPJ();
    if (editId) { Store.updateCombatant(editId, data); Store.log(`${data.name} mis à jour.`); }
    else { Store.addCombatant(data); Store.log(`${data.name} rejoint le combat.`); }
    closeModal(); renderCombat();
  }
  function submitMob() {
    const data = readMob();
    if (editId) { Store.updateCombatant(editId, data); Store.log(`${data.name} mis à jour.`); }
    else { Store.addCombatant(data); Store.log(`${data.name} rejoint le combat.`); }
    closeModal(); renderCombat();
  }

  /* ---- édition d'un combattant existant ---- */
  function openEdit(id) {
    const c = Store.find(id); if (!c) return;
    editId = id;
    $("#modal-title").textContent = "Édition";
    if (c.kind === "pj") {
      openModal("pj", true);
      $("#pj-name").value = c.name; $("#pj-level").value = c.level||1;
      $("#pj-classe").value = c.classeId; $("#pj-arme").value = c.armeId||"";
      Rules.STATS.forEach(s => $("#pj-"+s.toLowerCase()).value = (c.bonus||{})[s]||0);
      const lo = c.loadout||{};
      $("#pj-defense").value = lo.defense||""; $("#pj-shell").value = lo.shell||"";
      $$("#pj-sorts input").forEach(i => i.checked = (lo.sorts||[]).indexOf(i.value) >= 0);
      previewPJ();
    } else {
      openModal("mob", true);
      $("#mob-preset").value = "";
      $("#mob-name").value = c.name; $("#mob-level").value = c.level||1;
      Rules.STATS.forEach(s => $("#mob-"+s.toLowerCase()).value = (c.stats||{})[s]||0);
      $("#mob-passif").value = c.passif||"";
      const def = c.defense||{};
      $("#mob-def-nom").value = def.nom||""; $("#mob-def-de").value = def.de||""; $("#mob-def-eff").value = def.desc||"";
      mobAtkRows = (c.attaques||[]).map(a => ({ nom:a.nom||"", de:a.de||"", desc:a.desc||"", table:a.table }));
      renderMobAtkRows(); previewMob();
    }
  }

  /* =================================================================== CARTES */
  function renderCartes() {
    const filter = $("#carte-filter").value, gal = $("#cartes-gallery");
    gal.innerHTML = "";
    if (filter === "all" || filter === "arme") (window.DB.armes||[]).forEach(a => gal.appendChild(Cards.armeCard(a)));
    (window.DB.sorts||[]).forEach(s => { if (filter === "all" || filter === s.type) gal.appendChild(Cards.sortCard(s)); });
  }
  function bindCartes() {
    $("#carte-filter").addEventListener("change", renderCartes);
    $("#btn-print").addEventListener("click", () => window.print());
  }

  /* ------------------------------------------------------------------- Init */
  function init() {
    Store.load();
    initTabs(); fillSelectClasses(); bindAddForms(); bindCombatEvents();
    bindTurnControls(); bindCartes(); renderCombat();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
