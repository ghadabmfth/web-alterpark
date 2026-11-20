# Footer

Pied de page : logo, droits, mentions légales, adresse, contact, filet orange de 10 px.

**Origine :** Observé : une ligne de 5 colonnes, Montserrat Regular 20/30, liens légaux en Bold.

## Quand l'utiliser

Une fois par page.

## Variantes

Contenus par props (`legalLinks`, `address`, `phone`, `email`, `year`). `social` (`{label, href, icon}`) affiche les liens sociaux en icônes seules, sans fond ni bordure : blanches, orange et légèrement soulevées au survol. Icônes conseillées : `facebookGlyph`, `youtubeGlyph`.

## États

Liens : survol `primary-hover`, focus `shadow-focus`. Téléphone et e-mail cliquables.

## Responsive

≥ 1024 px : une ligne (16 px sous 1500 px). Plus étroit : colonne centrée, 16/26.

## Règles de composition

- Toujours le filet `primary` en bas.
- `<address>` pour l'adresse.

## Exemple

```jsx
<Footer year={2025} />
```
