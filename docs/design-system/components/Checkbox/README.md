# Checkbox

Case à cocher.

**Origine :** Proposé.

## Quand l'utiliser

Consentement (CGV), options indépendantes.

## Variantes

Une seule ; `invalid` pour l'erreur.

## États

Default · Hover · Cochée (`primary`, coche `surface`) · Focus (`shadow-focus`) · Erreur (bordure `error`) · Disabled.

## Responsive

Zone cliquable = case + libellé.

## Règles de composition

- Le message d'erreur va sous le groupe, avec icône.

## Exemple

```jsx
<Checkbox label="J’accepte les CGV" required />
```
