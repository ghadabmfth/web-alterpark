# Alert

Message de retour : succès, information, avertissement, erreur.

**Origine :** Proposé.

## Quand l'utiliser

Confirmation de réservation, erreur de paiement, information pratique.

## Variantes

`tone` : `success` · `info` · `warning` · `error` ; `title` (défaut : le mot du ton) ; `dismissible`.

## États

Bouton fermer : survol, focus. `role="alert"` pour erreur et avertissement, `status` sinon.

## Responsive

Pleine largeur de son conteneur.

## Règles de composition

- Toujours icône + mot : la couleur n'est jamais seule porteuse du sens.
- Couleurs : `*-soft` en fond, ton en bordure, icône et titre.

## Exemple

```jsx
<Alert tone="success" title="Réservation confirmée">Votre place est réservée.</Alert>
```
