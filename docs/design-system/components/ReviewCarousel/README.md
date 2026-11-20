# ReviewCarousel

Carrousel d'avis : défilement tactile avec accrochage, flèches rondes, points de pagination et défilement automatique.

**Origine :** Repensé à la demande du client (maquette : 3 avis et deux flèches orange).

## Quand l'utiliser

Section « Ce que nos clients disent de nous ». Une fois par page, avec 4 avis ou plus pour que le défilement ait du sens.

## Variantes

| Prop | Rôle |
|---|---|
| `items` | avis (`ReviewCard`) |
| `autoplay` | défilement automatique, défaut `true` |
| `interval` | délai entre deux avis, défaut 6000 ms |

## États

- Défilement automatique, mis en pause au survol, au focus, au toucher, quand l'onglet est caché et si l'utilisateur réduit les animations.
- Flèches : contour orange, remplies au survol ; au bout de la liste, elles reviennent au début.
- Points : le point actif s'allonge en pilule orange ; chaque point mène à sa position.
- Clavier : la piste est focalisable, flèches gauche et droite.

## Responsive

3 avis visibles dès 1100 px de conteneur, 2 dès 700 px, 1 en dessous. En mobile, la carte fait 88 % de large pour montrer la suivante.

## Règles de composition

Les avis viennent de Google : affichez-les tels quels, avec la date. Pour les tenir à jour, l'API Google Places (Place Details) renvoie jusqu'à 5 avis par fiche, triables par date.

## Exemple

```jsx
<ReviewCarousel items={reviews} interval={7000} />
```
