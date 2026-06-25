# Lancer le simulateur sous Windows (sans Docker)

Le simulateur **doit être servi** (les sorts/armes sont chargés par `fetch`, bloqué
si on ouvre `index.html` en `file://`). Le serveur `server.js` tourne avec **Node**,
sans aucune dépendance à installer. Un **Node portable** est déjà fourni dans ce
dossier : rien à installer, rien à télécharger.

## Utilisation : un seul double-clic

1. Double-cliquer sur **`lancer-simulateur.bat`**.
2. Au **tout premier lancement**, le `.bat` extrait automatiquement le Node portable
   (`node-v24.18.0-win-x64.zip`) — quelques secondes, une seule fois.
3. Le serveur démarre (fenêtre console) et le navigateur s'ouvre sur
   <http://localhost:8123>.

Pour arrêter : fermer la fenêtre console (ou `Ctrl+C` dedans).
Les lancements suivants sont immédiats (plus d'extraction).

## Vérifier que ça marche

- **Pas** de bandeau rouge « Impossible de charger `data/sorts.json` » → le serveur
  sert bien les données.
- L'onglet **Cartes** liste les sorts et armes.
- L'onglet **Combat** permet d'ajouter un PJ + un monstre et de faire tourner la roue.

## Si Windows bloque le `.bat`

Le dossier étant synchronisé (Obsidian/Git), Windows peut marquer le `.bat` comme
« provenant d'Internet » :

- Clic droit sur `lancer-simulateur.bat` → **Propriétés** → cocher **Débloquer** → OK.
- Si SmartScreen affiche un avertissement : **Informations complémentaires** →
  **Exécuter quand même**.

## Détails / dépannage

- **Node fourni** : v24.18.0 LTS (« Krypton »), build officiel `win-x64` de
  nodejs.org, intégrité vérifiée (SHA-256 officiel).
- **PC ARM** (Surface Pro X, Snapdragon…) : le zip fourni est x64. Télécharge le zip
  `node-vXX-win-arm64.zip` sur <https://nodejs.org/en/download>, pose-le dans ce
  dossier et renomme le dossier extrait en `node` (objectif `node\node.exe`) — le
  lanceur le détecte aussi.
- **Ce qui est versionné** : seul le **zip** est commité (≈ 36 Mo). Le dossier extrait
  (`node-v24.18.0-win-x64\`) et un éventuel `node\` sont **ignorés par Git** : chaque
  machine extrait le sien localement, rien de lourd ne re-part dans le vault.
- **Ordre de résolution du lanceur** : Node portable local (extrait, ou auto-extrait
  du zip) → Docker → Node du PATH.
- L'**Éditeur de cartes** (sauvegarde sur disque, upload d'images) fonctionne aussi
  avec ce Node portable — bonus, non nécessaire pour jouer.
