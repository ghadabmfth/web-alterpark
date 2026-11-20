# Modal

Fenêtre de dialogue au-dessus d'un voile.

**Origine :** Proposé.

## Quand l'utiliser

Confirmation d'une action irréversible, détail court. Pas pour du contenu long.

## Variantes

`footer` pour les boutons ; `inline` pour la documentation.

## États

Ouverture : focus sur le premier élément, focus piégé, Échap et clic sur le voile ferment, retour du focus à l'élément d'origine.

## Responsive

Largeur max 560 px ; marges `space-4` en mobile ; défile si trop haute.

## Règles de composition

- Action principale à droite, en `primary` ; annulation en `ghost`.
- Titre explicite, sous forme de question pour une confirmation.

## Exemple

```jsx
<Modal open={open} title="Annuler la réservation ?" onClose={close} footer={<><Button variant="ghost" size="sm">Garder ma place</Button><Button size="sm">Annuler</Button></>}>…</Modal>
```
