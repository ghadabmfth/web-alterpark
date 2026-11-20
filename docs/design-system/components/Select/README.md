# Select

Liste déroulante native stylée.

**Origine :** Proposé.

## Quand l'utiliser

Choix parmi 4 à 15 options (formule, nombre de passagers). Moins de 4 : `RadioGroup`.

## Variantes

`options` (texte ou `{value,label}`), `placeholder`.

## États

Mêmes états que `TextField`.

## Responsive

Comme `TextField`.

## Règles de composition

- Menu natif pour l'accessibilité et le mobile.

## Exemple

```jsx
<Select label="Formule" options={['Standard','ALTERECO']} />
```
