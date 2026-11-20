# TextField

Champ de saisie avec libellé, aide et message : texte, e-mail, mot de passe, téléphone, zone de texte.

**Origine :** Proposé : la maquette n'a aucun formulaire. Style aligné sur la marque (`surface-raised`, `border-2`, `radius-md`, focus orange + `shadow-focus`).

## Quand l'utiliser

Réservation, contact, compte client.

## Variantes

`type` : `text` · `email` · `password` (bouton Afficher/Masquer) · `tel` · `number` · `date` ; `multiline` pour une zone de texte.

## États

Default · Hover (bordure `text-secondary`) · Focus (bordure `primary` + anneau) · Erreur (`error`, icône + message, `aria-invalid`) · Succès (`success`, icône + message) · Disabled (50 %).

## Responsive

Largeur max 480 px ; 100 % de la colonne en mobile. Hauteur 56 px (zone tactile).

## Règles de composition

- Libellé toujours visible ; le placeholder n'est qu'un exemple.
- Message d'erreur qui dit comment corriger, relié par `aria-describedby`.
- Champ obligatoire : astérisque orange + `required`.

## Exemple

```jsx
<TextField label="E-mail" type="email" required error={errors.email} />
```
