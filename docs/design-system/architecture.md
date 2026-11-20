# Architecture

Organisation recommandée dans le dépôt du site. Chaque dossier correspond à une partie de ce système, et les pages ne contiennent aucune valeur en dur.

```
design-system/
  foundations/
    tokens.json          ← ce système : source unique
    tokens.css           ← généré (variables CSS + classes de texte + @font-face)
    fonts/               ← Crossroads, Montserrat 300/400/700/800, Nunito 300/800/900
  assets/
    logos/  icons/  photos/  partenaires/
  components/
    actions/      Button, IconButton
    navigation/   Header, Breadcrumbs, SocialRail, Footer
    content/      SectionHeading, Steps, RatingBadge, Stars, ReviewCard, ReviewCarousel, StoreBadges, Accordion
    forms/        TextField, Select, Checkbox, RadioGroup, Toggle
    feedback/     Alert, Modal
  patterns/
    Hero, MediaSection, Banner
  documentation/
    README (charte), analyse, responsive, architecture, une fiche par composant
```

## Correspondance avec ce système

| Dossier du dépôt | Fichiers ici |
|---|---|
| `foundations/` | `tokens.json`, `fonts/` |
| `assets/` | groupes Logos, Icons, Photos, Partenaires |
| `components/`, `patterns/` | `components/bundle.js`, `components/bundle.css`, `components/index.d.ts` |
| `documentation/` | `README.md`, `analyse.md`, `responsive.md`, `architecture.md`, `components/<Nom>/README.md` |

## Règles

- Les couleurs, espacements, rayons, ombres et durées passent par `var(--token)`. Une valeur qui manque s'ajoute d'abord à `tokens.json`.
- Les classes CSS sont préfixées `ap-` et suivent le modèle bloc__élément--variante (`ap-btn--primary`, `ap-header__nav`).
- Un composant = un dossier contenant le code, les styles, la fiche et un exemple. Les pages ne font qu'assembler des patterns et des composants.
- Les seuils de `@container` et `@media` reprennent les tokens `bp-*` (les CSS custom properties n'y sont pas autorisées).
- Avant d'ajouter un composant, vérifiez qu'une variante d'un composant existant ne suffit pas.
