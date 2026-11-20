# RatingBadge

Badge de note Google en forme de bulle : pilule blanche avec une queue en bas à gauche, logo dans un cercle, note (« 4,4/5 »), étoiles remplies au dixième près, nombre d'avis.

**Origine :** Repris du badge de la maquette (logo G, « EXCELLENT », 5 étoiles, « Basée sur 843 avis », contour orange) et modernisé à la demande du client.

## Quand l'utiliser

Près des avis clients ou sur une photo, comme preuve sociale. Une à deux fois par page.

## Variantes

| Prop | Rôle |
|---|---|
| `count` | nombre d'avis (réel, issu de Google) |
| `rating` | note sur 5 ; les étoiles se remplissent au dixième (4,4 → 4 étoiles et 40 % de la cinquième) |
| `label` | remplace la note affichée (texte libre) |
| `size` | `mini` : bulle compacte à pointe haute, sans animation d'entrée, pour une info-bulle (survol du logo du header) |
| `href` | rend la carte cliquable (flèche, survol), par exemple vers la fiche Google ou la section avis |
| `source`, `sourceLogo` | autre plateforme d'avis |

## Animation

- À l'entrée dans l'écran, une seule fois : la bulle surgit depuis sa queue avec un rebond, les étoiles s'affichent une à une et le nombre d'avis défile de 0 à `count` (1,2 s).
- En continu et discret : la bulle flotte doucement (4,5 s) et une onde orange part du logo toutes les 3 s, comme une notification.
- Avec « réduire les animations » : tout s'affiche directement, sans mouvement.

## États

Avec `href` : une pastille orange à flèche s'ajoute à droite ; au survol et au focus, un halo orange entoure la bulle et la flèche avance. Sans `href`, la carte n'est pas interactive.

## Responsive

Taille fixe (≈ 270 × 72 px, plus la queue) ; le texte ne passe pas à la ligne. Laissez 12 px libres sous la bulle pour la queue.

## Règles de composition

- N'affichez que des données réelles (note et nombre d'avis issus de la fiche Google, 4,4 et 1 375 en novembre 2026), et mettez-les à jour.
- Le nombre est lu une seule fois par les lecteurs d'écran (le défilement est masqué).

## Exemple

```jsx
<RatingBadge rating={4.4} count={1375} href="#avis" />
```
