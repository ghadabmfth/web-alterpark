<?php
/**
 * Schéma des tables du plugin (InnoDB, utf8mb4). Dates en UTC.
 * Montants en centimes (entiers), jamais en flottants.
 *
 * @package Alterpark\Booking
 */

namespace Alterpark\Booking\Install;

defined( 'ABSPATH' ) || exit;

final class Schema {

	public const VERSION = '2026.11.1';

	public static function table( string $name ): string {
		global $wpdb;
		return $wpdb->prefix . 'apbs_' . $name;
	}

	/**
	 * Requêtes au format dbDelta (deux espaces après PRIMARY KEY, une colonne par ligne).
	 *
	 * @return string[]
	 */
	public static function tables(): array {
		global $wpdb;
		$c = $wpdb->get_charset_collate() . ' ENGINE=InnoDB';

		$parkings  = self::table( 'parkings' );
		$offers    = self::table( 'offers' );
		$rates     = self::table( 'rates' );
		$occupancy = self::table( 'occupancy' );
		$holds     = self::table( 'holds' );
		$customers = self::table( 'customers' );
		$bookings  = self::table( 'bookings' );
		$log       = self::table( 'booking_log' );
		$events    = self::table( 'stripe_events' );

		return array(
			"CREATE TABLE {$parkings} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  slug varchar(40) NOT NULL,
  name varchar(120) NOT NULL,
  address_line varchar(255) NOT NULL DEFAULT '',
  postal_code varchar(12) NOT NULL DEFAULT '',
  city varchar(120) NOT NULL DEFAULT '',
  country char(2) NOT NULL DEFAULT 'FR',
  latitude decimal(9,6) NULL,
  longitude decimal(9,6) NULL,
  timezone varchar(64) NOT NULL DEFAULT 'Europe/Paris',
  capacity int(10) unsigned NOT NULL DEFAULT 0,
  opening_hours longtext NULL,
  practical_info longtext NULL,
  min_lead_minutes int(10) unsigned NOT NULL DEFAULT 120,
  hold_ttl_minutes smallint(5) unsigned NOT NULL DEFAULT 20,
  status varchar(20) NOT NULL DEFAULT 'draft',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY slug (slug)
) {$c};",

			"CREATE TABLE {$offers} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  parking_id bigint(20) unsigned NOT NULL,
  code varchar(40) NOT NULL,
  name varchar(120) NOT NULL,
  description longtext NULL,
  consumes_capacity tinyint(1) NOT NULL DEFAULT 1,
  is_active tinyint(1) NOT NULL DEFAULT 1,
  sort_order smallint(5) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY parking_code (parking_id,code),
  KEY parking_active (parking_id,is_active)
) {$c};",

			"CREATE TABLE {$rates} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  offer_id bigint(20) unsigned NOT NULL,
  valid_from date NOT NULL,
  valid_to date NULL,
  min_days smallint(5) unsigned NOT NULL DEFAULT 1,
  max_days smallint(5) unsigned NULL,
  pricing_mode varchar(10) NOT NULL DEFAULT 'flat',
  amount_cents int(10) unsigned NOT NULL,
  extra_day_cents int(10) unsigned NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'EUR',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY offer_period (offer_id,valid_from,valid_to)
) {$c};",

			"CREATE TABLE {$occupancy} (
  parking_id bigint(20) unsigned NOT NULL,
  day date NOT NULL,
  booked int(10) unsigned NOT NULL DEFAULT 0,
  held int(10) unsigned NOT NULL DEFAULT 0,
  blocked int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY  (parking_id,day)
) {$c};",

			"CREATE TABLE {$holds} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  token char(64) NOT NULL,
  parking_id bigint(20) unsigned NOT NULL,
  offer_id bigint(20) unsigned NOT NULL,
  start_at datetime NOT NULL,
  end_at datetime NOT NULL,
  amount_cents int(10) unsigned NOT NULL,
  currency char(3) NOT NULL DEFAULT 'EUR',
  price_snapshot longtext NOT NULL,
  customer_snapshot longtext NULL,
  idempotency_key varchar(64) NOT NULL,
  stripe_payment_intent_id varchar(64) NULL,
  status varchar(20) NOT NULL DEFAULT 'active',
  expires_at datetime NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY token (token),
  UNIQUE KEY idempotency_key (idempotency_key),
  UNIQUE KEY payment_intent (stripe_payment_intent_id),
  KEY status_expires (status,expires_at)
) {$c};",

			"CREATE TABLE {$customers} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  wp_user_id bigint(20) unsigned NULL,
  email varchar(190) NOT NULL,
  first_name varchar(100) NOT NULL DEFAULT '',
  last_name varchar(100) NOT NULL DEFAULT '',
  phone varchar(32) NOT NULL DEFAULT '',
  stripe_customer_id varchar(64) NULL,
  marketing_consent_at datetime NULL,
  anonymized_at datetime NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY email (email),
  KEY wp_user_id (wp_user_id)
) {$c};",

			"CREATE TABLE {$bookings} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  reference varchar(16) NOT NULL,
  access_token_hash char(64) NOT NULL,
  parking_id bigint(20) unsigned NOT NULL,
  offer_id bigint(20) unsigned NOT NULL,
  customer_id bigint(20) unsigned NOT NULL,
  hold_id bigint(20) unsigned NULL,
  start_at datetime NOT NULL,
  end_at datetime NOT NULL,
  vehicle_plate varchar(20) NOT NULL DEFAULT '',
  passengers tinyint(3) unsigned NOT NULL DEFAULT 1,
  flight_number varchar(16) NOT NULL DEFAULT '',
  notes text NULL,
  amount_cents int(10) unsigned NOT NULL,
  refunded_cents int(10) unsigned NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'EUR',
  price_snapshot longtext NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'confirmed',
  payment_status varchar(20) NOT NULL DEFAULT 'paid',
  stripe_payment_intent_id varchar(64) NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  cancelled_at datetime NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY reference (reference),
  UNIQUE KEY payment_intent (stripe_payment_intent_id),
  KEY parking_period (parking_id,start_at,end_at),
  KEY customer (customer_id),
  KEY status (status)
) {$c};",

			"CREATE TABLE {$log} (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  booking_id bigint(20) unsigned NOT NULL,
  event varchar(40) NOT NULL,
  from_status varchar(20) NULL,
  to_status varchar(20) NULL,
  actor_type varchar(20) NOT NULL,
  actor_id bigint(20) unsigned NULL,
  payload longtext NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY booking (booking_id,created_at)
) {$c};",

			"CREATE TABLE {$events} (
  event_id varchar(64) NOT NULL,
  type varchar(80) NOT NULL,
  processed_at datetime NOT NULL,
  PRIMARY KEY  (event_id)
) {$c};",
		);
	}
}
