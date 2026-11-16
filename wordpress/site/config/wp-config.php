<?php
/**
 * Configuration WordPress d'ALTERPARK (copiée à la racine du site par wordpress/bin/build-site.sh).
 *
 * Aucun secret ici : chaque valeur vient d'une variable d'environnement du serveur ou, à défaut,
 * du fichier wp-config-secrets.php placé à côté de ce fichier sur le serveur (jamais versionné,
 * jamais inclus dans le ZIP). Modèle : wp-config-secrets.sample.php.
 *
 * @package Alterpark
 */

if ( is_readable( __DIR__ . '/wp-config-secrets.php' ) ) {
	require __DIR__ . '/wp-config-secrets.php';
}

/**
 * Définit une constante depuis l'environnement si elle n'est pas déjà définie par le fichier de secrets.
 *
 * @param string      $name     Nom de la constante et de la variable d'environnement.
 * @param string|null $fallback Valeur par défaut (null : obligatoire).
 */
function alterpark_config( string $name, ?string $fallback = null ): void {
	if ( defined( $name ) ) {
		return;
	}
	$value = getenv( $name );
	if ( false === $value || '' === $value ) {
		$value = $fallback;
	}
	if ( null === $value ) {
		header( 'HTTP/1.1 503 Service Unavailable' );
		exit( 'Configuration incomplète : ' . htmlspecialchars( $name, ENT_QUOTES ) . ' manquante (voir wp-config-secrets.sample.php).' );
	}
	define( $name, $value );
}

// Base de données (MySQL 8 ou MariaDB 10.6+, InnoDB).
alterpark_config( 'DB_NAME' );
alterpark_config( 'DB_USER' );
alterpark_config( 'DB_PASSWORD' );
alterpark_config( 'DB_HOST', 'localhost' );
alterpark_config( 'DB_CHARSET', 'utf8mb4' );
alterpark_config( 'DB_COLLATE', '' );

// Clés et sels d'authentification : https://api.wordpress.org/secret-key/1.1/salt/
foreach ( array( 'AUTH_KEY', 'SECURE_AUTH_KEY', 'LOGGED_IN_KEY', 'NONCE_KEY', 'AUTH_SALT', 'SECURE_AUTH_SALT', 'LOGGED_IN_SALT', 'NONCE_SALT' ) as $alterpark_key ) {
	alterpark_config( $alterpark_key );
}

// Liaison avec Next.js (Vercel) : voir docs/INSTALL.md.
alterpark_config( 'ALTERPARK_FRONTEND_URL' );
alterpark_config( 'ALTERPARK_REVALIDATE_SECRET' );
alterpark_config( 'APBS_API_SECRET' );
// Stripe : facultatif tant que le paiement n'est pas branché (phase 5).
alterpark_config( 'APBS_STRIPE_SECRET_KEY', '' );
alterpark_config( 'APBS_STRIPE_WEBHOOK_SECRET', '' );

// Environnement : production, staging, development ou local.
alterpark_config( 'WP_ENVIRONMENT_TYPE', 'production' );

$table_prefix = getenv( 'WP_TABLE_PREFIX' ) ? getenv( 'WP_TABLE_PREFIX' ) : 'wp_'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

// Sécurité : pas d'éditeur de fichiers dans l'admin, HTTPS obligatoire pour l'admin.
define( 'DISALLOW_FILE_EDIT', true );
define( 'FORCE_SSL_ADMIN', 'production' === WP_ENVIRONMENT_TYPE );

// Le cron WordPress est remplacé par un cron système toutes les minutes (docs/INSTALL.md).
if ( ! defined( 'DISABLE_WP_CRON' ) ) {
	define( 'DISABLE_WP_CRON', 'production' === WP_ENVIRONMENT_TYPE );
}

// Journalisation : jamais d'affichage des erreurs en production.
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', 'production' !== WP_ENVIRONMENT_TYPE );
}
define( 'WP_DEBUG_DISPLAY', false );
define( 'WP_DEBUG_LOG', WP_DEBUG );

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
