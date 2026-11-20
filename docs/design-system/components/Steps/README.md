# Steps

Suite d'étapes numérotées : pictogramme orange, grand chiffre fantôme, titre en Crossroads, légende, filets pointillés.

**Origine :** Observé deux fois : hero (4 étapes, pictos 80 px, titre 26/23, légende Nunito Light 16/33, chiffre 115 px) et fidélité (3 étapes, pictos 75 px, titre 30/27, texte Montserrat Light 18/30, chiffre 130 px).

## Quand l'utiliser

Pour un processus en 3 ou 4 temps. Au-delà de 4, utilisez une liste.

## Variantes

`variant` : `hero` · `loyalty`. Les numéros sont générés.

## États

Aucun (non interactif).

## Responsive

≥ 1024 px : une ligne, filets pointillés (tirets 3/5 `border-divider`) entre les étapes. 768–1023 : 2 colonnes. < 768 : 1 colonne, sans filets. Chiffre `fs-numeral`.

## Règles de composition

- Pictogrammes du groupe Icons uniquement.
- Le chiffre est décoratif (`numeral-ghost`) ; l'étape est annoncée par un texte masqué « Étape n : ».

## Exemple

```jsx
<Steps variant="loyalty" items={[{icon:assets.fideliteCumulez,title:'Cumulez',text:'…'}]} />
```
