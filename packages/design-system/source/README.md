AlterPark (« L'autre parking ») est un parking situé près de l'aéroport de Nantes. Le site est sombre et routier : un fond anthracite unique, un orange signature, des titres en police pochoir et des photos assombries par un voile. Ce système reprend la maquette Figma de l'accueil à l'identique et complète ce qu'elle ne montre pas (états, formulaires, mobile). Chaque token précise s'il est **observé** dans la maquette ou **proposé**.

## Contenu et ton

- On vouvoie le client et on lui parle directement : « Réservez ma place ! », « Profitez de vos vacances ».
- Les titres sont enthousiastes et finissent souvent par « ! » : « Que de changements chez ALTERPARK depuis le 20 mars ! ». Gardez au plus un « ! » par titre.
- Le nom s'écrit **ALTERPARK** en capitales dans les titres et le texte de marque, **AlterPark** dans l'introduction du hero et **Alterpark** dans le footer. Choisissez une forme par contexte et gardez-la.
- Les boutons commencent par un verbe : « Réservez maintenant », « Découvrez nos services + », « En savoir + ».
- Le texte courant est rassurant et concret : il donne des chiffres (« 15 minutes », « 0,50 € », « 10 points par euro »), parle de sécurité (vidéosurveillance, gardiennage) et de gratuité (« navette gratuite sans attente »).
- Pas d'emoji dans l'interface.

## Couleur

- Posez toute page sur `surface` (#313131). Il n'y a ni thème clair ni section blanche.
- Utilisez `primary` (orange #F6921E) pour la ponctuation et les chiffres des titres, les sous-titres, les boutons, pictogrammes, liens et filets de 10 px. N'en remplissez pas de grandes surfaces, à l'exception des boutons et des filets.
- Écrivez le texte en `text-primary` (blanc). Utilisez `text-secondary` pour l'aide et les métadonnées, `text-muted` pour les placeholders.
- `secondary` (#F05A28) est réservé au logo et `accent` (#F6BB04) aux étoiles. Ne les employez pas ailleurs.
- Posez toujours le texte d'une photo sur le voile `overlay-hero`.
- Les couleurs de statut (`success`, `warning`, `error`, `info` et leurs `*-soft`) sont proposées. Accompagnez-les toujours d'une icône et d'un mot.
- **Accessibilité :** le texte des boutons orange est blanc (`on-primary`), comme la maquette et à la demande du client. Ce couple n'atteint que 2,32:1, sous le seuil WCAG AA ; #613400 (4,5:1) reste l'alternative lisible. Tous les autres couples texte/fond du système dépassent 4,5:1.

## Typographie

- **Titres :** Crossroads (`display`, `h2`, `h4`, `h5`), en MAJUSCULES, approche 0,08em. Les mots sont en blanc (`text-primary`) ; les chiffres et la ponctuation (`! ? , & “ ”`, « 20 ») sont en orange `primary`, comme dans la maquette. `SectionHeading` et `Hero` le font automatiquement (`accentTitle`). La version « personal use » n'a pas de ponctuation et remplace les chiffres par un filigrane. `bundle.css` sert donc les chiffres et `! ? , . : - & ( ) /` en Montserrat 800, comme dans la maquette.
- **Sous-titres et interface :** Montserrat Bold (`h3`, `h6`, `nav`, `button`, `link`, `label`).
- **Texte courant et liens :** 16 px partout (`body`, `fs-body`, `nav`, `link`), à la demande du client (la maquette utilisait 18–20 px). Montserrat Light, approche 0,08em en desktop resserrée à 0,5 px en mobile (`ls-body`), interligne 26 → 32 px (`lh-body`).
- **Légendes :** Nunito (`caption`, `caption-sm`, `rating-label`), uniquement sous les étapes du hero et dans le badge Google. Ne l'étendez pas ailleurs.
- Un seul H1 par page (`display`). Écrivez les titres en casse normale dans le code : la majuscule vient du CSS.
- Les titres ont été réduits à la demande du client et restent fluides : `fs-display` (26 → 44 px, maquette 60), `fs-h2` (22 → 36 px, maquette 50), `fs-h4` (20 → 24 px), `fs-numeral` (72 → 110 px).

## Espacement et mise en page

- Grille : le contenu occupe `container-width` (90 % de la fenêtre, 5 % de marge de chaque côté) et au plus `container-max` (1666 px) ; la navigation `container-nav`, les paragraphes centrés `container-text` et une colonne de texte `container-col`.
- Échelle : `space-1` à `space-40` (4 → 160 px). La maquette utilise 29, 40, 59, 64 et 120–180 px, arrondis vers l'échelle (voir chaque token).
- Écart entre sections : `space-30` en desktop, `space-24` en laptop, `space-20` en tablette, `space-16` en mobile ; `space-40` après le hero.
- Titre → texte : `space-8`. Texte → bouton : `space-16`.

## Formes, ombres et états

- Rayons : boutons en pilule (`radius-pill`), photos `radius-xl` (33), bandeau `radius-lg` (20), badge et champs `radius-md` (15), onglets `radius-sm` (10).
- Ombres : une ombre portée noire sous les photos (`shadow-photo`), comme les téléphones, ombre intérieure des onglets (`shadow-tab`), `shadow-elevated` pour les menus et la modale.
- Séparateurs : filet blanc de 1 px en pointillés (tirets 3/5) entre les étapes et les questions d'accordéon. Pas de bordures pleines décoratives.
- Focus clavier : `shadow-focus` (2 px `surface` puis 2 px blanc) sur tout élément interactif.
- Survol : l'orange s'éclaircit (`primary-hover`) ; à l'appui, il fonce (`primary-active`). Les transitions utilisent `duration-fast` et `ease-standard`, et sont désactivées si l'utilisateur préfère réduire les animations.

## Iconographie

- Le logo, les pictogrammes d'étape et de fidélité, le bouton lecture et les icônes sociales sont intégrés en **code SVG** dans `bundle.js` (`AlterPark.svg`, rendus par `svgIcon(nom)`), optimisés (≈ 60 % plus légers que les fichiers source). Les pictogrammes suivent `currentColor` (orange `primary` par défaut) ; le logo suit `text-primary`, `primary` et `surface`. Passez leur nom aux composants (`icon: 'stepReserver'`, `'facebook'`…). Les fichiers du groupe Icons restent disponibles pour les autres usages.
- Les flèches du carrousel et l'étoile reprennent les tracés du fichier source ; dans `bundle.js`, elles suivent `currentColor`.
- Les étoiles de la maquette viennent de Font Awesome 6 Pro (licence payante). Le système embarque le tracé exporté, pas la police.
- Les icônes d'interface (chevron, fermer, coche, statuts) sont proposées : trait de 2,5 px, extrémités arrondies, pour s'accorder aux pictogrammes.
- Le logo est blanc et orange sur fond sombre. En SVG intégré, ses découpes prennent la couleur `surface` ; en fichier, elles sont remplies de #313131 et ne se posent que sur `surface`.

## Utiliser le système

Les composants sont dans `components/bundle.js` (`window.AlterPark`, React 18) et `components/bundle.css`, et lisent les tokens via `var(--…)`. Les fichiers (logo, pictogrammes, photos) sont exposés dans `AlterPark.assets`. Dans le projet, remplacez ces URL par vos chemins. Lisez la section **Architecture** pour le découpage en dossiers, **Responsive** pour les points de rupture et **Analyse du prototype** pour le relevé détaillé et les incohérences.


---

## Consuming this system (generated — do not edit)

Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.

`components/bundle.js` defines `window.AlterPark` (24 components); `components/bundle.css` is its stylesheet; `tokens.css` is every token as a CSS variable plus `@font-face` for the fonts. `components/bundle.css` reads its variables from `tokens.css`. The bundle needs react 18.3.1 (not packed in this system: bring your own copy) (`window.React`), react-dom 18.3.1 (not packed in this system: bring your own copy) (`window.ReactDOM`), loaded before it. Build any UI by mounting these components; never hand-build a control or draw an icon the system provides.

- **Standalone page:** inline `tokens.css` and `components/bundle.css` in a `<style>`, then the library files and `components/bundle.js` as classic scripts (a file containing `</style`, `</script` or `<!--` breaks an inline element: write the sequence `<\/style`, `<\/script` or `\x3C!--` in your copy, or load that file by URL).
- **Design canvas:** bring `tokens.css`, `components/bundle.css`, `components/bundle.js` and `components/index.d.ts` (for the editor’s props panel) onto the canvas in full, as the canvas type’s design-system components reference says (a server-side copy first where it offers one); in each artboard that uses this system, right after the `support.js` line, load `tokens.css` first, then the stylesheet, then the script; skip the library files (the artboard supplies React); mount with `<x-import component-from-global-scope="AlterPark.<Comp>" …>`.
- **Slides deck, or any surface that cannot run the bundle:** tokens and fonts — the values are on `api/tokens.md`; the deck takes `tokens.json` by file path for its colour pickers, and fonts as “Fonts” below says.

Fonts: `tokens.css` loads each font from its file, by path.

- **Design canvas:** copy `fonts/Crossroads-Regular.ttf`, `fonts/Montserrat-300.woff2`, `fonts/Montserrat-400.woff2`, `fonts/Montserrat-700.woff2` and `fonts/Montserrat-800.woff2` to the same paths under the canvas’s `project/ds/<folder>/` (`<folder>` is the folder you install this system under; `fonts/Crossroads-Regular.ttf` lands on `project/ds/<folder>/fonts/Crossroads-Regular.ttf`), in the same call that installs this system; the copy of `tokens.css` that each artboard links loads them from there. If the install’s reply leaves a font out, bring that font in as for any other page.
- **Slides deck:** for each family you use in the deck (`faces` holds at most the number of typefaces Slides’ `deck-files.md` gives), install its file with the system and name the path it lands on as that family’s `src` in `project/deck.json` `faces`, under the key in the Slides column. A deck takes a font as a file only under the rule in Slides’ `fonts.md` (no space or leading underscore in its path, for two): any other font, or one kept by id, is uploaded as `fonts.md` says.
- **Any other page:** one file per family is enough (below: the upright face nearest regular weight; bold and italic synthesize). Fetch it as the fetch column says (Artifact tool `read`, that id or path as `path`), upload it as an asset (`publish`, `file_path`, `asset:true`) and declare it with an `@font-face { font-family: "<family>"; src: url(<uploaded>) }` rule.

| family | file | fetch | CSS | Slides `faces` key |
| --- | --- | --- | --- | --- |
| Crossroads | `fonts/Crossroads-Regular.ttf` (weight 400) | `read` the file with `project/` in front | `var(--font-display)` | `crossroads` |
| Montserrat | `fonts/Montserrat-400.woff2` (weight 400) | `read` the file with `project/` in front | `var(--font-display)` | `montserrat` |

**Read, per thing:** a component’s props, parts and examples: `api/components/<Comp>.md`; token values: `api/tokens.md`; stored assets and their paths: `api/assets/<Group>.md`. After this README, fetch the cards and fonts you need in ONE message as parallel calls — none depends on another.

**Two rules.** Before you use a thing — a component, a token group, an icon, an asset — read its card from the index below; a value you did not read from a card is a guess. `tokens.json`, `manifest.json`, `components/index.d.ts` and `design-system.json` are sources for tools: hand them over. `components/<Comp>/README.md` and `assets/<Group>/README.md` are the long-form second read a card links to; `SKILL.md` and `artifact-type/` beside them are authoring guidance, not needed to consume the system.

## Index (generated — do not edit)

**Tokens**

- `api/tokens.md` — Every token: surface, text, fill, border, palette, type, spacing, radius, shadow, border-width, container, breakpoint, z-index, icon-size, fluid, transition. (21.2k)

**Icons and assets**

- `api/assets/Logos.md` — 1 file, by asset id. (1.1k)
- `api/assets/Icons.md` — 15 files, by asset id. (3.0k)
- `api/assets/Photos.md` — 5 files, by asset id. (1.8k)
- `api/assets/Partenaires.md` — 4 files, by asset id. (1.4k)

**Components** (`api/components/<Comp>.md`, 24)

- **Actions**: `Button` — Bouton d'action en pilule, orange par défaut, pour l'action principale d'une section (réserver, découvrir, en savoir plus) · `IconButton` — Bouton sans libellé visible : flèches du carrousel et bouton de lecture vidéo
- **Navigation**: `Header` — En-tête du site : filet orange de 10 px, navigation en deux moitiés autour du logo centré ; burger et panneau en mobile · `Breadcrumbs` — Fil d'Ariane des pages intérieures · `SocialRail` — Rail d'onglets fixé au bord droit : Facebook, espace client, YouTube · `Footer` — Pied de page : logo, droits, mentions légales, adresse, contact, filet orange de 10 px
- **Patterns**: `Hero` — Ouverture de l'accueil : photo plein cadre voilée, H1 en Crossroads, introduction, étapes et bouton · `MediaSection` — Section deux colonnes : titre, texte et bouton d'un côté, visuel de l'autre · `Banner` — Bandeau photo pleine largeur fondu dans le fond, suivi d'un contenu centré (logo partenaire, titre, texte, bouton)
- **Contenu**: `SectionHeading` — Titre de section en Crossroads blanc, chiffres et ponctuation en orange, avec sous-titre et paragraphe facultatifs · `Steps` — Suite d'étapes numérotées : pictogramme orange, grand chiffre fantôme, titre en Crossroads, légende, filets pointillés · `RatingBadge` — Badge de note Google : logo G, « EXCELLENT », 5 étoiles, nombre d'avis, contour orange · `Stars` — Étoiles de notation jaunes accent · `ReviewCard` — Avis client : avatar, nom, étoiles, extrait sur 3 lignes, « Lire plus », logo de la source · `ReviewCarousel` — Carrousel d'avis avec flèches orange · `StoreBadges` — Badges officiels Google Play et App Store · `Accordion` — Liste de questions dépliables, séparées par le filet pointillé de la marque
- **Formulaires**: `TextField` — Champ de saisie avec libellé, aide et message : texte, e-mail, mot de passe, téléphone, zone de texte · `Select` — Liste déroulante native stylée · `Checkbox` — Case à cocher · `RadioGroup` — Choix unique dans un fieldset · `Toggle` — Interrupteur pour un réglage activé immédiatement
- **Feedback**: `Alert` — Message de retour : succès, information, avertissement, erreur · `Modal` — Fenêtre de dialogue au-dessus d'un voile
