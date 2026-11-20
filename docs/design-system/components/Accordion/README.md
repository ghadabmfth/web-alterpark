# Accordion

Liste de questions dépliables, séparées par le filet pointillé de la marque.

**Origine :** Proposé (FAQ, détail des tarifs, conditions). Le filet reprend les séparateurs des étapes.

## Quand l'utiliser

FAQ, conditions, détails optionnels.

## Variantes

`multiple` permet plusieurs panneaux ouverts ; `defaultOpen` ouvre un ou plusieurs index.

## États

En-tête : Default blanc · Hover `primary-hover` · Ouvert `primary`, chevron retourné · Focus `shadow-focus`.

## Responsive

Pleine largeur ; texte du panneau en `lh-body`.

## Règles de composition

- Question en en-tête, réponse courte dans le panneau.
- `headingAs` suit la hiérarchie de la page.

## Exemple

```jsx
<Accordion items={[{title:'La navette est-elle gratuite ?',content:'Oui…'}]} />
```
