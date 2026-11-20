# ReviewCard

Carte d'avis client : guillemet orange, étoiles, extrait sur 5 lignes, puis auteur (avatar, nom, date) et logo de la source.

**Origine :** Repensé à la demande du client à partir des avis de la maquette (avatar, nom, étoiles, extrait, « Lire plus », logo Google).

## Quand l'utiliser

Dans `ReviewCarousel` ou une grille d'avis.

## Variantes

| Prop | Rôle |
|---|---|
| `name`, `text`, `rating` | auteur, texte, note sur 5 |
| `date` | date relative ou absolue (« il y a 2 semaines ») |
| `avatar` | photo ; sans photo, initiales sur une pastille de couleur |
| `href` | lien vers l'avis d'origine (« Lire l'avis ») ; sans lien, « Lire plus » déplie les textes de plus de 150 caractères |

## États

Survol : la carte remonte de 4 px et prend un liseré orange. Lien : survol souligné `primary-hover`, focus `shadow-focus`.

## Responsive

Remplit sa colonne ; hauteur égale dans le carrousel.

## Règles de composition

- Avis réels uniquement, avec leur date ; l'accord des auteurs est conseillé pour afficher leur photo.

## Exemple

```jsx
<ReviewCard name="Camille L." rating={5} date="il y a 2 semaines" text="…" />
```
