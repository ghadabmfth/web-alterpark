<?php
/**
 * Webhook signé vers Next.js (/api/revalidate) quand un contenu change.
 * Signature identique à apps/web/src/lib/signature.ts.
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

/**
 * Envoie une demande d'invalidation de tags au frontend (non bloquant).
 *
 * @param string[] $tags Tags de cache Next.js.
 */
function alterpark_revalidate( array $tags ): void {
	$frontend = alterpark_frontend_url();
	$secret   = alterpark_revalidate_secret();
	$tags     = array_values( array_unique( array_filter( $tags, static fn( $t ) => (bool) preg_match( '/^[a-z0-9:_-]{1,64}$/', (string) $t ) ) ) );
	if ( '' === $frontend || '' === $secret || ! $tags ) {
		return;
	}

	$path      = '/api/revalidate';
	$body      = (string) wp_json_encode( array( 'tags' => $tags ) );
	$timestamp = time();
	$canonical = $timestamp . "\nPOST\n" . $path . "\n" . hash( 'sha256', $body );

	$response = wp_remote_post(
		$frontend . $path,
		array(
			'timeout'  => 5,
			'blocking' => false,
			'headers'  => array(
				'Content-Type'           => 'application/json',
				'X-Alterpark-Timestamp'  => (string) $timestamp,
				'X-Alterpark-Signature'  => hash_hmac( 'sha256', $canonical, $secret ),
			),
			'body'     => $body,
		)
	);
	if ( is_wp_error( $response ) ) {
		error_log( 'Alterpark revalidate : ' . $response->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
}

add_action(
	'save_post',
	static function ( int $post_id, WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) || 'publish' !== $post->post_status ) {
			return;
		}
		alterpark_revalidate( array( 'wp:' . $post->post_type, 'wp:' . $post->post_type . ':' . $post->post_name, 'wp:sitemap' ) );
	},
	10,
	2
);

add_action(
	'wp_update_nav_menu',
	static function (): void {
		alterpark_revalidate( array( 'wp:menus' ) );
	}
);
