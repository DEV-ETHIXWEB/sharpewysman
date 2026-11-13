<?php
/**
 * Sharpe Wysman branded email templates.
 *
 * Built for real inboxes: table layout, inline styles, 600px, system font
 * fallbacks (Georgia for headings, Helvetica/Arial for text), bulletproof
 * buttons that render in Outlook, a hidden preheader, and a plain-text
 * alternative attached via phpmailer_init.
 *
 * Templates:
 *   team_notification   → to the Sharpe Wysman inbox (every enquiry/application)
 *   confirm_application → to a candidate who applied for a job
 *   confirm_hire        → to an employer with a hiring enquiry
 *   confirm_register    → to a candidate registering their resume
 *   confirm_general     → to anyone else
 */

defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------- tokens */

function sw_email_tokens() {
	return array(
		'ink'     => '#1e1d1f',
		'ink2'    => '#29282b',
		'paper'   => '#f4f4f2',
		'line'    => '#dcdad5',
		'muted'   => '#5b595e',
		'gold'    => '#fdc705',
		'goldInk' => '#8a6a00',
		// Bronze: the site's second accent. The retired maroon logo colour is not used.
		'accent'  => '#7a5e00',
		// Email clients cannot load the site's Geist family, so these are the
		// closest stacks every inbox already has: a transitional serif for
		// headings, the system UI sans for text, and a ledger mono for labels.
		'serif'   => "Georgia, 'Times New Roman', Times, serif",
		'sans'    => "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
		'mono'    => "Menlo, Consolas, 'Courier New', monospace",
	);
}

function sw_email_frontend_url( $path = '' ) {
	$base = defined( 'SW_FRONTEND_URL' ) ? untrailingslashit( SW_FRONTEND_URL ) : 'https://sharpewysman.com';
	return $base . $path;
}

/* ---------------------------------------------------------- components */

/** Bulletproof button: works in Outlook (VML-free table cell) and everywhere else. */
function sw_email_button( $label, $url, $variant = 'gold' ) {
	$t  = sw_email_tokens();
	$bg = 'gold' === $variant ? $t['gold'] : $t['ink'];
	$fg = 'gold' === $variant ? $t['ink'] : '#ffffff';
	return sprintf(
		'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td align="center" bgcolor="%1$s" style="border-radius:999px;background:%1$s;mso-padding-alt:14px 28px;">'
		. '<a href="%3$s" target="_blank" style="display:inline-block;padding:14px 28px;font-family:%4$s;font-size:15px;font-weight:700;line-height:1;color:%2$s;text-decoration:none;border-radius:999px;">%5$s&nbsp;&nbsp;&rarr;</a>'
		. '</td></tr></table>',
		esc_attr( $bg ),
		esc_attr( $fg ),
		esc_url( $url ),
		$t['sans'],
		esc_html( $label )
	);
}

/** Numbered "what happens next" steps, ledger-style. */
function sw_email_steps( $steps ) {
	$t    = sw_email_tokens();
	$rows = '';
	foreach ( array_values( $steps ) as $i => $s ) {
		$rows .= sprintf(
			'<tr><td valign="top" width="44" style="padding:0 0 18px 0;">'
			. '<div style="width:30px;height:30px;line-height:30px;border-radius:15px;border:1px solid %1$s;text-align:center;font-family:%2$s;font-size:11px;color:%3$s;">%4$s</div></td>'
			. '<td valign="top" style="padding:3px 0 18px 0;font-family:%5$s;font-size:15px;line-height:1.55;color:%6$s;"><strong style="color:%7$s;">%8$s</strong><br>%9$s</td></tr>',
			$t['gold'],
			$t['mono'],
			$t['goldInk'],
			str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ),
			$t['sans'],
			$t['muted'],
			$t['ink'],
			esc_html( $s[0] ),
			esc_html( $s[1] )
		);
	}
	return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $rows . '</table>';
}

/** Label/value table for the internal notification. */
function sw_email_fields( $fields ) {
	$t    = sw_email_tokens();
	$rows = '';
	foreach ( $fields as $label => $value ) {
		if ( '' === (string) $value ) {
			continue;
		}
		$rows .= sprintf(
			'<tr><td valign="top" width="130" style="padding:12px 12px 12px 0;border-bottom:1px solid %1$s;font-family:%2$s;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:%3$s;">%4$s</td>'
			. '<td valign="top" style="padding:12px 0;border-bottom:1px solid %1$s;font-family:%5$s;font-size:15px;line-height:1.55;color:%6$s;">%7$s</td></tr>',
			$t['line'],
			$t['mono'],
			$t['muted'],
			esc_html( $label ),
			$t['sans'],
			$t['ink'],
			$value // already escaped by caller
		);
	}
	return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid ' . $t['ink'] . ';">' . $rows . '</table>';
}

/* -------------------------------------------------------------- layout */

/**
 * Shared shell: charcoal header with logo, gold rule, white card, footer.
 * $args: preheader, eyebrow, title, body_html, footer_note
 */
function sw_email_layout( $args ) {
	$t        = sw_email_tokens();
	$settings = function_exists( 'sw_get_settings' ) ? sw_get_settings() : array( 'phone' => '604 779 5251', 'email' => '', 'linkedin' => '' );
	$logo     = sw_email_frontend_url( '/images/logo-light.png' );
	$site     = sw_email_frontend_url( '/' );
	$year     = gmdate( 'Y' );
	$phone    = esc_html( $settings['phone'] );
	$tel      = '+' . ( 10 === strlen( preg_replace( '/\D/', '', $settings['phone'] ) ) ? '1' : '' ) . preg_replace( '/\D/', '', $settings['phone'] );

	ob_start();
	?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title><?php echo esc_html( wp_strip_all_tags( $args['title'] ) ); ?></title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,sans-serif!important;}</style><![endif]-->
<style>
  @media (max-width:620px){ .sw-card{padding:32px 24px!important;} .sw-h1{font-size:28px!important;} .sw-pad{padding-left:16px!important;padding-right:16px!important;} }
  a{color:<?php echo esc_attr( $t['accent'] ); ?>;}
</style>
</head>
<body style="margin:0;padding:0;background:<?php echo esc_attr( $t['paper'] ); ?>;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;"><?php echo esc_html( $args['preheader'] ); ?>&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="<?php echo esc_attr( $t['paper'] ); ?>" style="background:<?php echo esc_attr( $t['paper'] ); ?>;">
<tr><td align="center" class="sw-pad" style="padding:32px 24px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

    <!-- Header -->
    <tr><td bgcolor="<?php echo esc_attr( $t['ink'] ); ?>" style="background:<?php echo esc_attr( $t['ink'] ); ?>;border-radius:14px 14px 0 0;padding:26px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td><a href="<?php echo esc_url( $site ); ?>" target="_blank"><img src="<?php echo esc_url( $logo ); ?>" width="190" alt="Sharpe Wysman Recruitment Solutions" style="display:block;width:190px;max-width:190px;height:auto;border:0;"></a></td>
        <td align="right" style="font-family:<?php echo esc_attr( $t['mono'] ); ?>;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:<?php echo esc_attr( $t['gold'] ); ?>;">Vancouver &middot; Since 2008</td>
      </tr></table>
    </td></tr>
    <!-- Gold rule -->
    <tr><td height="4" bgcolor="<?php echo esc_attr( $t['gold'] ); ?>" style="background:<?php echo esc_attr( $t['gold'] ); ?>;font-size:0;line-height:0;">&nbsp;</td></tr>

    <!-- Card -->
    <tr><td class="sw-card" bgcolor="#ffffff" style="background:#ffffff;padding:44px 48px;border-radius:0 0 14px 14px;">
      <p style="margin:0 0 14px;font-family:<?php echo esc_attr( $t['mono'] ); ?>;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:<?php echo esc_attr( $t['accent'] ); ?>;"><?php echo esc_html( $args['eyebrow'] ); ?></p>
      <h1 class="sw-h1" style="margin:0 0 22px;font-family:<?php echo esc_attr( $t['serif'] ); ?>;font-size:32px;line-height:1.15;font-weight:400;color:<?php echo esc_attr( $t['ink'] ); ?>;"><?php echo wp_kses( $args['title'], array( 'em' => array( 'style' => array() ) ) ); ?></h1>
      <?php echo $args['body_html']; // phpcs:ignore -- composed from escaped parts ?>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:28px 12px 8px;text-align:center;font-family:<?php echo esc_attr( $t['sans'] ); ?>;font-size:13px;line-height:1.6;color:<?php echo esc_attr( $t['muted'] ); ?>;">
      <p style="margin:0 0 6px;"><strong style="color:<?php echo esc_attr( $t['ink'] ); ?>;">Sharpe Wysman Recruitment Solutions</strong> &middot; Vancouver, BC</p>
      <p style="margin:0 0 6px;"><a href="tel:<?php echo esc_attr( $tel ); ?>" style="color:<?php echo esc_attr( $t['ink'] ); ?>;text-decoration:none;font-family:<?php echo esc_attr( $t['mono'] ); ?>;"><?php echo $phone; // phpcs:ignore ?></a><?php if ( ! empty( $settings['email'] ) ) : ?> &middot; <a href="mailto:<?php echo esc_attr( $settings['email'] ); ?>" style="color:<?php echo esc_attr( $t['ink'] ); ?>;"><?php echo esc_html( $settings['email'] ); ?></a><?php endif; ?> &middot; <a href="<?php echo esc_url( $site ); ?>" style="color:<?php echo esc_attr( $t['ink'] ); ?>;">sharpewysman.com</a></p>
      <p style="margin:14px 0 0;font-size:12px;color:#8a888d;"><?php echo esc_html( $args['footer_note'] ); ?><br>&copy; <?php echo esc_html( $year ); ?> Sharpe Wysman. Integrity, expertise and professionalism since 2008.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
	<?php
	return trim( ob_get_clean() );
}

/* ------------------------------------------------------------ templates */

/**
 * Render a template. $data: kind, topic, name, email, phone, company, linkedin,
 * message, jobTitle, jobSlug, has_cv, admin_url
 * Returns array( 'subject', 'html', 'text' ).
 */
function sw_render_email( $template, $data ) {
	$t     = sw_email_tokens();
	$first = esc_html( trim( strtok( (string) $data['name'], ' ' ) ) );
	$p     = function ( $html ) use ( $t ) {
		return '<p style="margin:0 0 18px;font-family:' . $t['sans'] . ';font-size:16px;line-height:1.65;color:' . $t['muted'] . ';">' . $html . '</p>';
	};
	$h2    = function ( $text ) use ( $t ) {
		return '<p style="margin:30px 0 16px;font-family:' . $t['serif'] . ';font-size:20px;line-height:1.3;color:' . $t['ink'] . ';">' . esc_html( $text ) . '</p>';
	};
	$quote = function ( $text ) use ( $t ) {
		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px;"><tr><td style="border-left:3px solid ' . $t['gold'] . ';padding:4px 0 4px 18px;font-family:' . $t['serif'] . ';font-style:italic;font-size:16px;line-height:1.6;color:' . $t['ink'] . ';">' . nl2br( esc_html( $text ) ) . '</td></tr></table>';
	};
	$settings = function_exists( 'sw_get_settings' ) ? sw_get_settings() : array( 'phone' => '604 779 5251' );
	$phone    = esc_html( $settings['phone'] );
	$digits   = preg_replace( '/\D/', '', $settings['phone'] );
	$tel      = '+' . ( 10 === strlen( $digits ) ? '1' : '' ) . $digits;

	switch ( $template ) {
		case 'team_notification':
			$is_apply = 'apply' === $data['kind'];
			$labels   = array( 'hire' => 'Hiring enquiry', 'register' => 'Candidate registration', 'general' => 'General enquiry' );
			$type     = $is_apply ? 'Job application' : ( isset( $labels[ $data['topic'] ] ) ? $labels[ $data['topic'] ] : 'Enquiry' );
			$subject  = $is_apply ? sprintf( 'Application: %s, from %s', $data['jobTitle'], $data['name'] ) : sprintf( '%s from %s', $type, $data['name'] );
			$fields   = array(
				'Name'     => esc_html( $data['name'] ),
				'Email'    => '<a href="mailto:' . esc_attr( $data['email'] ) . '" style="color:' . $t['accent'] . ';">' . esc_html( $data['email'] ) . '</a>',
				'Phone'    => $data['phone'] ? '<a href="tel:' . esc_attr( preg_replace( '/[^\d+]/', '', $data['phone'] ) ) . '" style="color:' . $t['ink'] . ';text-decoration:none;">' . esc_html( $data['phone'] ) . '</a>' : '',
				'Company'  => esc_html( $data['company'] ),
				'LinkedIn' => $data['linkedin'] ? '<a href="' . esc_url( $data['linkedin'] ) . '" style="color:' . $t['accent'] . ';">View profile</a>' : '',
				'Role'     => $is_apply ? '<a href="' . esc_url( sw_email_frontend_url( '/jobs/' . $data['jobSlug'] ) ) . '" style="color:' . $t['accent'] . ';">' . esc_html( $data['jobTitle'] ) . '</a>' : '',
				'Resume'   => ! empty( $data['has_cv'] ) ? '&#10003; Attached to this email' : '',
			);
			$body  = $p( 'A new ' . strtolower( $type ) . ' just came in through the website.' );
			$body .= sw_email_fields( $fields );
			if ( $data['message'] ) {
				$body .= $h2( 'Their message' ) . $quote( $data['message'] );
			}
			$body .= '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr><td style="padding-right:10px;">'
				. sw_email_button( 'Reply to ' . $first, 'mailto:' . $data['email'] . '?subject=' . rawurlencode( 'Re: ' . $subject ), 'gold' )
				. '</td><td>' . sw_email_button( 'Open in WordPress', $data['admin_url'], 'ink' ) . '</td></tr></table>';
			return array(
				'subject' => '[Website] ' . $subject,
				'html'    => sw_email_layout(
					array(
						'preheader'   => $type . ' from ' . $data['name'] . ( $is_apply ? ' for ' . $data['jobTitle'] : '' ),
						'eyebrow'     => $type,
						'title'       => esc_html( $is_apply ? $data['jobTitle'] : $data['name'] ),
						'body_html'   => $body,
						'footer_note' => 'Internal notification from the sharpewysman.com website.',
					)
				),
				'text'    => sprintf( "%s\n\n%s\n\nName: %s\nEmail: %s\nPhone: %s\nCompany: %s\nLinkedIn: %s\nRole: %s\nResume: %s\n\nMessage:\n%s\n\nOpen in WordPress: %s", $type, str_repeat( '-', 40 ), $data['name'], $data['email'], $data['phone'], $data['company'], $data['linkedin'], $data['jobTitle'], ! empty( $data['has_cv'] ) ? 'attached' : 'none', $data['message'], $data['admin_url'] ),
			);

		case 'confirm_application':
			$steps = array(
				array( 'A recruiter reviews your application', 'Usually within two business days. A person reads every application, not a filter.' ),
				array( 'A confidential conversation', 'If there\'s a fit, we call to learn about your goals and tell you more about the firm.' ),
				array( 'Nothing is shared without your say-so', 'Your resume only goes to the employer once you\'ve agreed, for this specific role.' ),
			);
			$body  = $p( 'Hi ' . $first . ',' );
			$body .= $p( 'Thank you for applying for <strong style="color:' . $t['ink'] . ';">' . esc_html( $data['jobTitle'] ) . '</strong>. Your application and resume have arrived safely with our team.' );
			$body .= $h2( 'What happens next' ) . sw_email_steps( $steps );
			$body .= $p( 'In the meantime, many of our searches are never advertised. If this role isn\'t the one, we may well have another that is.' );
			$body .= '<div style="margin:6px 0 26px;">' . sw_email_button( 'Browse current roles', sw_email_frontend_url( '/jobs' ) ) . '</div>';
			$body .= $p( 'Questions? Simply reply to this email or call us on <a href="tel:+16047795251" style="color:' . $t['ink'] . ';font-family:' . $t['mono'] . ';text-decoration:none;">' . $phone . '</a>.' );
			$body .= $p( 'Warm regards,<br><strong style="color:' . $t['ink'] . ';">The Sharpe Wysman team</strong>' );
			return array(
				'subject' => 'We\'ve received your application: ' . $data['jobTitle'],
				'html'    => sw_email_layout(
					array(
						'preheader'   => 'Thanks, ' . $first . '. A recruiter will review your application, usually within two business days.',
						'eyebrow'     => 'Application received',
						'title'       => 'Thank you, ' . $first . '.<br><em style="font-style:italic;color:' . $t['accent'] . ';">It\'s in good hands.</em>',
						'body_html'   => $body,
						'footer_note' => 'You\'re receiving this because you applied for a role at sharpewysman.com.',
					)
				),
				'text'    => "Hi {$data['name']},\n\nThank you for applying for {$data['jobTitle']}. Your application has arrived safely.\n\nWhat happens next:\n1. A recruiter reviews your application, usually within two business days.\n2. If there's a fit, we'll call you for a confidential conversation.\n3. Your resume is never shared without your permission.\n\nBrowse current roles: " . sw_email_frontend_url( '/jobs' ) . "\n\nQuestions? Reply to this email or call {$settings['phone']}.\n\nThe Sharpe Wysman team",
			);

		case 'confirm_hire':
			$steps = array(
				array( 'We reply within one business day', 'A senior recruiter, not an assistant, will be in touch personally.' ),
				array( 'A 15 to 20 minute briefing', 'We learn about the role, your team and culture, and what success looks like.' ),
				array( 'An honest view of the market', 'Availability, realistic salary ranges and timings, before you commit to anything.' ),
			);
			$body  = $p( 'Hi ' . $first . ',' );
			$body .= $p( 'Thank you for getting in touch about hiring' . ( $data['company'] ? ' at <strong style="color:' . $t['ink'] . ';">' . esc_html( $data['company'] ) . '</strong>' : '' ) . '. We\'ve received your message and a recruiter will be in touch shortly.' );
			if ( $data['message'] ) {
				$body .= $h2( 'What you told us' ) . $quote( $data['message'] );
			}
			$body .= $h2( 'What happens next' ) . sw_email_steps( $steps );
			$body .= '<div style="margin:6px 0 26px;">' . sw_email_button( 'How we work with employers', sw_email_frontend_url( '/employers' ) ) . '</div>';
			$body .= $p( 'If the hire is urgent, call us directly on <a href="tel:+16047795251" style="color:' . $t['ink'] . ';font-family:' . $t['mono'] . ';text-decoration:none;">' . $phone . '</a>.' );
			$body .= $p( 'Kind regards,<br><strong style="color:' . $t['ink'] . ';">The Sharpe Wysman team</strong>' );
			return array(
				'subject' => 'Thanks, we\'ll be in touch about your hire',
				'html'    => sw_email_layout(
					array(
						'preheader'   => 'A senior recruiter will reply within one business day.',
						'eyebrow'     => 'Hiring enquiry received',
						'title'       => 'Let\'s find the right person, <em style="font-style:italic;color:' . $t['accent'] . ';">together.</em>',
						'body_html'   => $body,
						'footer_note' => 'You\'re receiving this because you contacted Sharpe Wysman through sharpewysman.com.',
					)
				),
				'text'    => "Hi {$data['name']},\n\nThank you for getting in touch about hiring. A recruiter will reply within one business day.\n\nWhat happens next:\n1. We reply within one business day.\n2. A 15-20 minute briefing about the role and your team.\n3. An honest view of the market before you commit.\n\nUrgent? Call {$settings['phone']}.\n\nThe Sharpe Wysman team",
			);

		case 'confirm_register':
		case 'confirm_general':
			$register = 'confirm_register' === $template;
			$steps    = $register
				? array(
					array( 'We read your details', 'A recruiter who has worked in your field reviews your background.' ),
					array( 'A confidential conversation', 'We learn what you\'re looking for: role, firm, salary and timing.' ),
					array( 'We call when the right role appears', 'Including searches that are never advertised.' ),
				)
				: array(
					array( 'We reply within one business day', 'Your message goes straight to a member of the team.' ),
					array( 'A straight answer', 'If we can help, we\'ll tell you how. If we can\'t, we\'ll say so.' ),
				);
			$body  = $p( 'Hi ' . $first . ',' );
			$body .= $p( $register ? 'Thank you for registering with Sharpe Wysman. Your details have reached our team, and everything you share stays confidential.' : 'Thank you for your message. It has reached our team and we\'ll reply shortly.' );
			$body .= $h2( 'What happens next' ) . sw_email_steps( $steps );
			$body .= '<div style="margin:6px 0 26px;">' . sw_email_button( $register ? 'See current roles' : 'Visit our website', sw_email_frontend_url( $register ? '/jobs' : '/' ) ) . '</div>';
			$body .= $p( 'Speak soon,<br><strong style="color:' . $t['ink'] . ';">The Sharpe Wysman team</strong>' );
			return array(
				'subject' => $register ? 'You\'re registered with Sharpe Wysman' : 'Thanks for your message',
				'html'    => sw_email_layout(
					array(
						'preheader'   => $register ? 'Your details are with our team, and they stay confidential.' : 'We\'ll reply within one business day.',
						'eyebrow'     => $register ? 'Registration received' : 'Message received',
						'title'       => $register ? 'Welcome, ' . $first . '. <em style="font-style:italic;color:' . $t['accent'] . ';">Let\'s find your next move.</em>' : 'Thank you, ' . $first . '.',
						'body_html'   => $body,
						'footer_note' => 'You\'re receiving this because you contacted Sharpe Wysman through sharpewysman.com.',
					)
				),
				'text'    => "Hi {$data['name']},\n\n" . ( $register ? 'Thank you for registering with Sharpe Wysman. Your details are confidential.' : 'Thank you for your message. We\'ll reply within one business day.' ) . "\n\nThe Sharpe Wysman team\n" . sw_email_frontend_url( '/' ),
			);
	}
	return null;
}

/**
 * Send a rendered template as HTML with a plain-text alternative.
 */
function sw_send_email( $to, $email, $headers = array(), $attachments = array() ) {
	if ( ! $email ) {
		return false;
	}
	$alt = function ( $phpmailer ) use ( $email ) {
		$phpmailer->AltBody = $email['text'];
	};
	add_action( 'phpmailer_init', $alt );
	$headers[] = 'Content-Type: text/html; charset=UTF-8';
	$ok        = wp_mail( $to, $email['subject'], $email['html'], $headers, $attachments );
	remove_action( 'phpmailer_init', $alt );
	return $ok;
}
