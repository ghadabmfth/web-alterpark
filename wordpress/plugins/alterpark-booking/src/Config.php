<?php
/**
 * Secrets lus uniquement depuis wp-config.php (jamais en base, jamais exposés à l'API).
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking;

defined( 'ABSPATH' ) || exit;

final class Config {

	/** Secret HMAC partagé avec Next.js (APBS_API_SECRET), 32 caractères minimum. */
	public static function api_secret(): string {
		return self::constant( 'APBS_API_SECRET', 32 );
	}

	/** Clé secrète Stripe (sk_test_… / sk_live_… ou clé restreinte rk_…). */
	public static function stripe_secret_key(): string {
		return self::constant( 'APBS_STRIPE_SECRET_KEY', 20 );
	}

	/** Secret de signature du webhook Stripe (whsec_…). */
	public static function stripe_webhook_secret(): string {
		return self::constant( 'APBS_STRIPE_WEBHOOK_SECRET', 20 );
	}

	public static function stripe_configured(): bool {
		return '' !== self::stripe_secret_key() && '' !== self::stripe_webhook_secret();
	}

	/**
	 * @return string[] Constantes manquantes ou trop courtes.
	 */
	public static function missing(): array {
		$missing = array();
		if ( '' === self::api_secret() ) {
			$missing[] = 'APBS_API_SECRET';
		}
		if ( '' === self::stripe_secret_key() ) {
			$missing[] = 'APBS_STRIPE_SECRET_KEY';
		}
		if ( '' === self::stripe_webhook_secret() ) {
			$missing[] = 'APBS_STRIPE_WEBHOOK_SECRET';
		}
		return $missing;
	}

	private static function constant( string $name, int $min_length ): string {
		$value = defined( $name ) ? (string) constant( $name ) : '';
		return strlen( $value ) >= $min_length ? $value : '';
	}
}
