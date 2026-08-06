/* =============================================================================
 *  OUTILS  —  onglet « Outils » : menu latéral + outils utilitaires du MJ
 *
 *  Chaque outil du registre OUTILS fournit :
 *    - id / nom (entrée du menu latéral) et titre (en-tête du panneau) ;
 *    - rendu(conteneur) : construit l'outil dans le conteneur donné.
 *
 *  Premier outil : le calculateur de jets de dés. On compose une combinaison
 *  (nombre de dés par type + bonus fixe) et l'outil calcule la distribution
 *  EXACTE des totaux (par convolution), l'espérance, l'écart-type, la courbe,
 *  et les probabilités « exactement » / « au moins » de chaque résultat —
 *  pratique pour jauger un DD. Aucune dépendance externe : le graphique est
 *  un SVG généré à la main.
 * ===========================================================================*/
(function () {
  "use strict";

  const $ = selecteur => document.querySelector(selecteur);

  /* ================================================================ REGISTRE */

  const OUTILS = [
    {
      id: "jets-de-des",
      nom: "🎲 Jets de dés",
      titre: "🎲 Calculateur de jets de dés",
      rendu: rendreCalculateurDeDes,
    },
    // Ajouter un outil : pousser une entrée ici, le menu se construit tout seul.
  ];

  let outilActifId = OUTILS[0].id;

  function initOutils() {
    const menu = $("#outils-menu-liste");

    menu.innerHTML = OUTILS.map(outil =>
      `<button type="button" class="outil-item" data-outil="${outil.id}">${outil.nom}</button>`
    ).join("");

    menu.addEventListener("click", evenement => {
      const bouton = evenement.target.closest("[data-outil]");

      if (!bouton) return;

      outilActifId = bouton.dataset.outil;
      afficherOutilActif();
    });

    afficherOutilActif();
  }

  function afficherOutilActif() {
    const conteneur = $("#outil-contenu");
    const outil = OUTILS.find(candidat => candidat.id === outilActifId);

    document.querySelectorAll("#outils-menu-liste .outil-item").forEach(bouton => {
      bouton.classList.toggle("active", bouton.dataset.outil === outilActifId);
    });

    conteneur.innerHTML = `<h2>${outil.titre}</h2>`;
    outil.rendu(conteneur);
  }

  /* ================================================= CALCUL — DISTRIBUTIONS */
  /*  Une distribution = { minimum, probabilites } où probabilites[k] est la
   *  probabilité d'obtenir le total (minimum + k). Fonctions pures, exposées
   *  en fin de fichier pour la console et les tests Node.                    */

  function distributionConstante(valeur) {
    return { minimum: valeur, probabilites: [1] };
  }

  function distributionDUnDe(faces) {
    const probabilites = new Array(faces).fill(1 / faces);
    return { minimum: 1, probabilites };
  }

  function convoluer(distributionA, distributionB) {
    const taille = distributionA.probabilites.length + distributionB.probabilites.length - 1;
    const probabilites = new Array(taille).fill(0);

    for (let indexA = 0; indexA < distributionA.probabilites.length; indexA++) {
      for (let indexB = 0; indexB < distributionB.probabilites.length; indexB++) {
        probabilites[indexA + indexB] += distributionA.probabilites[indexA] * distributionB.probabilites[indexB];
      }
    }

    return { minimum: distributionA.minimum + distributionB.minimum, probabilites };
  }

  /** nombreParType = { "6": 2, "10": 1, … } (clé = nombre de faces) */
  function calculerDistribution(nombreParType, modificateur) {
    let distribution = distributionConstante(modificateur);

    Object.keys(nombreParType).forEach(faces => {
      const nombre = nombreParType[faces];

      for (let compteur = 0; compteur < nombre; compteur++) {
        distribution = convoluer(distribution, distributionDUnDe(parseInt(faces, 10)));
      }
    });

    return distribution;
  }

  function calculerStatistiques(distribution) {
    let esperance = 0;
    let carreMoyen = 0;

    distribution.probabilites.forEach((probabilite, index) => {
      const total = distribution.minimum + index;
      esperance += probabilite * total;
      carreMoyen += probabilite * total * total;
    });

    const variance = Math.max(0, carreMoyen - esperance * esperance);

    return {
      esperance,
      ecartType: Math.sqrt(variance),
      minimum: distribution.minimum,
      maximum: distribution.minimum + distribution.probabilites.length - 1,
    };
  }

  /** chance d'atteindre au moins le palier donné (1 sous le minimum, 0 au-delà du maximum) */
  function chanceDAtteindre(distribution, auMoins, palier) {
    if (palier <= distribution.minimum) {
      return 1;
    }

    const index = palier - distribution.minimum;

    if (index >= auMoins.length) {
      return 0;
    }

    return auMoins[index];
  }

  /** probabilités cumulées « au moins ce total » : auMoins[k] = P(total ≥ minimum + k) */
  function calculerAuMoins(distribution) {
    const auMoins = new Array(distribution.probabilites.length).fill(0);
    let cumul = 0;

    for (let index = distribution.probabilites.length - 1; index >= 0; index--) {
      cumul += distribution.probabilites[index];
      auMoins[index] = Math.min(1, cumul);
    }

    return auMoins;
  }

  /* ========================================================= FORMATAGE (fr) */

  function formaterDecimal(valeur, nombreDecimales) {
    return valeur.toFixed(nombreDecimales).replace(".", ",");
  }

  function formaterPourcent(probabilite) {
    const valeur = probabilite * 100;

    if (valeur > 0 && valeur < 0.01) {
      return "< 0,01 %";
    }

    if (valeur < 1) {
      return formaterDecimal(valeur, 2) + " %";
    }

    return formaterDecimal(valeur, 1) + " %";
  }

  /* ================================================ OUTIL — JETS DE DÉS (UI) */

  /** types de dés proposés (nombre de faces) */
  const TYPES_DE_DES = [2, 4, 6, 8, 10, 12, 20, 100];

  /** garde-fou : au-delà, le calcul et l'affichage deviennent inutilement lourds */
  const MAX_DES_AU_TOTAL = 30;

  /** état courant : la combinaison choisie + le palier à atteindre (null = aucun) */
  const combinaison = { nombreParType: {}, modificateur: 0, palier: null };

  TYPES_DE_DES.forEach(faces => { combinaison.nombreParType[faces] = 0; });

  function nombreTotalDeDes() {
    return TYPES_DE_DES.reduce((somme, faces) => somme + combinaison.nombreParType[faces], 0);
  }

  function texteFormule() {
    const morceaux = [];

    TYPES_DE_DES.forEach(faces => {
      const nombre = combinaison.nombreParType[faces];

      if (nombre > 0) {
        morceaux.push(nombre + "D" + faces);
      }
    });

    let formule = morceaux.join(" + ");

    if (combinaison.modificateur !== 0) {
      const signe = combinaison.modificateur > 0 ? "+" : "−";
      const valeurAbsolue = Math.abs(combinaison.modificateur);

      if (formule === "") {
        formule = String(combinaison.modificateur);
      } else {
        formule += " " + signe + " " + valeurAbsolue;
      }
    }

    return formule;
  }

  function rendreCalculateurDeDes(conteneur) {
    const bloc = document.createElement("div");
    bloc.className = "jd";
    bloc.innerHTML = `
      <p class="hint">Compose une combinaison de dés : l'outil calcule la distribution
        <b>exacte</b> des totaux — espérance, courbe, et probabilité d'obtenir
        <b>exactement</b> ou <b>au moins</b> chaque résultat (pratique pour jauger un
        <b>DD</b>). Aucun dé n'est lancé.</p>
      <div id="jd-controles" class="jd-controles"></div>
      <div id="jd-resultats"></div>`;
    conteneur.appendChild(bloc);

    rendreControles();
    rendreResultats();
  }

  /* ---------------------------------------------------------- contrôles */

  function rendreControles() {
    const zone = $("#jd-controles");

    const steppersDes = TYPES_DE_DES.map(faces => `
      <div class="jd-stepper">
        <span class="jd-de-nom">D${faces}</span>
        <button type="button" class="jd-btn" data-faces="${faces}" data-delta="-1">−</button>
        <b data-compte="${faces}">${combinaison.nombreParType[faces]}</b>
        <button type="button" class="jd-btn" data-faces="${faces}" data-delta="1">+</button>
      </div>`).join("");

    zone.innerHTML = `
      <div class="jd-steppers">${steppersDes}
        <div class="jd-stepper jd-stepper-mod">
          <span class="jd-de-nom">Bonus</span>
          <button type="button" class="jd-btn" data-mod="-1">−</button>
          <b data-compte="mod">${combinaison.modificateur}</b>
          <button type="button" class="jd-btn" data-mod="1">+</button>
        </div>
        <div class="jd-stepper jd-stepper-palier" title="Chance d'atteindre au moins ce total (ex. un DD)">
          <span class="jd-de-nom">Palier</span>
          <input type="number" id="jd-palier" class="jd-palier-input" placeholder="—"/>
        </div>
        <button type="button" id="jd-reset" class="btn ghost">⟲ Réinitialiser</button>
      </div>`;

    zone.addEventListener("click", surClicControles);
    zone.addEventListener("input", surSaisiePalier);
  }

  function surSaisiePalier(evenement) {
    if (evenement.target.id !== "jd-palier") return;

    const valeur = parseInt(evenement.target.value, 10);
    combinaison.palier = isNaN(valeur) ? null : valeur;
    rendreResultats();
  }

  function surClicControles(evenement) {
    const bouton = evenement.target.closest("button");

    if (!bouton) return;

    if (bouton.id === "jd-reset") {
      TYPES_DE_DES.forEach(faces => { combinaison.nombreParType[faces] = 0; });
      combinaison.modificateur = 0;
      combinaison.palier = null;
      $("#jd-palier").value = "";
    }

    if (bouton.dataset.faces) {
      const faces = parseInt(bouton.dataset.faces, 10);
      const delta = parseInt(bouton.dataset.delta, 10);
      const nouveauNombre = combinaison.nombreParType[faces] + delta;
      const nouveauTotal = nombreTotalDeDes() + delta;

      if (nouveauNombre >= 0 && nouveauTotal <= MAX_DES_AU_TOTAL) {
        combinaison.nombreParType[faces] = nouveauNombre;
      }
    }

    if (bouton.dataset.mod) {
      const delta = parseInt(bouton.dataset.mod, 10);
      combinaison.modificateur = Math.max(-99, Math.min(99, combinaison.modificateur + delta));
    }

    mettreAJourCompteurs();
    rendreResultats();
  }

  function mettreAJourCompteurs() {
    TYPES_DE_DES.forEach(faces => {
      $(`[data-compte="${faces}"]`).textContent = combinaison.nombreParType[faces];
    });

    $(`[data-compte="mod"]`).textContent = combinaison.modificateur;
  }

  /* ---------------------------------------------------------- résultats */

  function rendreResultats() {
    const zone = $("#jd-resultats");

    if (nombreTotalDeDes() === 0) {
      zone.innerHTML = `<p class="hint">Ajoute au moins un dé pour lancer le calcul.</p>`;
      return;
    }

    const distribution = calculerDistribution(combinaison.nombreParType, combinaison.modificateur);
    const statistiques = calculerStatistiques(distribution);
    const auMoins = calculerAuMoins(distribution);

    let tuilePalier = "";

    if (combinaison.palier != null) {
      const chance = chanceDAtteindre(distribution, auMoins, combinaison.palier);
      tuilePalier = `
        <div class="jd-tuile jd-tuile-palier">
          <div class="jd-tuile-label">Atteindre ≥ ${combinaison.palier}</div>
          <div class="jd-tuile-valeur">${formaterPourcent(chance)}</div>
        </div>`;
    }

    zone.innerHTML = `
      <div class="jd-formule">${texteFormule()}</div>
      <div class="jd-tuiles">
        <div class="jd-tuile">
          <div class="jd-tuile-label">Espérance</div>
          <div class="jd-tuile-valeur">${formaterDecimal(statistiques.esperance, 2)}</div>
        </div>
        <div class="jd-tuile">
          <div class="jd-tuile-label">Écart-type</div>
          <div class="jd-tuile-valeur">${formaterDecimal(statistiques.ecartType, 2)}</div>
        </div>
        <div class="jd-tuile">
          <div class="jd-tuile-label">Étendue</div>
          <div class="jd-tuile-valeur">${statistiques.minimum} – ${statistiques.maximum}</div>
        </div>${tuilePalier}
      </div>
      <div class="jd-chart-wrap" id="jd-chart-wrap">
        ${construireGraphique(distribution, statistiques, combinaison.palier)}
        <div class="jd-tooltip" id="jd-tooltip"></div>
      </div>
      ${construireTableau(distribution, auMoins)}`;

    brancherSurvol(distribution, auMoins);
  }

  /* ---------------------------------------------------------- graphique */

  /** géométrie fixe du SVG (le viewBox s'adapte ensuite à la largeur réelle) */
  const GRAPHIQUE = { largeur: 720, hauteur: 250, gauche: 46, droite: 14, haut: 34, bas: 26 };

  /** au-delà de ce nombre de totaux possibles, les barres deviennent une courbe */
  const SEUIL_COURBE = 120;

  /** géométrie du dernier rendu, mémorisée pour le survol */
  let geometrie = null;

  function arrondir(valeur) {
    return Math.round(valeur * 100) / 100;
  }

  /** pas de la grille horizontale : au plus 5 graduations « rondes » */
  function pasDeGrille(probabiliteMax) {
    const candidats = [0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5];
    const pasTrouve = candidats.find(pas => probabiliteMax / pas <= 5);
    return pasTrouve || 0.5;
  }

  function etiquetteDeGraduation(probabilite) {
    const valeur = Math.round(probabilite * 1000) / 10;
    return String(valeur).replace(".", ",") + " %";
  }

  /** barre fine : extrémité haute arrondie (4 px), base carrée sur l'axe */
  function cheminBarre(x, yHaut, largeur, yBas) {
    const rayon = Math.min(4, largeur / 2, Math.max(0, yBas - yHaut));
    return "M " + arrondir(x) + " " + arrondir(yBas)
      + " L " + arrondir(x) + " " + arrondir(yHaut + rayon)
      + " Q " + arrondir(x) + " " + arrondir(yHaut) + " " + arrondir(x + rayon) + " " + arrondir(yHaut)
      + " L " + arrondir(x + largeur - rayon) + " " + arrondir(yHaut)
      + " Q " + arrondir(x + largeur) + " " + arrondir(yHaut) + " " + arrondir(x + largeur) + " " + arrondir(yHaut + rayon)
      + " L " + arrondir(x + largeur) + " " + arrondir(yBas) + " Z";
  }

  /** ancrage d'un texte selon sa proximité des bords du tracé */
  function ancragePourX(x) {
    if (x < GRAPHIQUE.gauche + 34) {
      return "start";
    }

    if (x > GRAPHIQUE.largeur - GRAPHIQUE.droite - 34) {
      return "end";
    }

    return "middle";
  }

  function construireGraphique(distribution, statistiques, palier) {
    const nombreDeTotaux = distribution.probabilites.length;
    const zoneLargeur = GRAPHIQUE.largeur - GRAPHIQUE.gauche - GRAPHIQUE.droite;
    const zoneHauteur = GRAPHIQUE.hauteur - GRAPHIQUE.haut - GRAPHIQUE.bas;
    const yBase = GRAPHIQUE.haut + zoneHauteur;
    const largeurBande = zoneLargeur / nombreDeTotaux;
    const modeBarres = nombreDeTotaux <= SEUIL_COURBE;
    const probabiliteMax = Math.max(...distribution.probabilites);
    const pas = pasDeGrille(probabiliteMax);
    const plafond = pas * Math.ceil(probabiliteMax / pas - 1e-9);

    geometrie = { largeurBande, modeBarres, nombreDeTotaux };

    const versY = probabilite => yBase - (probabilite / plafond) * zoneHauteur;
    const centreDeBande = index => GRAPHIQUE.gauche + (index + 0.5) * largeurBande;

    const morceaux = [];

    // grille horizontale + graduations de l'axe Y (en %)
    for (let niveau = 0; niveau * pas <= plafond + 1e-9; niveau++) {
      const y = arrondir(versY(niveau * pas));
      morceaux.push(`<line class="jd-grille" x1="${GRAPHIQUE.gauche}" x2="${GRAPHIQUE.gauche + zoneLargeur}" y1="${y}" y2="${y}"/>`);
      morceaux.push(`<text class="jd-axe" x="${GRAPHIQUE.gauche - 6}" y="${y + 3}" text-anchor="end">${etiquetteDeGraduation(niveau * pas)}</text>`);
    }

    // marques : barres fines (peu de totaux) ou courbe + aire (beaucoup)
    if (modeBarres) {
      const epaisseur = Math.max(1, Math.min(24, largeurBande - 2));

      distribution.probabilites.forEach((probabilite, index) => {
        const xBarre = GRAPHIQUE.gauche + index * largeurBande + (largeurBande - epaisseur) / 2;
        morceaux.push(`<path class="jd-barre" data-barre="${index}" d="${cheminBarre(xBarre, versY(probabilite), epaisseur, yBase)}"/>`);
      });
    } else {
      const points = distribution.probabilites.map((probabilite, index) =>
        arrondir(centreDeBande(index)) + " " + arrondir(versY(probabilite))
      ).join(" L ");
      morceaux.push(`<path class="jd-aire" d="M ${arrondir(centreDeBande(0))} ${yBase} L ${points} L ${arrondir(centreDeBande(nombreDeTotaux - 1))} ${yBase} Z"/>`);
      morceaux.push(`<path class="jd-courbe" d="M ${points}"/>`);
      morceaux.push(`<line id="jd-viseur" class="jd-viseur" y1="${GRAPHIQUE.haut}" y2="${yBase}" style="display:none"/>`);
    }

    // graduations de l'axe X (les totaux possibles)
    let pasDesTotaux = 1;

    if (modeBarres && nombreDeTotaux > 24) {
      pasDesTotaux = Math.ceil(nombreDeTotaux / 12);
    }

    if (!modeBarres) {
      pasDesTotaux = Math.ceil(nombreDeTotaux / 10);
    }

    for (let index = 0; index < nombreDeTotaux; index += pasDesTotaux) {
      morceaux.push(`<text class="jd-axe" x="${arrondir(centreDeBande(index))}" y="${yBase + 15}" text-anchor="middle">${distribution.minimum + index}</text>`);
    }

    const dernierIndex = nombreDeTotaux - 1;
    const dernierAffiche = Math.floor(dernierIndex / pasDesTotaux) * pasDesTotaux;

    if (dernierIndex !== dernierAffiche && dernierIndex - dernierAffiche >= pasDesTotaux / 2) {
      morceaux.push(`<text class="jd-axe" x="${arrondir(centreDeBande(dernierIndex))}" y="${yBase + 15}" text-anchor="middle">${distribution.minimum + dernierIndex}</text>`);
    }

    // ligne de repère : le palier à atteindre (bord gauche de sa bande = frontière du « au moins »)
    const palierVisible = palier != null && palier >= distribution.minimum && palier <= statistiques.maximum;

    if (palierVisible) {
      const xPalier = arrondir(GRAPHIQUE.gauche + (palier - distribution.minimum) * largeurBande);
      morceaux.push(`<line class="jd-palier-ligne" x1="${xPalier}" x2="${xPalier}" y1="28" y2="${yBase}"/>`);
      morceaux.push(`<text class="jd-palier-txt" x="${xPalier}" y="25" text-anchor="${ancragePourX(xPalier)}">palier ${palier}</text>`);
    }

    // ligne de repère : l'espérance
    const xEsperance = arrondir(GRAPHIQUE.gauche + (statistiques.esperance - distribution.minimum + 0.5) * largeurBande);
    morceaux.push(`<line class="jd-esperance" x1="${xEsperance}" x2="${xEsperance}" y1="18" y2="${yBase}"/>`);
    morceaux.push(`<text class="jd-esperance-txt" x="${xEsperance}" y="12" text-anchor="${ancragePourX(xEsperance)}">espérance ${formaterDecimal(statistiques.esperance, 2)}</text>`);

    // étiquette directe sur le pic (le total le plus probable), dessinée en dernier
    // pour rester lisible même si la ligne d'espérance passe au même endroit
    const indexDuPic = distribution.probabilites.indexOf(probabiliteMax);
    const xPic = arrondir(centreDeBande(indexDuPic));
    morceaux.push(`<text class="jd-pic" x="${xPic}" y="${arrondir(versY(probabiliteMax) - 6)}" text-anchor="${ancragePourX(xPic)}">${formaterPourcent(probabiliteMax)}</text>`);

    return `<svg id="jd-svg" viewBox="0 0 ${GRAPHIQUE.largeur} ${GRAPHIQUE.hauteur}" role="img" aria-label="Distribution des totaux possibles (les valeurs exactes sont dans le tableau ci-dessous)">${morceaux.join("")}</svg>`;
  }

  /* ------------------------------------------------------------- survol */

  function brancherSurvol(distribution, auMoins) {
    const enveloppe = $("#jd-chart-wrap");
    const infobulle = $("#jd-tooltip");
    const svg = $("#jd-svg");

    if (!svg) return;

    let indexSurvole = null;

    function surbrillance(index, actif) {
      if (!geometrie.modeBarres) return;

      const barre = svg.querySelector(`[data-barre="${index}"]`);

      if (barre) barre.classList.toggle("survol", actif);
    }

    function deplacerViseur(index) {
      const viseur = $("#jd-viseur");

      if (!viseur) return;

      const x = arrondir(GRAPHIQUE.gauche + (index + 0.5) * geometrie.largeurBande);
      viseur.setAttribute("x1", x);
      viseur.setAttribute("x2", x);
      viseur.style.display = "";
    }

    // contenu construit en textContent : rien n'est injecté en HTML
    function remplirInfobulle(index) {
      const total = distribution.minimum + index;

      infobulle.textContent = "";

      const titre = document.createElement("div");
      titre.className = "jd-tt-titre";
      titre.textContent = "Total " + total;

      const valeur = document.createElement("div");
      valeur.className = "jd-tt-valeur";
      const pourcent = document.createElement("b");
      pourcent.textContent = formaterPourcent(distribution.probabilites[index]);
      valeur.appendChild(pourcent);
      valeur.appendChild(document.createTextNode(" exactement"));

      const cumul = document.createElement("div");
      cumul.className = "jd-tt-cumul";
      cumul.textContent = "au moins " + total + " : " + formaterPourcent(auMoins[index]);

      infobulle.appendChild(titre);
      infobulle.appendChild(valeur);
      infobulle.appendChild(cumul);
      infobulle.style.display = "block";
    }

    function positionnerInfobulle(clientX, clientY) {
      const rectEnveloppe = enveloppe.getBoundingClientRect();
      const largeurInfobulle = infobulle.offsetWidth || 140;
      let x = clientX - rectEnveloppe.left + 14;

      if (x + largeurInfobulle > rectEnveloppe.width - 6) {
        x = clientX - rectEnveloppe.left - largeurInfobulle - 14;
      }

      infobulle.style.left = Math.max(6, x) + "px";
      infobulle.style.top = (clientY - rectEnveloppe.top + 16) + "px";
    }

    function cacher() {
      infobulle.style.display = "none";

      if (indexSurvole != null) surbrillance(indexSurvole, false);

      indexSurvole = null;
      const viseur = $("#jd-viseur");

      if (viseur) viseur.style.display = "none";
    }

    svg.addEventListener("pointerleave", cacher);

    svg.addEventListener("pointermove", evenement => {
      const rectSvg = svg.getBoundingClientRect();
      const echelle = GRAPHIQUE.largeur / rectSvg.width;
      const xVue = (evenement.clientX - rectSvg.left) * echelle;
      const index = Math.floor((xVue - GRAPHIQUE.gauche) / geometrie.largeurBande);

      if (index < 0 || index >= geometrie.nombreDeTotaux) {
        cacher();
        return;
      }

      if (index !== indexSurvole) {
        if (indexSurvole != null) surbrillance(indexSurvole, false);

        surbrillance(index, true);
        indexSurvole = index;
        remplirInfobulle(index);
        deplacerViseur(index);
      }

      positionnerInfobulle(evenement.clientX, evenement.clientY);
    });
  }

  /* ------------------------------------------------------------- tableau */

  function construireTableau(distribution, auMoins) {
    const lignes = distribution.probabilites.map((probabilite, index) => {
      const total = distribution.minimum + index;
      return `<tr><td>${total}</td><td>${formaterPourcent(probabilite)}</td><td>${formaterPourcent(auMoins[index])}</td></tr>`;
    }).join("");

    return `
      <div class="jd-table-wrap">
        <table class="jd-table">
          <thead><tr><th>Total</th><th>Exactement</th><th>Au moins</th></tr></thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>`;
  }

  /* ========================================================= INITIALISATION */

  if (typeof document !== "undefined" && document.getElementById("outils-menu-liste")) {
    initOutils();
  }

  /* exposition des fonctions pures (console de débogage + tests Node) */
  const api = { distributionDUnDe, convoluer, calculerDistribution, calculerStatistiques, calculerAuMoins, chanceDAtteindre };

  if (typeof window !== "undefined") window.OutilsDes = api;

  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
