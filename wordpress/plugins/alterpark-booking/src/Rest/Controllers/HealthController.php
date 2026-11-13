<?php
/**
 * GET apbs/v1/health : vérifie la liaison signée et l'état de la configuration.
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking\Rest\Controllers;

use Alterpark\Booking\Config;
use Alterpark\Booking\Install\Installer;
use Alterpark\Booking\Plugin;
use Alterpark\Booking\Rest\Auth\HmacGuard;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

final class HealthController {

	public function register(): void {
		register_rest_route(
			Plugin::REST_NAMESPACE,
			'/health',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => array( HmacGuard::class, 'check' ),
				'callback'            => array( $this, 'show' ),
			)
		);
	}

	public function show(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'plugin'            => APBS_VERSION,
				'db_version'        => (string) get_option( Installer::DB_VERSION_OPTION, '' ),
				'stripe_configured' => Config::stripe_configured(),
			)
		);
	}
}
