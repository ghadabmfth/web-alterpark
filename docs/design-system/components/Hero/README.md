# Hero

Ouverture de l'accueil : photo plein cadre voilée, H1 en Crossroads, introduction, étapes et bouton.

**Origine :** Observé : 1920 × 1008, dégradé `surface` → `overlay-hero`, H1 60/60 blanc (ponctuation orange), intro `body` centrée 1193 px, 4 étapes, bouton `primary`.

## Quand l'utiliser

Uniquement en tête de l'accueil ou d'une page d'atterrissage. Les pages intérieures utilisent `SectionHeading` avec `as="h1"`.

## Variantes

Props : `title`, `intro`, `image`, `steps`, `cta`, `children`.

## États

Voir `Button` et `Steps`.

## Responsive

`display` devient fluide (`fs-display`, 30 → 60 px). Les étapes passent de 4 colonnes à 2 puis 1. Padding vertical `space-24` / `space-16`.

## Règles de composition

- Un seul H1 par page.
- Photo sombre ou désaturée ; le voile garantit le contraste du texte blanc.

## Exemple

```jsx
<Hero title="Votre parking à proximité de l’aéroport de Nantes…" intro="…" steps={steps} cta={{label:'Réservez ma place !',href:'/reservation'}} />
```
