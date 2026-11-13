<?php
/**
 * Espace de noms alterpark/v1 (contenus et réglages publics du site).
 * Phase 1 : route de santé. Réglages, menus et sections arrivent en phase 4.
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	static function (): void {
		register_rest_route(
			'alterpark/v1',
			'/health',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => static fn() => rest_ensure_response(
					array(
						'theme'    => ALTERPARK_THEME_VERSION,
						'frontend' => '' !== alterpark_frontend_url(),
					)
				),
			)
		);
	}
);
