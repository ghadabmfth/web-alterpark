<?php
/**
 * Thème headless Alterpark : chargement des modules.
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

define( 'ALTERPARK_THEME_VERSION', '0.1.0' );
define( 'ALTERPARK_THEME_DIR', __DIR__ );

require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/headless.php';
require_once __DIR__ . '/inc/revalidate.php';
require_once __DIR__ . '/inc/rest.php';
