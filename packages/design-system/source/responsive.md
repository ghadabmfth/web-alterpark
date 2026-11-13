# Responsive

La maquette n'existe qu'en 1920 px. Cette stratégie est **proposée**, en mobile-first (`min-width`). Les composants réagissent à la largeur de leur conteneur (`@container`), ce qui leur permet de fonctionner dans n'importe quelle colonne.

| Appareil | Largeur | Tokens | Mise en page |
|---|---|---|---|
| Mobile | < 768 px | — | 1 colonne, gouttière `space-4`, sections espacées de `space-16`, menu burger |
| Tablette | 768–1023 px | `bp-md` | 2 colonnes pour les étapes et les avis, gouttière `space-12`, sections `space-20` |
| Laptop | 1024–1279 px | `bp-lg` | Navigation desktop resserrée (15 px), sections `space-24` |
| Desktop | 1280–1919 px | `bp-xl` | Mise en page de la maquette, navigation 17–20 px, sections `space-30` |
| Maquette | ≥ 1920 px | `bp-xxl` | Valeurs exactes de la maquette ; contenu plafonné à `container-max` |

## Par élément

- **Typographie :** les titres utilisent `fs-display` (30 → 60 px), `fs-h2` (26 → 50), `fs-h4` (22 → 30) et `fs-numeral` (80 → 130). Le texte courant suit `fs-body` (16 → 18 px), `ls-body` (0,5 → 1,44 px) et `lh-body` (28 → 40).
- **Header :** avec `sticky`, il se fixe en haut, opaque et compact (logo 84 px en mobile, 110 px en desktop), dès que l'on fait défiler. En dessous de 1024 px, le logo passe à gauche (110 px) et un burger s'affiche à droite ; le panneau s'ouvre sous l'en-tête, avec les sous-menus en accordéon et le bouton de réservation pleine largeur.
- **Étapes :** une ligne avec filets pointillés à partir de 900 px ; en dessous, chaque étape devient une ligne compacte (pictogramme 60 px à gauche, titre et texte à droite), sur 2 colonnes de 600 à 899 px, 1 colonne en dessous.
- **Sections texte + visuel :** 2 colonnes à partir de 1024 px ; en dessous, le texte puis le visuel. Le collage photo se simplifie en mobile (une photo, badge en dessous).
- **Avis :** 3 visibles, puis 2, puis 1 ; en mobile la carte fait 88 % de large (la suivante dépasse pour inviter à glisser) et les flèches passent dessous.
- **Bandeau :** la hauteur de la photo varie de 200 à 435 px.
- **Footer :** une ligne à partir de 1024 px, sinon une colonne centrée.
- **Boutons :** 64 px de haut ; `size="sm"` (48 px) ou `fullWidth` dans les zones étroites. Sous 400 px, le libellé peut passer à la ligne (18 px, 56 px minimum). Les zones tactiles font au moins 44 px.
- **Réservation en mobile :** une barre collante en bas d'écran (bouton `sm` pleine largeur) reprend l'action principale sous 1024 px, une fois le hero dépassé.
- **Images :** `object-fit: cover`, proportions conservées : hero 16:9 recadré, photos du collage 397:539 et 395:535, bandeau 1920:435. Servez les photos en WebP (≈ 70 % plus légères), chargées en différé hors écran (les composants posent `loading="lazy"`) ; préchargez seulement la photo du hero.
- **Rail social :** fixé à droite à partir de 1280 px ; en dessous, il couvrirait le texte : masquez-le et passez ses liens au `Footer` (prop `social`).
