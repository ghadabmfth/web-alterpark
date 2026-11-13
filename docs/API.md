# API

Toutes les routes `apbs/v1` exigent les en-têtes `X-APBS-Timestamp` et `X-APBS-Signature` (voir `ARCHITECTURE.md`). La spécification OpenAPI complète sera publiée en phase 6.

| Méthode | Route | Phase | Rôle |
|---|---|---|---|
| GET | `alterpark/v1/health` | 1 ✓ | Santé du thème (publique) |
| GET | `apbs/v1/health` | 1 ✓ | Santé du plugin, version du schéma, Stripe configuré |
| GET | `alterpark/v1/site` | 4 | Identité, header, footer, coordonnées, SEO global |
| GET | `alterpark/v1/pages/{slug}` | 4 | Page et sections actives |
| GET | `apbs/v1/parkings` | 5 | Parkings publiés et informations pratiques |
| POST | `apbs/v1/quotes` | 5 | Disponibilités et offres tarifées, devis signés |
| POST | `apbs/v1/holds` | 5 | Blocage de place et PaymentIntent |
| GET | `apbs/v1/bookings/{reference}` | 5 | Statut d'une réservation (jeton d'accès requis) |
| POST | `apbs/v1/stripe/webhook` | 5 | Webhook Stripe (signature Stripe, non HMAC) |
| GET/POST | `apbs/v1/account/*` | 6 | Compte client : réservations, profil, annulation |
