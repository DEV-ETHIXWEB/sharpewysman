<?php
/**
 * Plugin Name:       Sharpe Wysman Headless
 * Description:       Turns WordPress into the headless CMS for the Sharpe Wysman Next.js website: content types, REST fields, settings, enquiry handling and instant revalidation.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Ethixweb
 * License:           GPL-2.0-or-later
 * Text Domain:       sw-headless
 *
 * Configuration (wp-config.php):
 *   define( 'SW_FRONTEND_URL', 'https://sharpewysman.com' );   // Next.js site
 *   define( 'SW_REVALIDATE_SECRET', '...' );                     // same as REVALIDATE_SECRET in Next.js
 *   define( 'SW_FORMS_SECRET', '...' );                          // same as WP_FORMS_SECRET in Next.js
 *   define( 'SW_REDIRECT_FRONTEND', true );                      // optional: send WP theme visitors to the frontend
 */

defined( 'ABSPATH' ) || exit;

define( 'SW_HEADLESS_VERSION', '1.0.0' );
define( 'SW_HEADLESS_DIR', plugin_dir_path( __FILE__ ) );

require_once SW_HEADLESS_DIR . 'includes/emails.php';

/* ==========================================================================
 * 1. Content model
 * Each field: key => [ label, type, extra ]. Types: text, textarea, lines,
 * int, date, select, checkbox, url, email.
 * ======================================================================== */

function sw_content_types() {
	return array(
		'sw_job'         => array(
			'rest_base' => 'sw-jobs',
			'singular'  => 'Job',
			'plural'    => 'Jobs',
			'icon'      => 'dashicons-portfolio',
			'supports'  => array( 'title', 'editor', 'revisions' ),
			'editor'    => 'Job description (shown under "About the role")',
			'revalidate'=> 'jobs',
			'fields'    => array(
				'status'         => array( 'Status', 'select', array( 'open' => 'Open', 'filled' => 'Filled' ) ),
				'industry'       => array( 'Industry slug', 'text', 'e.g. accounting, legal, information-technology' ),
				'summary'        => array( 'Summary (1 or 2 sentences, used on cards and Google)', 'textarea' ),
				'location'       => array( 'Location (display)', 'text', 'e.g. Downtown Vancouver, BC' ),
				'city'           => array( 'City (for Google Jobs)', 'text', 'e.g. Vancouver' ),
				'employmentType' => array( 'Employment type', 'select', array( 'FULL_TIME' => 'Full-time', 'PART_TIME' => 'Part-time', 'CONTRACTOR' => 'Contract', 'TEMPORARY' => 'Temporary' ) ),
				'salaryMin'      => array( 'Salary minimum (CAD/year, optional)', 'int' ),
				'salaryMax'      => array( 'Salary maximum (CAD/year, optional)', 'int' ),
				'salaryNote'     => array( 'Salary note', 'text', 'e.g. + bonus + package' ),
				'highlights'     => array( 'What\'s on offer (one per line)', 'lines' ),
				'requirements'   => array( 'What you\'ll bring (one per line)', 'lines' ),
				'validThrough'   => array( 'Advert expires on', 'date' ),
			),
		),
		'sw_testimonial' => array(
			'rest_base' => 'sw-testimonials',
			'singular'  => 'Testimonial',
			'plural'    => 'Testimonials',
			'icon'      => 'dashicons-format-quote',
			'supports'  => array( 'title', 'editor', 'page-attributes' ),
			'title'     => 'Person\'s name',
			'editor'    => 'The quote',
			'revalidate'=> 'testimonials',
			'fields'    => array(
				'role'     => array( 'Role / job title', 'text' ),
				'company'  => array( 'Company', 'text' ),
				'audience' => array( 'Who is this from?', 'select', array( 'client' => 'Employer / client', 'candidate' => 'Candidate' ) ),
			),
		),
		'sw_team'        => array(
			'rest_base' => 'sw-team',
			'singular'  => 'Team member',
			'plural'    => 'Team',
			'icon'      => 'dashicons-groups',
			'supports'  => array( 'title', 'editor', 'thumbnail', 'page-attributes' ),
			'title'     => 'Full name',
			'editor'    => 'Biography',
			'revalidate'=> 'team',
			'fields'    => array(
				'role'        => array( 'Role', 'text' ),
				'phone'       => array( 'Phone', 'text' ),
				'email'       => array( 'Email', 'email' ),
				'linkedin'    => array( 'LinkedIn URL', 'url' ),
				'credentials' => array( 'Credentials (one per line)', 'lines' ),
				'image'       => array( 'Photo URL (leave empty to use the Featured image)', 'text' ),
			),
		),
		'sw_industry'    => array(
			'rest_base' => 'sw-industries',
			'singular'  => 'Industry',
			'plural'    => 'Industries',
			'icon'      => 'dashicons-building',
			'supports'  => array( 'title', 'editor', 'thumbnail' ),
			'editor'    => 'Introduction ("The importance of…")',
			'revalidate'=> 'industries',
			'fields'    => array(
				'navLabel'    => array( 'Menu label', 'text' ),
				'tagline'     => array( 'Tagline', 'textarea' ),
				'primary'     => array( 'Main specialism (large tile)', 'checkbox' ),
				'order'       => array( 'Order', 'int' ),
				'specialisms' => array( 'Specialisms (one per line)', 'lines' ),
				'skills'      => array( 'Key skills & qualifications (one per line)', 'lines' ),
				'roles'       => array( 'Typical roles (one per line)', 'lines' ),
				'image'       => array( 'Image URL (leave empty to use the Featured image)', 'text' ),
			),
		),
		'sw_faq'         => array(
			'rest_base' => 'sw-faqs',
			'singular'  => 'FAQ',
			'plural'    => 'FAQs',
			'icon'      => 'dashicons-editor-help',
			'supports'  => array( 'title', 'editor', 'page-attributes' ),
			'title'     => 'Question',
			'editor'    => 'Answer',
			'revalidate'=> 'faqs',
			'fields'    => array(
				'audience' => array( 'Audience', 'select', array( 'general' => 'General', 'employer' => 'Employers', 'candidate' => 'Candidates' ) ),
			),
		),
		'sw_case_study'  => array(
			'rest_base' => 'sw-case-studies',
			'singular'  => 'Case study',
			'plural'    => 'Case studies',
			'icon'      => 'dashicons-awards',
			'supports'  => array( 'title', 'editor', 'thumbnail' ),
			'editor'    => 'Summary (one paragraph)',
			'revalidate'=> 'case-studies',
			'fields'    => array(
				'client'    => array( 'Client (or description, e.g. "50-person CPA firm")', 'text' ),
				'industry'  => array( 'Industry', 'text' ),
				'challenge' => array( 'The challenge', 'textarea' ),
				'approach'  => array( 'Our approach', 'textarea' ),
				'outcome'   => array( 'The outcome', 'textarea' ),
				'quote'     => array( 'Client quote (optional)', 'textarea' ),
				'quoteBy'   => array( 'Quote attribution', 'text' ),
				'image'     => array( 'Image URL (leave empty to use the Featured image)', 'text' ),
			),
		),
	);
}

add_action( 'init', 'sw_register_content_types' );
function sw_register_content_types() {
	foreach ( sw_content_types() as $type => $def ) {
		register_post_type(
			$type,
			array(
				'labels'       => array(
					'name'          => $def['plural'],
					'singular_name' => $def['singular'],
					'add_new_item'  => 'Add ' . strtolower( $def['singular'] ),
					'edit_item'     => 'Edit ' . strtolower( $def['singular'] ),
					'all_items'     => 'All ' . strtolower( $def['plural'] ),
				),
				'public'       => true,
				'show_ui'      => true,
				'show_in_rest' => true,
				'rest_base'    => $def['rest_base'],
				'has_archive'  => false,
				'rewrite'      => false,
				'menu_icon'    => $def['icon'],
				'supports'     => $def['supports'],
			)
		);
		foreach ( $def['fields'] as $key => $f ) {
			register_post_meta(
				$type,
				'sw_' . $key,
				array(
					'single'            => true,
					'type'              => in_array( $f[1], array( 'int' ), true ) ? 'integer' : ( 'checkbox' === $f[1] ? 'boolean' : 'string' ),
					'show_in_rest'      => false,
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	}

	// Private store for form submissions.
	register_post_type(
		'sw_enquiry',
		array(
			'labels'          => array( 'name' => 'Enquiries', 'singular_name' => 'Enquiry' ),
			'public'          => false,
			'show_ui'         => true,
			'show_in_rest'    => false,
			'menu_icon'       => 'dashicons-email-alt',
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
		)
	);
}

// Classic editor for structured types keeps the meta boxes simple for editors.
add_filter(
	'use_block_editor_for_post_type',
	function ( $use, $type ) {
		return isset( sw_content_types()[ $type ] ) ? false : $use;
	},
	10,
	2
);

// Helpful placeholder text for titles.
add_filter(
	'enter_title_here',
	function ( $text, $post ) {
		$defs = sw_content_types();
		return isset( $defs[ $post->post_type ]['title'] ) ? $defs[ $post->post_type ]['title'] : $text;
	},
	10,
	2
);

/* ==========================================================================
 * 2. Meta boxes
 * ======================================================================== */

add_action(
	'add_meta_boxes',
	function () {
		foreach ( sw_content_types() as $type => $def ) {
			add_meta_box( 'sw_fields', $def['singular'] . ' details', 'sw_render_meta_box', $type, 'normal', 'high', array( 'type' => $type ) );
		}
		add_meta_box( 'sw_enquiry_details', 'Enquiry', 'sw_render_enquiry_box', 'sw_enquiry', 'normal', 'high' );
	}
);

add_action(
	'edit_form_after_title',
	function ( $post ) {
		$defs = sw_content_types();
		if ( isset( $defs[ $post->post_type ]['editor'] ) ) {
			echo '<p style="margin:16px 0 4px;font-weight:600">' . esc_html( $defs[ $post->post_type ]['editor'] ) . '</p>';
		}
	}
);

function sw_render_meta_box( $post, $box ) {
	$def = sw_content_types()[ $box['args']['type'] ];
	wp_nonce_field( 'sw_save_fields', 'sw_fields_nonce' );
	echo '<table class="form-table" role="presentation"><tbody>';
	foreach ( $def['fields'] as $key => $f ) {
		list( $label, $ftype ) = $f;
		$extra = isset( $f[2] ) ? $f[2] : null;
		$name  = 'sw_' . $key;
		$val   = get_post_meta( $post->ID, $name, true );
		echo '<tr><th scope="row"><label for="' . esc_attr( $name ) . '">' . esc_html( $label ) . '</label></th><td>';
		switch ( $ftype ) {
			case 'textarea':
			case 'lines':
				printf( '<textarea class="large-text" rows="%d" id="%s" name="%s">%s</textarea>', 'lines' === $ftype ? 5 : 3, esc_attr( $name ), esc_attr( $name ), esc_textarea( $val ) );
				break;
			case 'select':
				printf( '<select id="%s" name="%s">', esc_attr( $name ), esc_attr( $name ) );
				foreach ( $extra as $k => $l ) {
					printf( '<option value="%s"%s>%s</option>', esc_attr( $k ), selected( $val, $k, false ), esc_html( $l ) );
				}
				echo '</select>';
				break;
			case 'checkbox':
				printf( '<input type="checkbox" id="%s" name="%s" value="1"%s>', esc_attr( $name ), esc_attr( $name ), checked( (bool) $val, true, false ) );
				break;
			case 'int':
				printf( '<input type="number" class="regular-text" id="%s" name="%s" value="%s">', esc_attr( $name ), esc_attr( $name ), esc_attr( $val ) );
				break;
			case 'date':
				printf( '<input type="date" id="%s" name="%s" value="%s">', esc_attr( $name ), esc_attr( $name ), esc_attr( $val ) );
				break;
			default:
				$input_type = in_array( $ftype, array( 'url', 'email' ), true ) ? $ftype : 'text';
				printf( '<input type="%s" class="regular-text" id="%s" name="%s" value="%s"%s>', esc_attr( $input_type ), esc_attr( $name ), esc_attr( $name ), esc_attr( $val ), is_string( $extra ) ? ' placeholder="' . esc_attr( $extra ) . '"' : '' );
		}
		echo '</td></tr>';
	}
	echo '</tbody></table>';
}

add_action(
	'save_post',
	function ( $post_id, $post ) {
		$defs = sw_content_types();
		if ( ! isset( $defs[ $post->post_type ] ) ) {
			return;
		}
		if ( ! isset( $_POST['sw_fields_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sw_fields_nonce'] ) ), 'sw_save_fields' ) ) {
			return;
		}
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		foreach ( $defs[ $post->post_type ]['fields'] as $key => $f ) {
			$name = 'sw_' . $key;
			$raw  = isset( $_POST[ $name ] ) ? wp_unslash( $_POST[ $name ] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			switch ( $f[1] ) {
				case 'textarea':
				case 'lines':
					$val = sanitize_textarea_field( $raw );
					break;
				case 'int':
					$val = '' === $raw ? '' : absint( $raw );
					break;
				case 'checkbox':
					$val = $raw ? 1 : 0;
					break;
				case 'url':
					$val = esc_url_raw( $raw );
					break;
				case 'email':
					$val = sanitize_email( $raw );
					break;
				case 'select':
					$val = array_key_exists( $raw, $f[2] ) ? $raw : array_key_first( $f[2] );
					break;
				default:
					$val = sanitize_text_field( $raw );
			}
			if ( '' === $val ) {
				delete_post_meta( $post_id, $name );
			} else {
				update_post_meta( $post_id, $name, $val );
			}
		}
	},
	10,
	2
);

/* ==========================================================================
 * 3. REST: a normalised `sw` field on every content type
 * ======================================================================== */

function sw_lines( $s ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $s ) ) ) );
}

function sw_build_fields( $post_id, $type ) {
	$def = sw_content_types()[ $type ];
	$out = array();
	foreach ( $def['fields'] as $key => $f ) {
		$v = get_post_meta( $post_id, 'sw_' . $key, true );
		switch ( $f[1] ) {
			case 'lines':
				$out[ $key ] = sw_lines( $v );
				break;
			case 'int':
				if ( '' !== $v ) {
					$out[ $key ] = (int) $v;
				}
				break;
			case 'checkbox':
				$out[ $key ] = (bool) $v;
				break;
			case 'select':
				$out[ $key ] = '' !== $v ? $v : array_key_first( $f[2] );
				break;
			default:
				if ( '' !== $v ) {
					$out[ $key ] = $v;
				}
		}
	}
	if ( isset( $def['fields']['image'] ) && empty( $out['image'] ) && has_post_thumbnail( $post_id ) ) {
		$out['image'] = get_the_post_thumbnail_url( $post_id, 'large' );
	}
	if ( 'sw_job' === $type ) {
		$out += array( 'location' => '', 'city' => 'Vancouver', 'summary' => '', 'industry' => 'accounting' );
	}
	if ( 'sw_industry' === $type ) {
		$out += array( 'navLabel' => get_the_title( $post_id ), 'order' => 99, 'tagline' => '' );
	}
	return $out;
}

add_action(
	'rest_api_init',
	function () {
		foreach ( array_keys( sw_content_types() ) as $type ) {
			register_rest_field(
				$type,
				'sw',
				array(
					'get_callback' => function ( $obj ) use ( $type ) {
						return sw_build_fields( $obj['id'], $type );
					},
					'schema'       => array( 'type' => 'object', 'context' => array( 'view', 'edit' ) ),
				)
			);
		}

		// Blog posts: featured image, primary category and author name.
		register_rest_field(
			'post',
			'sw',
			array(
				'get_callback' => function ( $obj ) {
					$cats = get_the_category( $obj['id'] );
					$out  = array(
						'category' => $cats ? $cats[0]->name : 'Insights',
						'author'   => 'Sharpe Wysman',
					);
					if ( has_post_thumbnail( $obj['id'] ) ) {
						$out['image'] = get_the_post_thumbnail_url( $obj['id'], 'large' );
					} elseif ( get_post_meta( $obj['id'], 'sw_image', true ) ) {
						$out['image'] = get_post_meta( $obj['id'], 'sw_image', true );
					}
					return $out;
				},
			)
		);

		register_rest_route(
			'sw/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => 'sw_rest_settings',
			)
		);

		register_rest_route(
			'sw/v1',
			'/enquiry',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'sw_forms_authorised',
				'callback'            => 'sw_rest_enquiry',
			)
		);
	}
);

/* ==========================================================================
 * 4. Site settings (WP Admin → Settings → Sharpe Wysman)
 * ======================================================================== */

function sw_settings_defaults() {
	return array(
		'phone'           => '604-779-5251',
		'email'           => '',
		'notify_email'    => get_option( 'admin_email' ),
		'addressLocality' => 'Vancouver',
		'addressRegion'   => 'BC',
		'addressCountry'  => 'CA',
		'linkedin'        => 'https://www.linkedin.com/in/sukhjitlalli/',
		'stats'           => '',
		'send_confirmation' => '1',
	);
}

function sw_get_settings() {
	return wp_parse_args( get_option( 'sw_settings', array() ), sw_settings_defaults() );
}

function sw_rest_settings() {
	$s     = sw_get_settings();
	$stats = array();
	foreach ( sw_lines( $s['stats'] ) as $line ) {
		$parts = array_map( 'trim', explode( '|', $line ) );
		if ( count( $parts ) >= 2 ) {
			$stat = array( 'value' => $parts[0], 'label' => $parts[1] );
			if ( ! empty( $parts[2] ) ) {
				$stat['note'] = $parts[2];
			}
			$stats[] = $stat;
		}
	}
	$digits = preg_replace( '/\D/', '', $s['phone'] );
	return rest_ensure_response(
		array(
			'phone'           => $s['phone'],
			'phoneHref'       => '+' . ( 10 === strlen( $digits ) ? '1' . $digits : $digits ),
			'email'           => $s['email'],
			'addressLocality' => $s['addressLocality'],
			'addressRegion'   => $s['addressRegion'],
			'addressCountry'  => $s['addressCountry'],
			'linkedin'        => $s['linkedin'],
			'stats'           => $stats,
		)
	);
}

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Sharpe Wysman', 'Sharpe Wysman', 'manage_options', 'sw-settings', 'sw_render_settings_page' );
	}
);

add_action(
	'admin_init',
	function () {
		register_setting(
			'sw_settings',
			'sw_settings',
			array(
				'sanitize_callback' => function ( $in ) {
					$out = array();
					foreach ( sw_settings_defaults() as $k => $_ ) {
						$v         = isset( $in[ $k ] ) ? $in[ $k ] : '';
						if ( 'send_confirmation' === $k ) {
							$out[ $k ] = empty( $in[ $k ] ) ? '0' : '1';
							continue;
						}
						$out[ $k ] = 'stats' === $k ? sanitize_textarea_field( $v ) : ( in_array( $k, array( 'email', 'notify_email' ), true ) ? sanitize_email( $v ) : ( 'linkedin' === $k ? esc_url_raw( $v ) : sanitize_text_field( $v ) ) );
					}
					sw_revalidate( 'settings' );
					return $out;
				},
			)
		);
	}
);

function sw_render_settings_page() {
	$s      = sw_get_settings();
	$fields = array(
		'phone'           => 'Main phone number',
		'email'           => 'Public email address (shown on the site)',
		'notify_email'    => 'Send form enquiries to',
		'addressLocality' => 'City',
		'addressRegion'   => 'Province',
		'addressCountry'  => 'Country code',
		'linkedin'        => 'LinkedIn URL',
	);
	echo '<div class="wrap"><h1>Sharpe Wysman website settings</h1><form method="post" action="options.php">';
	settings_fields( 'sw_settings' );
	echo '<table class="form-table" role="presentation">';
	foreach ( $fields as $k => $label ) {
		printf( '<tr><th><label for="sw_%1$s">%2$s</label></th><td><input class="regular-text" id="sw_%1$s" name="sw_settings[%1$s]" value="%3$s"></td></tr>', esc_attr( $k ), esc_html( $label ), esc_attr( $s[ $k ] ) );
	}
	printf(
		'<tr><th><label for="sw_stats">Statistics</label></th><td><textarea class="large-text code" rows="5" id="sw_stats" name="sw_settings[stats]">%s</textarea><p class="description">One per line: <code>value | label | optional note</code>, e.g. <code>600+ | Successful placements</code>. Leave empty to use the defaults.</p></td></tr>',
		esc_textarea( $s['stats'] )
	);
	printf(
		'<tr><th>Confirmation emails</th><td><label><input type="checkbox" name="sw_settings[send_confirmation]" value="1"%s> Send a branded confirmation email to people who apply or enquire</label></td></tr>',
		checked( '0' !== (string) $s['send_confirmation'], true, false )
	);
	echo '</table>';
	submit_button();
	echo '</form></div>';
}

/* ==========================================================================
 * 5. Enquiries (contact + job applications) from the Next.js site
 * ======================================================================== */

function sw_forms_authorised( WP_REST_Request $req ) {
	if ( ! defined( 'SW_FORMS_SECRET' ) || ! SW_FORMS_SECRET ) {
		return new WP_Error( 'sw_not_configured', 'Forms secret not configured.', array( 'status' => 503 ) );
	}
	return hash_equals( SW_FORMS_SECRET, (string) $req->get_header( 'x_sw_secret' ) );
}

function sw_private_dir() {
	$dir = WP_CONTENT_DIR . '/sw-private';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
		file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore
		file_put_contents( $dir . '/index.php', '<?php // Silence.' ); // phpcs:ignore
	}
	return $dir;
}

function sw_rest_enquiry( WP_REST_Request $req ) {
	$p    = $req->get_body_params();
	$get  = function ( $k, $max = 500 ) use ( $p ) {
		return isset( $p[ $k ] ) ? mb_substr( sanitize_textarea_field( wp_unslash( $p[ $k ] ) ), 0, $max ) : '';
	};
	$data = array(
		'kind'     => 'apply' === $get( 'kind' ) ? 'apply' : 'contact',
		'topic'    => $get( 'topic', 20 ),
		'name'     => $get( 'name', 120 ),
		'email'    => sanitize_email( $get( 'email', 200 ) ),
		'phone'    => $get( 'phone', 40 ),
		'company'  => $get( 'company', 160 ),
		'linkedin' => esc_url_raw( $get( 'linkedin', 300 ) ),
		'message'  => $get( 'message', 5000 ),
		'jobSlug'  => sanitize_title( $get( 'jobSlug', 200 ) ),
		'jobTitle' => $get( 'jobTitle', 200 ),
		'ip'       => $get( 'ip', 64 ),
	);
	if ( ! $data['name'] || ! is_email( $data['email'] ) ) {
		return new WP_Error( 'sw_invalid', 'Name and a valid email are required.', array( 'status' => 422 ) );
	}

	// Store the resume outside the public uploads folder.
	$cv_path = '';
	$files   = $req->get_file_params();
	if ( ! empty( $files['cv']['tmp_name'] ) && is_uploaded_file( $files['cv']['tmp_name'] ) ) {
		$check = wp_check_filetype_and_ext( $files['cv']['tmp_name'], $files['cv']['name'], array(
			'pdf'  => 'application/pdf',
			'doc'  => 'application/msword',
			'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		) );
		if ( ! $check['ext'] || $files['cv']['size'] > 5 * MB_IN_BYTES ) {
			return new WP_Error( 'sw_bad_file', 'Resume must be a PDF or Word file under 5 MB.', array( 'status' => 415 ) );
		}
		$cv_path = sw_private_dir() . '/' . wp_generate_password( 20, false ) . '-' . sanitize_file_name( $files['cv']['name'] );
		if ( ! move_uploaded_file( $files['cv']['tmp_name'], $cv_path ) ) {
			$cv_path = '';
		}
	}

	$labels = array( 'hire' => 'Hiring enquiry', 'register' => 'Candidate registration', 'general' => 'General enquiry' );
	$title  = 'apply' === $data['kind'] ? 'Application: ' . $data['jobTitle'] : ( isset( $labels[ $data['topic'] ] ) ? $labels[ $data['topic'] ] : 'Enquiry' );
	$title .= ': ' . $data['name'];

	$post_id = wp_insert_post(
		array(
			'post_type'   => 'sw_enquiry',
			'post_status' => 'private',
			'post_title'  => $title,
		)
	);
	if ( is_wp_error( $post_id ) ) {
		return new WP_Error( 'sw_store_failed', 'Could not store enquiry.', array( 'status' => 500 ) );
	}
	foreach ( $data as $k => $v ) {
		update_post_meta( $post_id, 'sw_' . $k, $v );
	}
	if ( $cv_path ) {
		update_post_meta( $post_id, 'sw_cv_path', $cv_path );
	}

	// Branded emails (sent through the site's WP Mail SMTP configuration).
	$settings = sw_get_settings();
	$to       = $settings['notify_email'] ? $settings['notify_email'] : get_option( 'admin_email' );
	$mail     = array_merge(
		$data,
		array(
			'has_cv'    => (bool) $cv_path,
			'admin_url' => admin_url( 'post.php?post=' . $post_id . '&action=edit' ),
		)
	);
	sw_send_email(
		$to,
		sw_render_email( 'team_notification', $mail ),
		array( 'Reply-To: ' . $data['name'] . ' <' . $data['email'] . '>' ),
		$cv_path ? array( $cv_path ) : array()
	);

	// Confirmation to the person who wrote in (can be switched off in settings).
	if ( '0' !== (string) $settings['send_confirmation'] ) {
		$template = 'apply' === $data['kind'] ? 'confirm_application' : ( 'hire' === $data['topic'] ? 'confirm_hire' : ( 'register' === $data['topic'] ? 'confirm_register' : 'confirm_general' ) );
		sw_send_email(
			$data['email'],
			sw_render_email( $template, $mail ),
			array( 'Reply-To: Sharpe Wysman <' . $to . '>' )
		);
	}

	return rest_ensure_response( array( 'ok' => true ) );
}

function sw_render_enquiry_box( $post ) {
	$rows = array( 'kind' => 'Type', 'topic' => 'Topic', 'name' => 'Name', 'email' => 'Email', 'phone' => 'Phone', 'company' => 'Company', 'linkedin' => 'LinkedIn', 'jobTitle' => 'Job', 'message' => 'Message', 'ip' => 'IP address' );
	echo '<table class="widefat striped"><tbody>';
	foreach ( $rows as $k => $label ) {
		$v = get_post_meta( $post->ID, 'sw_' . $k, true );
		if ( '' === $v ) {
			continue;
		}
		echo '<tr><th style="width:140px">' . esc_html( $label ) . '</th><td>' . nl2br( esc_html( $v ) ) . '</td></tr>';
	}
	if ( get_post_meta( $post->ID, 'sw_cv_path', true ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=sw_download_cv&post=' . $post->ID ), 'sw_cv_' . $post->ID );
		echo '<tr><th>Resume</th><td><a class="button" href="' . esc_url( $url ) . '">Download resume</a></td></tr>';
	}
	echo '</tbody></table>';
}

add_action(
	'admin_post_sw_download_cv',
	function () {
		$id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
		check_admin_referer( 'sw_cv_' . $id );
		if ( ! current_user_can( 'edit_post', $id ) ) {
			wp_die( 'Not allowed.' );
		}
		$path = get_post_meta( $id, 'sw_cv_path', true );
		if ( ! $path || 0 !== strpos( realpath( $path ), realpath( sw_private_dir() ) ) || ! is_readable( $path ) ) {
			wp_die( 'File not found.' );
		}
		nocache_headers();
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename="' . preg_replace( '/^[A-Za-z0-9]{20}-/', '', basename( $path ) ) . '"' );
		header( 'Content-Length: ' . filesize( $path ) );
		readfile( $path ); // phpcs:ignore
		exit;
	}
);

// Delete the stored resume when an enquiry is permanently deleted.
add_action(
	'before_delete_post',
	function ( $id ) {
		$path = get_post_meta( $id, 'sw_cv_path', true );
		if ( $path && file_exists( $path ) ) {
			wp_delete_file( $path );
		}
	}
);

/* ==========================================================================
 * 6. Instant revalidation of the Next.js site
 * ======================================================================== */

function sw_revalidate( $type, $slug = '' ) {
	if ( ! defined( 'SW_FRONTEND_URL' ) || ! defined( 'SW_REVALIDATE_SECRET' ) ) {
		return;
	}
	wp_remote_post(
		trailingslashit( SW_FRONTEND_URL ) . 'api/revalidate',
		array(
			'blocking' => false,
			'timeout'  => 5,
			'headers'  => array( 'Content-Type' => 'application/json', 'X-SW-Secret' => SW_REVALIDATE_SECRET ),
			'body'     => wp_json_encode( array( 'type' => $type, 'slug' => $slug ) ),
		)
	);
}

function sw_maybe_revalidate( $post_id ) {
	$post = get_post( $post_id );
	if ( ! $post || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}
	$defs = sw_content_types();
	if ( isset( $defs[ $post->post_type ] ) ) {
		sw_revalidate( $defs[ $post->post_type ]['revalidate'], $post->post_name );
	} elseif ( 'post' === $post->post_type ) {
		sw_revalidate( 'posts', $post->post_name );
	} elseif ( 'page' === $post->post_type ) {
		sw_revalidate( 'page', $post->post_name );
	}
}
add_action( 'save_post', 'sw_maybe_revalidate', 99 );
add_action( 'trashed_post', 'sw_maybe_revalidate' );
add_action( 'untrashed_post', 'sw_maybe_revalidate' );

/* ==========================================================================
 * 7. Headless behaviour
 * ======================================================================== */

// Send visitors of the old theme to the new frontend (admin, REST, login unaffected).
add_action(
	'template_redirect',
	function () {
		if ( ! defined( 'SW_REDIRECT_FRONTEND' ) || ! SW_REDIRECT_FRONTEND || ! defined( 'SW_FRONTEND_URL' ) ) {
			return;
		}
		if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_preview() ) {
			return;
		}
		$path = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
		wp_redirect( untrailingslashit( SW_FRONTEND_URL ) . $path, 301 );
		exit;
	}
);

// "View" links in the admin point at the frontend.
add_filter(
	'post_type_link',
	function ( $link, $post ) {
		if ( ! defined( 'SW_FRONTEND_URL' ) ) {
			return $link;
		}
		$map = array( 'sw_job' => 'jobs', 'sw_industry' => 'industries', 'sw_case_study' => 'case-studies' );
		return isset( $map[ $post->post_type ] ) ? untrailingslashit( SW_FRONTEND_URL ) . '/' . $map[ $post->post_type ] . '/' . $post->post_name : $link;
	},
	10,
	2
);

/* ==========================================================================
 * 8. One-time import of launch content
 * ======================================================================== */

register_activation_hook( __FILE__, 'sw_activate' );
function sw_activate() {
	sw_register_content_types();
	sw_import_seed();
	flush_rewrite_rules();
}

function sw_import_seed() {
	if ( get_option( 'sw_seed_imported' ) ) {
		return;
	}
	$file = SW_HEADLESS_DIR . 'seed.json';
	if ( ! file_exists( $file ) ) {
		return;
	}
	$seed = json_decode( file_get_contents( $file ), true ); // phpcs:ignore
	if ( ! is_array( $seed ) ) {
		return;
	}

	$insert = function ( $type, $title, $slug, $content, $meta, $order = 0, $extra = array() ) {
		if ( get_page_by_path( $slug, OBJECT, $type ) ) {
			return;
		}
		$id = wp_insert_post(
			array_merge(
				array(
					'post_type'    => $type,
					'post_status'  => 'publish',
					'post_title'   => $title,
					'post_name'    => $slug,
					'post_content' => $content,
					'menu_order'   => $order,
				),
				$extra
			)
		);
		if ( is_wp_error( $id ) ) {
			return;
		}
		foreach ( $meta as $k => $v ) {
			if ( is_array( $v ) ) {
				$v = implode( "\n", $v );
			}
			if ( is_bool( $v ) ) {
				$v = $v ? 1 : 0;
			}
			if ( null !== $v && '' !== $v ) {
				update_post_meta( $id, 'sw_' . $k, $v );
			}
		}
	};

	foreach ( (array) $seed['industries'] as $i ) {
		$insert( 'sw_industry', $i['name'], $i['slug'], $i['intro'], array_intersect_key( $i, array_flip( array( 'navLabel', 'primary', 'tagline', 'specialisms', 'skills', 'roles', 'image', 'order' ) ) ) );
	}
	foreach ( (array) $seed['jobs'] as $j ) {
		$meta = array_intersect_key( $j, array_flip( array( 'industry', 'location', 'city', 'employmentType', 'salaryMin', 'salaryMax', 'salaryNote', 'summary', 'highlights', 'requirements', 'validThrough', 'status' ) ) );
		$insert( 'sw_job', $j['title'], $j['slug'], $j['body'], $meta, 0, array( 'post_date' => $j['datePosted'] . ' 09:00:00' ) );
	}
	foreach ( (array) $seed['testimonials'] as $n => $t ) {
		$insert( 'sw_testimonial', $t['name'], $t['id'], $t['quote'], array_intersect_key( $t, array_flip( array( 'role', 'company', 'audience' ) ) ), $n );
	}
	foreach ( (array) $seed['team'] as $n => $m ) {
		$bio = implode( "\n\n", array_map( function ( $p ) { return '<p>' . esc_html( $p ) . '</p>'; }, $m['bio'] ) );
		$insert( 'sw_team', $m['name'], $m['slug'], $bio, array_intersect_key( $m, array_flip( array( 'role', 'phone', 'email', 'linkedin', 'credentials', 'image' ) ) ), $n );
	}
	foreach ( (array) $seed['faqs'] as $n => $f ) {
		$insert( 'sw_faq', $f['question'], $f['id'], $f['answer'], array( 'audience' => $f['audience'] ), $n );
	}
	foreach ( (array) $seed['articles'] as $a ) {
		$insert( 'post', $a['title'], $a['slug'], $a['html'], array( 'image' => isset( $a['image'] ) ? $a['image'] : '' ), 0, array( 'post_excerpt' => $a['excerpt'], 'post_date' => $a['date'] . ' 09:00:00' ) );
	}

	update_option( 'sw_seed_imported', SW_HEADLESS_VERSION );
}
