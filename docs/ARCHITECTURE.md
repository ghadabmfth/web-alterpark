# Architecture

## Vue d'ensemble

```
Navigateur ──HTTPS──▶ Next.js (Vercel)
                       │  pages : SSR / ISR, tags de cache
                       │  Server Actions et Route Handlers (BFF)
                       │
                       ├──GET public──────────▶ WordPress  /wp-json/alterpark/v1   (thème : réglages, menus, pages)
                       └──signé HMAC──────────▶ WordPress  /wp-json/apbs/v1        (plugin : parkings, devis, réservations)

WordPress ──webhook signé──▶ Next.js /api/revalidate    (invalidation ISR ciblée)
Navigateur ──Payment Element──▶ Stripe ──webhook──▶ WordPress /wp-json/apbs/v1/stripe/webhook
```

## Cache et fraîcheur

Les contenus publics sont mis en cache par Next.js avec des tags (`wp:page:<slug>`, `wp:menus`, `apbs:parkings`…). À chaque enregistrement, WordPress appelle `/api/revalidate` avec la liste des tags ; seules les pages concernées sont régénérées. Les données transactionnelles (disponibilités, devis, réservations, compte) ne sont jamais mises en cache.

## Données de réservation

Les tables sont décrites dans `wordpress/plugins/alterpark-booking/src/Install/Schema.php`. Principes : dates en UTC, montants en centimes entiers, prix figé dans la réservation (`price_snapshot`), historique de chaque changement (`booking_log`).

Les parkings Roissy, Nantes et Marseille sont créés en brouillon à l'activation. Ils ne deviennent réservables qu'une fois l'adresse, la capacité, les horaires, les offres et les tarifs réels saisis : aucune donnée simulée.

### Anti double réservation

`apbs_occupancy` contient une ligne par parking et par jour (places réservées, bloquées pendant un paiement, fermées). Pour bloquer des places :

1. ouverture d'une transaction ;
2. `INSERT IGNORE` des lignes de jours manquantes, puis `SELECT … FOR UPDATE` de toutes les lignes de la période ;
3. vérification que `booked + held + blocked + 1 <= capacité` pour chaque jour ;
4. incrément de `held`, création du blocage (`apbs_holds`), validation.

Deux clients sur la dernière place sont donc sérialisés par le verrou de ligne : le second voit la place prise. La clé d'idempotence (unique sur `apbs_holds`) neutralise les doubles clics et rejeux réseau. Un test de charge concurrent sur la dernière place fait partie de la recette.

## Paiement (Stripe)

1. **Recherche.** Next.js appelle `POST apbs/v1/quotes` (parking, dates). Le plugin calcule disponibilités et prix et renvoie les offres, chacune avec un devis signé et daté (15 min) : le client ne peut modifier ni le prix ni les dates.
2. **Blocage.** Après saisie des coordonnées, une Server Action appelle `POST apbs/v1/holds` (devis, client, clé d'idempotence). Le plugin bloque la place (voir ci-dessus, durée paramétrable par parking, 20 min par défaut) et crée un PaymentIntent Stripe du montant calculé côté serveur, avec l'identifiant du blocage en métadonnées et la même clé d'idempotence. Il renvoie le `client_secret`.
3. **Paiement.** Le navigateur affiche le Payment Element (carte, Apple Pay, Google Pay ; 3-D Secure géré par Stripe), stylé avec les tokens du design system via l'API Appearance. La clé publiable est la seule clé Stripe côté navigateur.
4. **Confirmation.** Stripe appelle `POST apbs/v1/stripe/webhook`. Le plugin vérifie la signature Stripe, ignore les événements déjà traités (`apbs_stripe_events`), puis sur `payment_intent.succeeded`, dans une transaction : blocage converti, `held` → `booked`, réservation `confirmed`, entrée d'historique. Les e-mails client et administrateur partent ensuite en tâche asynchrone.
5. **Retour.** La page de confirmation interroge le statut de la réservation par référence et jeton d'accès (stocké haché), jusqu'à la confirmation par le webhook.

Cas limites traités :

- paiement échoué ou abandonné : le blocage expire (tâche planifiée toutes les minutes), les places sont libérées et le PaymentIntent annulé ;
- paiement réussi après expiration du blocage : si une place reste libre, la réservation est confirmée ; sinon remboursement automatique intégral et alerte administrateur ;
- annulation ou modification depuis le back-office : remboursement total ou partiel via l'API Refunds selon les CGV, tracé dans l'historique.

Clés : `APBS_STRIPE_SECRET_KEY` (clé restreinte recommandée : PaymentIntents, Refunds, Customers) et `APBS_STRIPE_WEBHOOK_SECRET` dans `wp-config.php` ; `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sur Vercel.

## Sécurité

- Validation par schéma : Zod côté Next.js, `args` et `validate_callback` côté REST WordPress.
- Requêtes SQL via `$wpdb->prepare` uniquement ; échappement à l'affichage dans l'admin.
- Capacités dédiées : `apbs_manage_bookings` (rôle Opérateur parking) et `apbs_manage_settings`.
- Limitation de débit : middleware Next.js par IP sur les routes de réservation, plus limitation côté plugin.
- Cloudflare Turnstile sur la création de blocage et la connexion.
- Énumération des utilisateurs WordPress désactivée, XML-RPC désactivé.
- En-têtes de sécurité définis dans `next.config.ts` ; politique CSP stricte ajoutée en phase 8 avec les domaines Stripe.
