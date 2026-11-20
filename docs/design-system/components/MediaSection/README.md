# MediaSection

Section deux colonnes : titre, texte et bouton d'un côté, visuel de l'autre.

**Origine :** Observé : texte 778 px (`container-col`) + collage photo (`radius-xl`, `shadow-photo`), badge de note et bouton lecture ; section application avec l'ordre inversé.

## Quand l'utiliser

Présenter une nouveauté, un service, l'application.

## Variantes

`reverse` place le visuel à gauche. `media` accepte n'importe quel nœud (photo, collage, capture).

## États

Voir `Button`.

## Responsive

≥ 1024 px : 2 colonnes, gouttière `space-16`. En dessous : texte puis visuel, empilés.

## Règles de composition

- Photos en `ap-photo` (`radius-xl` + `shadow-photo`) avec un `alt` descriptif.
- Un seul bouton.

## Exemple

```jsx
<MediaSection title="…" media={<img className="ap-photo" src={assets.entreePhoto} alt="Entrée du parking" />} cta={{label:'Découvrez nos services +',href:'/services'}}>…</MediaSection>
```
