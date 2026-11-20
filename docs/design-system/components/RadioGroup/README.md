# RadioGroup

Choix unique dans un `fieldset`.

**Origine :** Proposé.

## Quand l'utiliser

2 à 5 options exclusives (type de véhicule).

## Variantes

Options désactivables.

## États

Comme `Checkbox` ; point `surface` sur fond `primary`.

## Responsive

Empilé à toutes les largeurs.

## Règles de composition

- Toujours une `legend`.

## Exemple

```jsx
<RadioGroup legend="Type de véhicule" options={['Citadine','SUV']} />
```
