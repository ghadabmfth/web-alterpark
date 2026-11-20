# Button

Bouton d'action en pilule, orange par défaut, pour l'action principale d'une section (réserver, découvrir, en savoir plus).

**Origine :** `primary` observé (5 occurrences, 64 px de haut, `radius-pill`, Montserrat Bold 20, padding 40–46 px unifié à `space-10`). `secondary`, `outline`, `ghost`, la taille `sm` et tous les états sont proposés.

## Quand l'utiliser

- `primary` : l'action attendue de la section ; un seul par section.
- `secondary` (blanc) : action forte sur une photo ou à côté d'un `primary` dans une modale.
- `outline` : action secondaire à côté d'un `primary`.
- `ghost` : action tertiaire, annulation, liens d'action dans une barre.

## Variantes

| Prop | Valeurs |
|---|---|
| `variant` | `primary` · `secondary` · `outline` · `ghost` |
| `size` | `md` (64 px) · `sm` (48 px) |
| `href` | rend un lien `<a>` |
| `fullWidth` | largeur 100 % (menu mobile, formulaires mobiles) |
| `iconStart` / `iconEnd` | nœud SVG `icon-xs` |

## États

Effet cercle au survol : un disque part du point d'entrée du pointeur et remplit le bouton (blanc sur `primary` et `outline`, avec le texte qui passe en orange ; gris clair sur `secondary` ; anthracite sur la loupe de `BookingBar`), puis se retire par le point de sortie. Partagé avec le bouton loupe de `BookingBar` et les flèches du carrousel ; instantané si l'utilisateur réduit les animations.


Default · Hover (`primary-hover`) · Focus (`shadow-focus`) · Active (`primary-active`, décalage 1 px) · Disabled (opacité 45 %, `aria-disabled` sur un lien).

⚠ Le texte blanc `on-primary` sur `primary` fait 2,32:1 (observé). Pour passer WCAG AA, changez `on-primary` en `#313131` dans tokens.json : tous les boutons suivent.

## Responsive

`md` de 768 px et plus ; `sm` ou `fullWidth` dans le menu mobile et les formulaires étroits. Le libellé ne passe jamais à la ligne (`white-space: nowrap`) : gardez-le court.

## Règles de composition

- Verbe d'action, première personne ou impératif, comme la maquette : « Réservez ma place ! », « Découvrez nos services + », « En savoir + ».
- La flèche orange du bouton de la maquette était invisible (orange sur orange) : elle n'est pas reprise.
- Centré sous un contenu centré ; aligné à gauche sous une colonne de texte ; aligné à droite en fin de section droite (section fidélité).

## Exemple

```jsx
<Button href="/reservation">Réservez ma place !</Button>
<Button variant="outline" size="sm">En savoir +</Button>
```
