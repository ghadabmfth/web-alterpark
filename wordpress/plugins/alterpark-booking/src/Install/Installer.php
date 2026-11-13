<?php
/**
 * Activation et migrations.
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking\Install;

defined( 'ABSPATH' ) || exit;

final class Installer {

	public const DB_VERSION_OPTION = 'apbs_db_version';

	/** Les trois sites d'ALTERPARK. Créés en brouillon : capacité, adresse et tarifs sont saisis dans l'admin. */
	private const PARKINGS = array(
		'roissy'    => 'Roissy',
		'nantes'    => 'Nantes',
		'marseille' => 'Marseille',
	);

	public static function activate(): void {
		self::migrate();
		self::add_capabilities();
		self::seed_parkings();
	}

	public static function maybe_upgrade(): void {
		if ( get_option( self::DB_VERSION_OPTION ) !== Schema::VERSION ) {
			self::migrate();
		}
	}

	private static function migrate(): void {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		foreach ( Schema::tables() as $sql ) {
			dbDelta( $sql );
		}
		update_option( self::DB_VERSION_OPTION, Schema::VERSION, false );
	}

	private static function add_capabilities(): void {
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( 'apbs_manage_bookings' );
			$admin->add_cap( 'apbs_manage_settings' );
		}
		// Personnel des parkings : gère les réservations sans être administrateur.
		if ( ! get_role( 'apbs_operator' ) ) {
			add_role(
				'apbs_operator',
				__( 'Opérateur parking', 'alterpark-booking' ),
				array(
					'read'                 => true,
					'apbs_manage_bookings' => true,
				)
			);
		}
	}

	private static function seed_parkings(): void {
		global $wpdb;
		$table = Schema::table( 'parkings' );
		$now   = current_time( 'mysql', true );
		foreach ( self::PARKINGS as $slug => $name ) {
			// INSERT IGNORE : n'écrase jamais un parking déjà configuré.
			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->prepare(
					"INSERT IGNORE INTO {$table} (slug, name, status, created_at, updated_at) VALUES (%s, %s, 'draft', %s, %s)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$slug,
					$name,
					$now,
					$now
				)
			);
		}
	}
}
