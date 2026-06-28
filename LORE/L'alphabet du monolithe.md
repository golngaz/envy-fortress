L'**alphabet du monolithe** est l'écriture gravée par [[Le Magicien]] sur le [[Fragment du monolithe|monolithe]] et ses fragments. C'est un **chiffre** (un signe par son, pas par lettre française) : plus ancien et plus économe que notre alphabet, il **confond** certains sons et **multiplie** la voyelle la plus courante. Sert d'outil MJ : inscriptions, indices, panneaux, lettres codées.

> [!warning] Clé réservée au MJ
> Cette page est la **clé de déchiffrement**. Les **inscriptions encodées** (panneaux, gravures, parchemins) peuvent être montrées aux joueurs ; cette table-ci, non — à eux de la reconstituer s'ils veulent percer le code.

# La table

| Lettre(s) FR     | Signe     |     | Lettre(s) FR | Signe |
| ---------------- | --------- | --- | ------------ | ----- |
| a                | ᚠ         |     | n            | ᛊ     |
| b                | ᚢ         |     | o            | ᛏ     |
| c                | ᚦ         |     | p            | ᛒ     |
| d                | ᚨ         |     | **s = x**    | ᛖ     |
| **e** (3 formes) | ᚱ · ᚲ · ᚷ |     | t            | ᛗ     |
| f                | ᚹ         |     | u            | ᛚ     |
| g                | ᚺ         |     | v            | ᛜ     |
| h                | ᚾ         |     | w            | ᛞ     |
| **i = y**        | ᛁ         |     | z            | ᛟ     |
| j                | ᛃ         |     |              |       |
| **k = q**        | ᛇ         |     |              |       |
| **l = r**        | ᛈ         |     |              |       |
| m                | ᛉ         |     |              |       |

# Reproduire les signes (police)

> [!info] Quelle police installe ces « logos »
> Ces signes sont de **vraies runes Unicode** — l'alphabet **vieux-futhark** (*Elder Futhark*), bloc **Runic** `U+16A0–U+16FF`. **Aucun dessin** n'est nécessaire : il suffit d'**installer une police** qui couvre ce bloc, puis de **taper/coller** les caractères de la table.
> Polices gratuites qui les affichent :
> - **Noto Sans Runic** (Google Noto) — la plus propre et complète.
> - **Segoe UI Historic** — **déjà sur Windows 10/11** (couvre le bloc Runic).
> - **BabelStone Runic** — plusieurs styles « gravés / manuscrits », parfait pour un rendu inscription.
> - **Junicode**, **Quivira**, **Code2000** — autres polices Unicode couvrant les runes.
>
> Pour des **logos / gravures** (Photoshop, Illustrator, Inkscape) : installe l'une de ces polices, tape le mot encodé, puis **vectorise** le texte. Tu peux déposer le `.ttf`/`.otf` dans `assets/police/`.

> [!example] Points de code (pour saisie / vectorisation)
> a `ᚠ` U+16A0 · b `ᚢ` U+16A2 · c `ᚦ` U+16A6 · d `ᚨ` U+16A8 · **e** `ᚱ` U+16B1 / `ᚲ` U+16B2 / `ᚷ` U+16B7 · f `ᚹ` U+16B9 · g `ᚺ` U+16BA · h `ᚾ` U+16BE · **i=y** `ᛁ` U+16C1 · j `ᛃ` U+16C3 · **k=q** `ᛇ` U+16C7 · **l=r** `ᛈ` U+16C8 · m `ᛉ` U+16C9 · n `ᛊ` U+16CA · o `ᛏ` U+16CF · p `ᛒ` U+16D2 · **s=x** `ᛖ` U+16D6 · t `ᛗ` U+16D7 · u `ᛚ` U+16DA · v `ᛜ` U+16DC · w `ᛞ` U+16DE · z `ᛟ` U+16DF

# Les fusions (un seul signe pour deux lettres)

Le chiffre ne distingue pas ces sons proches — un même signe vaut pour les deux lettres :

- **l** et **r** → ᛈ
- **i** et **y** → ᛁ
- **s** et **x** → ᛖ
- **k** et **q** → ᛇ

> [!info] Ambiguïté volontaire
> À la lecture, ᛈ peut être *l* **ou** *r*, ᛁ *i* **ou** *y*, etc. : c'est le **contexte** (le mot) qui tranche. Cette part d'énigme est **recherchée** — elle rend les inscriptions cryptiques et oblige à « deviner » le mot.

# Les trois formes du « e »

Le **e** — la voyelle reine du français — reçoit **trois signes interchangeables** : ᚱ · ᚲ · ᚷ. Le scribe les **alterne** librement (souvent une forme par occurrence) pour que le texte ne paraisse pas répétitif.

> [!tip] Variante « accents »
> Si le MJ veut coller aux accents : **ᚱ = e**, **ᚲ = é**, **ᚷ = è/ê**. Sinon, les trois valent simplement *e*.

# Règles d'écriture

- **Accents ignorés** (sauf la variante ci-dessus) : é, è, ê, à, â… → lettre nue. **ç → c** (ᚦ).
- **Pas de majuscules** : un seul signe par son.
- **Espaces et ponctuation** : conservés tels quels (ou remplacés par un point médian `·` pour un rendu plus « gravé »).
- Lettres doubles : on **répète** le signe (ll → ᛈᛈ).

# Exemples

> [!example] « monolithe »
> m·o·n·o·l·i·t·h·e → **ᛉ ᛏ ᛊ ᛏ ᛈ ᛁ ᛗ ᚾ ᚱ**

> [!example] « shell access » (en alternant les formes du e)
> s·h·e·l·l → **ᛖ ᚾ ᚲ ᛈ ᛈ**  ·  a·c·c·e·s·s → **ᚠ ᚦ ᚦ ᚷ ᛖ ᛖ**
> *(noter : les deux « l » sont le même signe que « r » ; les deux « s » le même que « x ».)*

> [!example] « le coeur »
> l·e → **ᛈ ᚱ**  ·  c·o·e·u·r → **ᚦ ᛏ ᚲ ᛚ ᛈ**
> *(« r » final = ᛈ, comme « l ».)*

# Pistes MJ

- **Inscriptions de décor** : graver un mot sur une porte, un fragment, une tombe — les joueurs qui ont reconstitué la clé y lisent un indice (un nom, un mot de passe, une direction).
- **Lettre codée** d'un PNJ (rebelle prudent, érudit comme **Ivar**) : message qui ne se lit qu'avec la clé.
- **Énigme de salle** : la solution est un mot encodé, l'ambiguïté l/r ou i/y forçant à tester deux lectures.
- **Cohérence lore** : cette écriture est celle du Magicien — la retrouver, c'est s'approcher de lui.
