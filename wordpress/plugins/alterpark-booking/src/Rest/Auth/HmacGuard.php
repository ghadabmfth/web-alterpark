<?php
/**
 * Authentification des appels serveur Next.js -> WordPress.
 * Chaîne signée identique à apps/web/src/lib/signature.ts :
 * "<timestamp>\n<MÉTHODE>\n<route>\n<sha256 hex du corps>", HMAC-SHA256 avec APBS_API_SECRET.
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking\Rest\Auth;

use Alterpark\Booking\Config;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

final class HmacGuard {

	public const TTL_SECONDS = 300;

	/**
	 * À utiliser comme permission_callback des routes apbs/v1.
	 *
	 * @return true|WP_Error
	 */
	public static function check( WP_REST_Request $request ) {
		$secret = Config::api_secret();
		if ( '' === $secret ) {
			return new WP_Error( 'apbs_not_configured', __( 'API non configurée.', 'alterpark-booking' ), array( 'status' => 503 ) );
		}

		$timestamp = (int) $request->get_header( 'x_apbs_timestamp' );
		$signature = strtolower( (string) $request->get_header( 'x_apbs_signature' ) );

		if ( abs( time() - $timestamp ) > self::TTL_SECONDS || ! preg_match( '/^[a-f0-9]{64}$/', $signature ) ) {
			return self::denied();
		}

		$canonical = $timestamp . "\n" . strtoupper( $request->get_method() ) . "\n" . $request->get_route() . "\n" . hash( 'sha256', (string) $request->get_body() );
		if ( ! hash_equals( hash_hmac( 'sha256', $canonical, $secret ), $signature ) ) {
			return self::denied();
		}

		// Anti-rejeu : une signature n'est acceptée qu'une fois pendant sa fenêtre de validité.
		$key = 'apbs_sig_' . substr( $signature, 0, 40 );
		if ( false !== get_transient( $key ) ) {
			return self::denied();
		}
		set_transient( $key, 1, self::TTL_SECONDS * 2 );

		return true;
	}

	private static function denied(): WP_Error {
		return new WP_Error( 'apbs_unauthorized', __( 'Requête non autorisée.', 'alterpark-booking' ), array( 'status' => 401 ) );
	}
}
