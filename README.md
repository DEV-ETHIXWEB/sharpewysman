# Sharpe Wysman: headless website

The new sharpewysman.com: a **Next.js 15** frontend with **WordPress as the headless CMS**.

```
sharpewysman/
├── web/                              Next.js 15 (App Router, TypeScript, Tailwind v4)
│   ├── src/app/                      Routes, sitemap, robots, OG image, llms.txt, API routes
│   ├── src/components/               UI components
│   ├── src/content/                  Launch content (fallback + seed for WordPress)
│   ├── src/lib/wp.ts                 WordPress REST client (with automatic fallback)
│   ├── src/lib/seo.ts                Metadata + JSON-LD (Organization, JobPosting, FAQ, Article…)
│   └── scripts/export-seed.mts       Writes content → wordpress plugin seed.json
├── wordpress/sharpe-wysman-headless/ WordPress plugin (install on the CMS)
└── _source/images/                   Original images downloaded from the old site
```

## How it fits together

```
Editors ──► WordPress (cms.sharpewysman.com) ──REST──► Next.js (sharpewysman.com) ──► Visitors
                │   save → POST /api/revalidate ──────────┘ (page updates in seconds)
                ◄── POST /wp-json/sw/v1/enquiry ◄── contact & job application forms
```

* Pages are pre-rendered as static HTML and refreshed every 10 minutes, or **instantly** when
  an editor saves in WordPress.
* If WordPress is unreachable, the site keeps serving the last good version, falling back to the bundled
  launch content in `web/src/content`.
* Form submissions are validated in Next.js, then stored in WordPress (**Enquiries**) and emailed
  through the existing **WP Mail SMTP** setup. Resumes are stored outside the public uploads folder
  and can only be downloaded by logged-in editors.

## What editors manage in WordPress

| Menu | Drives |
|---|---|
| **Jobs** | `/jobs`, each `/jobs/[slug]` page, Google Jobs structured data, hero "Open roles" card |
| **Industries** | `/industries/[slug]`, menus, homepage tiles |
| **Testimonials** | Homepage, Employers, Candidates, `/testimonials` |
| **Team** | `/team`, About, Contact |
| **FAQs** | `/faq` + FAQ rich results |
| **Case studies** | `/case-studies`. Hidden until the first one is published |
| **Posts** | `/insights` blog |
| **Pages → Privacy Policy / Terms & Conditions** | Legal pages |
| **Settings → Sharpe Wysman** | Phone, public email, enquiry inbox, LinkedIn, homepage statistics |

## Local development

```bash
cd web
cp .env.example .env.local     # fill in values
npm install
npm run dev                    # http://localhost:3000
```

Without `.env.local` the site reads from `https://sharpewysman.com` and falls back to the bundled content.

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Deployment (recommended)

1. **Move WordPress to a subdomain.** On Cloudways, add `cms.sharpewysman.com` as the app's primary
   domain, add a DNS `A` record for `cms` in Namecheap, and issue the SSL certificate for it.
2. **Install the plugin.** Zip `wordpress/sharpe-wysman-headless/`, upload it under Plugins → Add New,
   then activate it. On first activation it imports all launch content (jobs, industries,
   testimonials, team, FAQs, articles).
3. **Add to `wp-config.php`:**
   ```php
   define( 'SW_FRONTEND_URL', 'https://sharpewysman.com' );
   define( 'SW_REVALIDATE_SECRET', '<openssl rand -hex 32>' );
   define( 'SW_FORMS_SECRET', '<openssl rand -hex 32>' );
   define( 'SW_REDIRECT_FRONTEND', true ); // old theme URLs → new site
   ```
4. **Deploy to Netlify (free plan; commercial sites allowed).** Connect the repository. `netlify.toml`
   already points the build at `web/`. Set the environment variables from `.env.example`, with
   `WORDPRESS_URL=https://cms.sharpewysman.com` and the same two secrets.
   *Vercel's free "Hobby" plan does not allow commercial websites, so it is not used here.*
5. **Point the domain at Netlify.** In Netlify, go to Domain management, add `sharpewysman.com`, and
   follow the DNS records it shows (apex `A` record + `www` CNAME) in Namecheap. Set `www` to
   redirect to the apex. Netlify issues the free Let's Encrypt SSL certificate automatically.
6. **In WordPress Settings → Sharpe Wysman,** set the enquiry inbox and the public email. Then send a
   test enquiry from `/contact`.
7. **Google Search Console:** verify the domain, submit `https://sharpewysman.com/sitemap.xml`,
   and request indexing for `/`, `/jobs` and `/employers`.

Every old WordPress URL (`/accounting`, `/our-values`, `/contact-us`, `/insurance`, `/test`,
`/new-home`, …) permanently redirects to its new page (see `web/next.config.ts`).

## Cost: free

Every part of the stack is free:

| Part | Tool | Cost |
|---|---|---|
| Frontend | Next.js, React, Tailwind (MIT) | Free |
| Hosting | Netlify free plan | Free (commercial use allowed) |
| CMS | WordPress + `sharpe-wysman-headless` plugin, on the existing Cloudways server | No extra cost |
| Fonts | Source Serif 4, Lato, IBM Plex Mono via Google Fonts (SIL Open Font License), self-hosted at build | Free |
| Icons | Custom set drawn for this site (`web/src/components/icons.tsx`) | Free, owned by the client |
| Image upscaling | Upscayl / Real-ESRGAN (AGPL, runs locally) | Free |
| Email | Existing WP Mail SMTP setup | No extra cost |
| SSL | Let's Encrypt (Netlify + Cloudways) | Free |

## Images and brand assets

All photos in `web/public/images` are high-quality masters made from the best source available:

* **Native high-resolution originals** (6000 to 7952 px, downloaded from the old site's media library)
  were downsampled with Lanczos and lightly sharpened: Vancouver skyline, partners office,
  candidate interview, team meeting.
* **Low-resolution images** were AI-upscaled locally with **Upscayl's High-fidelity 4× model**
  (Real-ESRGAN). It was chosen after a side-by-side test against UltraSharp, Remacri and Standard on the
  founder's portrait, because it keeps natural skin texture. These are: Sukhjit (800 → 3200 px),
  Sonia, the two team photos (1280 → 5120 px) and the gold handshake (1920 → 3840 px).
* Lossless PNG masters are kept in `_source/hq/`, and the untouched originals in `_source/originals/`.
* Next.js serves each visitor a right-sized AVIF/WebP version of every image automatically.
* The old site's client logos (Kolmeo, Swift, Wesfarmers, Dixa, Bueno, Vintrace, Edrolo) came with
  the theme template. They are not Sharpe Wysman clients and are deliberately not used.

To re-run the upscaler on a new image:
```bash
/Applications/Upscayl.app/Contents/Resources/bin/upscayl-bin -i in.jpg -o out.png -s 4 \
  -m /Applications/Upscayl.app/Contents/Resources/models -n high-fidelity-4x -f png
```

## Custom UI

* **Icons:** a bespoke set (navigation, contact, job details, five industries, three services, quote mark)
  drawn on a 24/32 px grid with calligraphic, pen-tick strokes. Open crescents echo the logo.
  Only the LinkedIn mark uses the official glyph, as LinkedIn's brand rules require.
* **Buttons:** an ink-sweep fill on hover, an arrow "chip" that nudges forward and changes colour,
  and an inset bevel on solid buttons. One token set covers four variants (gold, ink, ghost, ghost-light).
* **Form controls:** a custom checkbox that draws a gold tick, a drag-and-drop resume zone, and
  pill-style topic selectors. All of them keep native inputs underneath for accessibility.
* **Menu button:** two ledger rules of unequal length that fold into a cross.

## Hero film

The homepage hero plays a gold handshake film (generated, then AI-upscaled 4x frame by frame with Upscayl and trimmed at the strongest resting frame).

* `web/public/video/`: 1440p and 1080p in AV1, HEVC and H.264 (SSIM 0.996+ against the master), plus stills.
* `HeroVideo.tsx` chooses the resolution from the real rendered size x pixel ratio, and the browser picks the best codec.
* It plays once, then rests on the final frame with a breathing glow. With reduced motion or Save-Data, or if autoplay is blocked, visitors see a crisp still instead.

## Website assistant (no LLM)

`web/src/lib/assistant/engine.ts` is a deterministic conversational engine. It uses intent detection, BM25 retrieval, typo correction, conversation memory and a glossary. It answers only from live WordPress content (`/api/assistant`), so it cannot invent facts, and it hands off to a recruiter when unsure. The UI streams replies, shows job cards and suggestion chips, and loads only when opened.

## Emails

`wordpress/sharpe-wysman-headless/includes/emails.php` contains the branded HTML emails: a team notification with the resume attached, plus confirmations for job applications, hiring enquiries, registrations and general messages. They use table layouts with inlined styles and a plain-text alternative. Run `php tools/preview-emails.php` in the plugin folder to render previews to `tools/email-previews/`. Confirmation emails can be switched off in WP Admin > Settings > Sharpe Wysman.

## House style

* No em dashes or en dashes anywhere. `web/src/lib/text.ts` normalises all WordPress content automatically.
* Canadian English, North American phone format (604-779-5251), CAD in structured data.

## SEO built in

* A unique title, meta description, canonical URL and Open Graph / Twitter card on every page,
  plus an auto-generated share image.
* JSON-LD structured data: `EmploymentAgency` (with founder, area served and services), `WebSite`,
  `BreadcrumbList`, `JobPosting` (Google Jobs eligible), `FAQPage`, `Article`, `Person` and `Service`.
* A dynamic `sitemap.xml` built from WordPress content, `robots.txt` (preview deployments are never
  indexed), and `llms.txt` for AI search assistants.
* One H1 per page, a semantic heading order, and alt text on every image.
* Lighthouse (mobile, production build): Performance 94 to 98, Accessibility 100, Best Practices 100, SEO 100.

## Content to confirm with the client before launch

* **Jobs:** the nine roles carried over from the old site. Confirm which are still open, or mark
  the rest *Filled* in WordPress.
* **Statistics:** 600+ placements and 100+ clients come from the old site's counters. Confirm them or
  update them in Settings.
* **Team:** Sukhjit and Sonia only. "Lan" was removed (AI stock photo, overseas number). Add real
  team members with photos and email addresses.
* **Public email address** for the contact page and footer. The old site showed none.
* **FAQ answers** about fees and confidentiality are written to industry norms. Confirm they match
  how the client works.
* **Privacy policy and terms:** the current text is a generic template (it mentions shipping and
  payments). It should be replaced with a recruitment-specific policy that complies with PIPEDA.
* **Case studies, awards and client logos:** none exist yet. Add real ones in WordPress. Template
  logos and "AllSquares" content from the old site were intentionally not carried over.
* **Insights:** three launch articles were written for SEO and need the client's review.
