# AppShowcase

Visuel animé de l'application mobile de réservation ALTERPARK : deux téléphones dessinés en HTML/CSS/SVG, sans image.

**Origine :** Proposé. Remplace la capture des deux smartphones de la maquette (ancienne app) par une maquette de la future application de réservation, à reprendre lors de sa conception.

## Quand l'utiliser

Section « application mobile » de l'accueil, pages de lancement de l'app, à côté de `StoreBadges`. Une fois par page.

## Ce qu'il montre

- **Téléphone arrière, accueil de l'app :** prochain départ avec mini-billet, carte avec trajet animé et repère, état « Accueil ouvert 24h/24 », jauge de points fidélité, barre de navigation (Accueil, Réserver, Billets, Profil).
- **Téléphone avant, réservation en 4 étapes, en boucle de 16 s :**
  1. dates (calendrier, plage 12–20 août) ;
  2. véhicule (immatriculation saisie lettre à lettre, gabarit, passagers) ;
  3. récapitulatif (prix, remise fidélité, paiement) ;
  4. confirmation (coche dessinée, billet avec code).
- Deux pastilles flottantes : « Navette gratuite » et « − 12 € fidélité ».

## Variantes

| Prop | Rôle |
|---|---|
| `firstName` | prénom affiché (défaut « Claire », exemple fictif) |
| `badges` | `false` masque les pastilles flottantes |
| `label` | texte alternatif (le visuel est une image pour les lecteurs d'écran) |

## États

Animation continue : téléphones qui flottent, écrans qui glissent, saisie, coche. Avec « réduire les animations », tout s'arrête sur l'étape « Dates ».

## Responsive

Toutes les dimensions sont en `em`, rapportées à la largeur du conteneur (`cqw`) : le visuel garde ses proportions (684 × 738) de 300 à 684 px de large. Donnez-lui au moins 340 px.

## Règles de composition

- Les prix, dates et noms sont des exemples (ALTERECO 8 jours à 57,60 €, comme sur l'accueil) ; mettez-les à jour avec l'offre réelle.
- Le code du billet est décoratif, pas un vrai code QR.
- Couleurs : tokens du système (`surface`, `surface-raised`, `primary`, `accent`, `success`), donc un changement de token s'y applique.

## Exemple

```jsx
<MediaSection reverse title="ALTERPARK maintenant disponible sur Google Play & Apple Store !" media={<AppShowcase />}>…<StoreBadges /></MediaSection>
```
