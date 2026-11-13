<?php
/**
 * Plugin Name:       Alterpark Booking System
 * Description:       Parkings, disponibilités, tarifs, réservations et paiement Stripe pour ALTERPARK, exposés à un frontend headless via l'API signée apbs/v1. Indépendant du thème.
 * Version:           0.1.0
 * Requires at least: 6.6
 * Requires PHP:      8.1
 * Author:            Alterpark
 * Text Domain:       alterpark-booking
 * Domain Path:       /languages
 * License:           Propriétaire
 *
 * @package Alterpark\Booking
 */

defined( 'ABSPATH' ) || exit;

define( 'APBS_VERSION', '0.1.0' );
define( 'APBS_FILE', __FILE__ );
define( 'APBS_DIR', __DIR__ );

if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
} else {
	// Repli PSR-4 sans Composer (développement). Le ZIP de production embarque vendor/.
	spl_autoload_register(
		static function ( string $class ): void {
			$prefix = 'Alterpark\\Booking\\';
			if ( 0 !== strpos( $class, $prefix ) ) {
				return;
			}
			$file = __DIR__ . '/src/' . str_replace( '\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
			if ( is_readable( $file ) ) {
				require_once $file;
			}
		}
	);
}

register_activation_hook( __FILE__, array( \Alterpark\Booking\Install\Installer::class, 'activate' ) );

add_action( 'plugins_loaded', array( \Alterpark\Booking\Plugin::class, 'boot' ) );
