<?php
/**
 * Lecture de la configuration (constantes de wp-config.php). Aucun secret en base.
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

/**
 * URL publique du frontend Next.js, sans slash final, ou chaîne vide si non configurée.
 */
function alterpark_frontend_url(): string {
	$url = defined( 'ALTERPARK_FRONTEND_URL' ) ? (string) ALTERPARK_FRONTEND_URL : '';
	return untrailingslashit( esc_url_raw( $url ) );
}

/**
 * Secret partagé des webhooks de revalidation (32 caractères minimum), ou chaîne vide.
 */
function alterpark_revalidate_secret(): string {
	$secret = defined( 'ALTERPARK_REVALIDATE_SECRET' ) ? (string) ALTERPARK_REVALIDATE_SECRET : '';
	return strlen( $secret ) >= 32 ? $secret : '';
}

add_action(
	'admin_notices',
	static function (): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$missing = array();
		if ( '' === alterpark_frontend_url() ) {
			$missing[] = 'ALTERPARK_FRONTEND_URL';
		}
		if ( '' === alterpark_revalidate_secret() ) {
			$missing[] = 'ALTERPARK_REVALIDATE_SECRET (32 caractères minimum)';
		}
		if ( $missing ) {
			printf(
				'<div class="notice notice-error"><p>%s <code>%s</code></p></div>',
				esc_html__( 'Alterpark : constantes manquantes dans wp-config.php :', 'alterpark-headless' ),
				esc_html( implode( ', ', $missing ) )
			);
		}
	}
);
