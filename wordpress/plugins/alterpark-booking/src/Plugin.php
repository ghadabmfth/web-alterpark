<?php
/**
 * Point d'entrée du plugin.
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking;

use Alterpark\Booking\Install\Installer;
use Alterpark\Booking\Rest\Controllers\HealthController;

defined( 'ABSPATH' ) || exit;

final class Plugin {

	public const REST_NAMESPACE = 'apbs/v1';

	public static function boot(): void {
		load_plugin_textdomain( 'alterpark-booking', false, dirname( plugin_basename( APBS_FILE ) ) . '/languages' );

		// Mise à jour du schéma après une mise à jour du plugin (sans réactivation).
		Installer::maybe_upgrade();

		add_action( 'rest_api_init', array( self::class, 'register_routes' ) );
		add_action( 'admin_notices', array( self::class, 'config_notice' ) );
	}

	public static function register_routes(): void {
		( new HealthController() )->register();
	}

	public static function config_notice(): void {
		if ( ! current_user_can( 'apbs_manage_settings' ) ) {
			return;
		}
		$missing = Config::missing();
		if ( $missing ) {
			printf(
				'<div class="notice notice-error"><p>%s <code>%s</code></p></div>',
				esc_html__( 'Alterpark Booking : constantes manquantes dans wp-config.php :', 'alterpark-booking' ),
				esc_html( implode( ', ', $missing ) )
			);
		}
	}
}
