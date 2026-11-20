# SocialRail

Rail d'onglets fixé au bord droit : Facebook, espace client, YouTube.

**Origine :** Observé : 3 onglets 56 × 60, `radius-sm` côté page, `shadow-tab`, fonds `surface` / `primary` / blanc.

## Quand l'utiliser

Sur toutes les pages, une fois.

## Variantes

Chaque onglet a un `tone` : `dark`, `primary`, `light`. `fixed={false}` pour l'afficher dans le flux.

## États

Hover : glisse de 8 px vers la gauche. Focus : `shadow-focus`.

## Responsive

À masquer sous 768 px si le panneau mobile reprend ces liens (proposé) ; sinon garder tel quel, il reste hors du contenu.

## Règles de composition

- `label` obligatoire (nom accessible).
- Icône blanche sur `dark` et `primary`, orange sur `light` (fichiers du groupe Icons).

## Exemple

```jsx
<SocialRail items={[{label:'Facebook',href:'https://facebook.com/…',icon:assets.facebook,tone:'dark'}]} />
```
