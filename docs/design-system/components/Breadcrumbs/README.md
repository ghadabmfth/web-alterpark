# Breadcrumbs

Fil d'Ariane des pages intérieures.

**Origine :** Proposé (absent de la maquette, qui n'a qu'une page).

## Quand l'utiliser

Sur toute page de niveau 2 ou plus (tarifs, services, contact), sous le header, avant le titre.

## Variantes

Une seule.

## États

Lien `primary`, survol souligné `primary-hover`, focus `shadow-focus`. Page courante `text-secondary` avec `aria-current="page"`.

## Responsive

Passe à la ligne si besoin ; `body-sm` à toutes les largeurs.

## Règles de composition

- Le dernier élément n'est pas un lien.
- Séparateur chevron orange, décoratif.

## Exemple

```jsx
<Breadcrumbs items={[{label:'Accueil',href:'/'},{label:'Services Plus',href:'/services'},{label:'Recharge électrique'}]} />
```
