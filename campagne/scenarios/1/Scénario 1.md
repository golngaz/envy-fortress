
> [!danger] Note MJ
> Le départ du premier scénario est un peu scripté, les joueurs peuvent faire peu de choses et dont finalement pressé par le temps. Avant d'entrer dans la forteresse, ils sont injecté par un programme qui s'occupe de les cloner en boucle pour tenter de les "inséminer" de force dans la forteresse. S'il meurent, il réapparaîtrons en boucle au milieu de la plaine. Ils peuvent même tenter un suicide, il réapparaîtrons toujours vers le nord de la plaine.
# Introduction

Vous vous retrouvez dans une salle mystique, vous demandant de choisir votre classe, vous avez à votre disposition : 

```base
views:
  - type: table
    name: Table
    filters:
      and:
        - file.folder == "classes"
    sort:
      - property: file.name
        direction: ASC

```


![[Plaine de l'ennui (Couronne de la forteresse)]]

# Options

## Ne rien faire

Le joueur peut décider de ne pas aller plus loin mais il remarquera qu'il fait de plus en plus chaud, le soleil semble devenir une fournaise et rougis, les joueurs commencent à gagner des [[Jeton Température]] et perdent un point de vie à chaque jeton reçu. On applique la règle en combat et on garde les jetons si un combat se lance.

## Suicide

Si les joueurs meurent ou décident de se suicider, ils réapparaîtrons immédiatement près du combat.

##  S'approcher du monolithe

3 Lapins blancs apparaissent mais paraissent un peu agressifs… Tout du moins, sur la défensive, ils portent un casque de soldat gris.

1. [[campagne/combats/plaine/Gardiens du monolithe (combat)|Gardiens du monolithe]]

## Toucher le monolithe : 

> [!tip] Narration
> Vos mains effleurent enfin la surface froide du rocher. À cet instant précis, le sol se met à vibrer, un grondement sourd résonnant dans vos os. Sous vos yeux, le monolithe se déchire et se métamorphose lentement : la pierre se plie, se sculpte d’elle-même, prenant l’apparence d’un soldat gigantesque. Son corps est nu de toute armure, façonné d’une peau lisse et bleuâtre, mais sa tête est dissimulée sous un imposant casque de chevalier, seul vestige d’une protection ancienne.
>
> Dans sa main colossale, il brandit un **morgenstern titanesque**, dont la masse hérissée de pointes semble pouvoir pulvériser roche et chair d’un seul coup. Chaque mouvement fait grincer l’air d’un bruit sinistre, comme si l’arme elle-même appelait à la destruction.
>
> Ses yeux invisibles vous fixent, et malgré l’absence de traits, vous sentez dans son attitude une soif de combat inébranlable. L’air s’alourdit, oppressé par son aura. Puis, derrière la masse colossale, là où se dressait le monolithe, une porte dorée se révèle lentement, scintillant comme une promesse.
>
> L’espoir d’obtenir enfin des réponses se mêle à la curiosité brûlante qui vous dévore… mais l’imposante créature qui se dresse devant vous, armée de son arme monstrueuse, vous rappelle que ce passage ne se gagnera qu’au prix d’un affrontement. Et cet affrontement semble tenir davantage du miracle que de la simple victoire.
> 
> Cependant, il tient de son autre main, une grande cage, et votre intuition vous dit qu'elle est la uniquement pour vous.



2. [[campagne/combats/plaine/Le Soldat Bleu (combat)|Le Soldat bleu]]

> [!danger] La cage — méthode de capture (MJ)
> La cage n'est pas un décor : c'est le **piège** du géant. En son cœur luit un **fragment du monolithe**. Le plan du géant n'est pas de tuer les PJ, mais de les **broyer pour qu'ils réapparaissent dans la cage** — le fragment captif serait un ancrage plus proche que le cycle de la Couronne, et le piège se refermerait sur eux. Voir [[Fragment du monolithe#Les fragments comme points d'ancrage (résurrection)|l'ancrage]] et [[monstres/Le Soldat Bleu#La cage et le fragment (méthode de capture)|la fiche du géant]].
>
> **Mais les PJ ont de la chance** : au **premier coup** que la créature envoie, le fragment de la cage se fissure et tombe.

> [!tip] Narration — le fragment se brise
> Le colosse lève la cage et attaque subitement {{UN PJ}} .Le premier coup porté résonne… et c'est la **cage**, qui répond. Vous observez un objet noirâtre brillant plutôt imposant tomber hors de la cage et **tombe dans l'herbe** avec un tintement cristallin, son éclat s'éteignant aussitôt.

> [!info] Conséquence mécanique (MJ)
> Le fragment brisé, le piège est mort-né : à chaque mort ou suicide durant ce combat, les PJ réapparaissent au **dans le combat, en boucle** (cf. note d'intro). Ce moment **plante discrètement** la mécanique d'ancrage par fragment, révélée plus tard au [[Fragment du monolithe|panneau du Magicien]] — sans rien expliquer pour l'instant.

Lorsque [[monstres/Le Soldat Bleu|Le Soldat Bleu]] est battu, Il se fige d'une matière qui semble être la même que celle du monolithe

## Porte dorée

Prendre la porte dorée nous amène dans une salle qui semble magique, coupée de tout plan physique, avec tout de même cette sensation de descendre comme dans un "ascenseur". 
### Questions & mystères 
* Insister sur le fait que l'ascenseur semble vraiment à part, il n'y a pas de murs, seulement une sorte de sol magique, quand la porte se ferme, tout mur disparait et on a l'impression que l'on tient juste sur sur une plateforme qui descend en empruntant un plan à part
* Les joueurs pourraient tomber, s'il essayent de sauter, le joueur disparaît pour apparaître

Arrivé en bas, les joueurs **gagnent un niveau** et arrivent devant un panneau.

> [!quote] Le panneau (signé « Le Magicien »)
> « Ici prend fin le cycle de la Couronne. Plus bas, tu ne renaîtras plus dans le ciel.
> Lie-toi aux **fragments du monolithe** dispersés sur chaque étage : c'est là, et nulle part ailleurs, que tu reviendras si tu tombes.
> Avance, et le cœur t'attend. »

> [!info] Système de mort (hybride) — règle MJ
> Fini la réapparition libre de la Couronne. À partir d'ici, la mort renvoie le joueur à **son dernier [[Fragment du monolithe|fragment]] ancré** (un fragment qu'il a touché/activé), avec ses PV restaurés. Tous les fragments sont reliés au monolithe principal qui descend jusqu'au cœur, tout en bas.
> - Tant qu'aucun fragment n'est ancré sur un étage, le dernier ancrage **antérieur** reste le point de retour (au pire, le premier fragment du début de l'étage).
> - On peut y rattacher un coût à la mort (cf. règles : perte de jetons, de ressources, repop des ennemis non-boss…) sans que la mort soit définitive.

# Plan

1. Toucher le monolithe
2. Battre les lapins
3. Battre le boss
4. Prendre la porte dorée