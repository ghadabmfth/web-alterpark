=== Alterpark Booking System ===
Requires at least: 6.6
Requires PHP: 8.1
Stable tag: 0.1.0
License: Propriétaire

Parkings, disponibilités, tarifs, réservations et paiement Stripe pour ALTERPARK. API signée apbs/v1 pour un frontend headless. Fonctionne sans le thème Alterpark.

== Installation ==
1. Ajouter à wp-config.php : APBS_API_SECRET (32 caractères min.), APBS_STRIPE_SECRET_KEY, APBS_STRIPE_WEBHOOK_SECRET.
2. Téléverser le ZIP dans Extensions > Ajouter, puis activer.
3. Compléter les parkings Roissy, Nantes et Marseille (créés en brouillon) : adresse, capacité, horaires, offres et tarifs.

Voir docs/INSTALL.md dans le dépôt.
