# Banner

Bandeau photo pleine largeur fondu dans le fond, suivi d'un contenu centré (logo partenaire, titre, texte, bouton).

**Origine :** Observé : Rallye du Cœur, photo 1920 × 435, `radius-lg`, dégradé `surface` → `overlay-hero` → `surface`, logo 366 × 69.

## Quand l'utiliser

Mettre en avant un partenariat ou un engagement.

## Variantes

Logo facultatif.

## États

Voir `Button`.

## Responsive

Hauteur de la photo 200 → 435 px (fluide).

## Règles de composition

- Un seul bandeau par page.
- Texte d'alternative du logo = nom du partenaire.

## Exemple

```jsx
<Banner logo={assets.rallyeLogo} logoAlt="Le Rallye du Cœur" title="ALTERPARK soutient le “Rallye du Cœur”" cta={{label:'En savoir +',href:'/rallye'}}>…</Banner>
```
