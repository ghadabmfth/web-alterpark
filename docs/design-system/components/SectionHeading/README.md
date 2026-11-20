# SectionHeading

Titre de section en Crossroads blanc, chiffres et ponctuation en orange, avec sous-titre et paragraphe facultatifs.

**Origine :** Observé : H2 50/55, mots `text-primary`, ponctuation et chiffres `primary`, sous-titre Montserrat Bold 25 `primary`, texte `body` ; titre → texte 29 px (`space-8`).

## Quand l'utiliser

En tête de chaque section ; dans `MediaSection` et `Banner`.

## Variantes

`align` : `left` (défaut) ou `center` · `as` : `h1`/`h2`/`h3` · `size` : `display` ou `h2`.

## États

Aucun (non interactif).

## Responsive

`fs-h2` (26 → 50 px) ; interligne du texte `lh-body` (28 → 40 px).

## Règles de composition

- Titres en casse normale dans le code : la majuscule est appliquée en CSS (lecteurs d'écran).
- Centré : texte limité à `container-text`.

## Animation

Le titre se tape lettre par lettre (32 ms par lettre) avec un curseur orange quand il entre à l'écran, une seule fois ; le curseur clignote quelques instants à la fin. Les mots ne se coupent pas, la place est réservée dès le départ (pas de saut de mise en page) et les lecteurs d'écran lisent le titre entier. `typing={false}` désactive l'effet ; il est aussi coupé si l'utilisateur réduit les animations. Même comportement pour le titre de `Hero`.

## Mise en valeur

Les chiffres et la ponctuation passent en orange automatiquement. Pour un mot, entourez-le de crochets : `title="Votre parking [couvert] et [sécurisé] à 800 m des pistes !"`. Valable aussi pour le titre de `Hero`.

## Exemple

```jsx
<SectionHeading title="Fidélisez vos réservations avec ALTERPARK !" subtitle="Comment ça marche ?" />
```
