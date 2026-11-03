<?php
/**
 * Renders every email template to /tools/email-previews/*.html for review,
 * without WordPress (minimal shims). Run: php tools/preview-emails.php
 */
define( 'ABSPATH', __DIR__ );
define( 'SW_FRONTEND_URL', getenv( 'SW_FRONTEND_URL' ) ?: 'https://sharpewysman.com' );
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES, 'UTF-8' ); }
function esc_attr( $s ) { return esc_html( $s ); }
function esc_url( $s ) { return esc_html( $s ); }
function untrailingslashit( $s ) { return rtrim( $s, '/' ); }
function wp_strip_all_tags( $s ) { return strip_tags( $s ); }
function wp_kses( $s ) { return $s; }
function sw_get_settings() { return array( 'phone' => '604-779-5251', 'email' => 'info@sharpewysman.com', 'linkedin' => 'https://www.linkedin.com/in/sukhjitlalli/' ); }
require __DIR__ . '/../includes/emails.php';

$base = array( 'kind' => 'contact', 'topic' => 'general', 'name' => 'Jordan Lee', 'email' => 'jordan.lee@example.com', 'phone' => '604-555-0182', 'company' => '', 'linkedin' => 'https://www.linkedin.com/in/example', 'message' => '', 'jobTitle' => '', 'jobSlug' => '', 'has_cv' => false, 'admin_url' => 'https://cms.sharpewysman.com/wp-admin/post.php?post=123&action=edit' );
$cases = array(
	'team-application'    => array( 'team_notification', array( 'kind' => 'apply', 'topic' => 'register', 'jobTitle' => 'Tax Manager', 'jobSlug' => 'tax-manager-cpa-firm', 'has_cv' => true, 'message' => "I'm a CPA with four years in a mid-size firm and I've completed In-Depth Tax levels I and II." ) ),
	'team-hiring'         => array( 'team_notification', array( 'topic' => 'hire', 'name' => 'Priya Sandhu', 'company' => 'Northshore CPA LLP', 'linkedin' => '', 'message' => "We need an Audit Manager with ASPE experience to start in the new year." ) ),
	'confirm-application' => array( 'confirm_application', array( 'kind' => 'apply', 'jobTitle' => 'Tax Manager', 'jobSlug' => 'tax-manager-cpa-firm', 'has_cv' => true ) ),
	'confirm-hire'        => array( 'confirm_hire', array( 'topic' => 'hire', 'name' => 'Priya Sandhu', 'company' => 'Northshore CPA LLP', 'message' => 'We need an Audit Manager with ASPE experience to start in the new year.' ) ),
	'confirm-register'    => array( 'confirm_register', array( 'topic' => 'register' ) ),
	'confirm-general'     => array( 'confirm_general', array() ),
);
$out = __DIR__ . '/email-previews';
@mkdir( $out );
foreach ( $cases as $name => list( $tpl, $over ) ) {
	$e = sw_render_email( $tpl, array_merge( $base, $over ) );
	file_put_contents( "$out/$name.html", $e['html'] );
	echo str_pad( $name, 22 ) . ' | ' . $e['subject'] . "\n";
}
