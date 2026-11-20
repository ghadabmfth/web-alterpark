# Stars

Étoiles de notation jaunes `accent`.

**Origine :** Observé : glyphe étoile pleine (10 px dans le badge, 17 px dans les avis).

## Quand l'utiliser

Partout où une note est affichée.

## Variantes

`value`, `max`, `size` (`sm` 10 px, `md` 17 px).

## États

Aucun.

## Responsive

Taille fixe.

## Règles de composition

- Étoiles non pleines en `surface-raised`.
- `aria-label` « Note : n sur 5 » généré.

## Exemple

```jsx
<Stars value={5} size="md" />
```
