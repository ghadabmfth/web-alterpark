# IconButton

Bouton sans libellé visible : flèches du carrousel et bouton de lecture vidéo.

**Origine :** Observé : flèches orange 27 px de part et d'autre des avis, disque orange 89 px avec triangle blanc sous les photos. Zone cliquable portée à 44 px (proposé).

## Quand l'utiliser

Quand l'icône est universelle et qu'un `label` décrit l'action pour les lecteurs d'écran.

## Variantes

| Prop | Valeurs |
|---|---|
| `variant` | `plain` (flèche) · `play` (disque) |
| `icon` | `arrowLeft` · `arrowRight` · nœud SVG |
| `label` | obligatoire |

## États

Hover (agrandissement, `primary-hover`) · Focus (`shadow-focus`) · Active (réduction) · Disabled (35 %).

## Responsive

Taille fixe à toutes les largeurs.

## Règles de composition

- `label` toujours renseigné (« Avis suivant », « Lire la vidéo de présentation »).
- `play` se pose sur `surface` ou à cheval sur une photo, jamais sur un fond orange.

## Exemple

```jsx
<IconButton icon="arrowRight" label="Avis suivant" onClick={next} />
<IconButton variant="play" label="Lire la vidéo" />
```
