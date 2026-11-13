<?php
/**
 * Mode headless : redirection du front vers Next.js, nettoyage des sorties inutiles.
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'template_redirect',
	static function (): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_preview() ) {
			return;
		}
		$frontend = alterpark_frontend_url();
		if ( '' === $frontend ) {
			return; // index.php répondra 404.
		}
		$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/', PHP_URL_PATH );
		wp_redirect( $frontend . ( $path ? $path : '/' ), 301, 'Alterpark' ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- domaine fixé par constante.
		exit;
	}
);

// Les liens « Voir » et la prévisualisation vers Next.js (Draft Mode) sont branchés en phase 4.

// Sorties front inutiles en headless.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'xmlrpc_enabled', '__return_false' );

// Pas d'énumération des comptes via l'API publique.
add_filter(
	'rest_endpoints',
	static function ( array $endpoints ): array {
		if ( ! current_user_can( 'list_users' ) ) {
			unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		}
		return $endpoints;
	}
);

add_action(
	'after_setup_theme',
	static function (): void {
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'title-tag' );
		register_nav_menus(
			array(
				'header-left'  => __( 'En-tête, moitié gauche', 'alterpark-headless' ),
				'header-right' => __( 'En-tête, moitié droite', 'alterpark-headless' ),
				'footer'       => __( 'Pied de page', 'alterpark-headless' ),
			)
		);
	}
);
