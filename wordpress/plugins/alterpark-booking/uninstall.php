<?php
/**
 * Désinstallation. Les données (réservations, clients) ne sont supprimées que si l'option
 * apbs_delete_data_on_uninstall est activée explicitement : obligations comptables et RGPD.
 *
 * @package Alterpark\Booking
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

if ( ! get_option( 'apbs_delete_data_on_uninstall' ) ) {
	return;
}

global $wpdb;
foreach ( array( 'stripe_events', 'booking_log', 'bookings', 'customers', 'holds', 'occupancy', 'rates', 'offers', 'parkings' ) as $name ) {
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}apbs_{$name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
}
delete_option( 'apbs_db_version' );
delete_option( 'apbs_delete_data_on_uninstall' );
remove_role( 'apbs_operator' );
foreach ( array( 'administrator' ) as $role_name ) {
	$role = get_role( $role_name );
	if ( $role ) {
		$role->remove_cap( 'apbs_manage_bookings' );
		$role->remove_cap( 'apbs_manage_settings' );
	}
}
