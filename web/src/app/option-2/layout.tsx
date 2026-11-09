import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistSerif } from "geist/font/serif";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/option-2/components/Header";
import { Footer } from "@/option-2/components/Footer";
import { JsonLd } from "@/option-2/components/ui";
import { GA_ID, SITE, SITE_URL } from "@/lib/site";
import { organizationLd, websiteLd } from "@/lib/seo";
import { getSettings } from "@/option-2/wp";
import { MotionRuntime } from "@/option-2/components/motion/MotionRuntime";
import { ChatLauncher } from "@/option-2/components/assistant/ChatLauncher";
import { CookieConsent } from "@/option-2/components/CookieConsent";

/**
 * Typography: the Geist family (Vercel, OFL) throughout:
 *  - Geist Serif: headings, hero display and accents. A single upright weight (400),
 *    the same restrained role Source Serif 4 held before.
 *  - Geist Sans: body, UI and hero micro-copy, variable weight 100 to 900.
 *  - Geist Mono: figures only (statistics, salaries, step numbers), tabular by design.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Accounting & Finance Recruiters in Vancouver | Sharpe Wysman",
    template: "%s | Sharpe Wysman",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: false },
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: "website" },
  // Review design: search engines only ever see Option 1.
  robots: { index: false, follow: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#1e1d1f",
  width: "device-width",
  initialScale: 1,
};


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html
      lang="en-CA"
      className={`${GeistSans.variable} ${GeistSerif.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Enables motion styles only when JS runs, so content is never hidden without it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <MotionRuntime />
        <JsonLd data={[organizationLd(settings), websiteLd()]} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <ChatLauncher />
        {GA_ID ? (
          <>
            {/* Consent Mode v2: analytics stays off until the visitor accepts; ads are never used. */}
            <Script id="ga-consent" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var c=null;try{c=localStorage.getItem('sw-consent')}catch(e){}gtag('consent','default',{analytics_storage:c==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <CookieConsent />
          </>
        ) : null}
      </body>
    </html>
  );
}
