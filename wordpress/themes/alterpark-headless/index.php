<?php
/**
 * Aucun rendu public : toute requête front est redirigée vers Next.js (voir inc/headless.php).
 * Ce fichier n'est atteint que si la redirection est impossible (URL frontend non configurée).
 *
 * @package AlterparkHeadless
 */

defined( 'ABSPATH' ) || exit;

status_header( 404 );
nocache_headers();
echo esc_html__( 'Ce WordPress ne sert que l’administration et l’API.', 'alterpark-headless' );
