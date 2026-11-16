<?php
/**
 * MODÈLE. Sur le serveur, copiez ce fichier en wp-config-secrets.php (à côté de wp-config.php),
 * remplissez-le, puis protégez-le (chmod 640). Ne le versionnez jamais.
 * Si votre hébergeur permet les variables d'environnement, vous pouvez les utiliser à la place :
 * mêmes noms, ce fichier devient inutile.
 *
 * Générer un secret : openssl rand -hex 32
 *
 * @package Alterpark
 */

// Base de données (fournie par l'hébergeur).
define( 'DB_NAME', '' );
define( 'DB_USER', '' );
define( 'DB_PASSWORD', '' );
define( 'DB_HOST', 'localhost' );

// Clés et sels : copiez le résultat de https://api.wordpress.org/secret-key/1.1/salt/
define( 'AUTH_KEY', '' );
define( 'SECURE_AUTH_KEY', '' );
define( 'LOGGED_IN_KEY', '' );
define( 'NONCE_KEY', '' );
define( 'AUTH_SALT', '' );
define( 'SECURE_AUTH_SALT', '' );
define( 'LOGGED_IN_SALT', '' );
define( 'NONCE_SALT', '' );

// Liaison Next.js : mêmes valeurs que les variables Vercel APBS_API_SECRET et REVALIDATE_SECRET.
define( 'ALTERPARK_FRONTEND_URL', 'https://www.alterpark.fr' );
define( 'ALTERPARK_REVALIDATE_SECRET', '' );
define( 'APBS_API_SECRET', '' );

// Stripe (phase 5) : clé restreinte rk_live_… et secret du webhook whsec_…
define( 'APBS_STRIPE_SECRET_KEY', '' );
define( 'APBS_STRIPE_WEBHOOK_SECRET', '' );

// production, staging, development ou local.
define( 'WP_ENVIRONMENT_TYPE', 'production' );
