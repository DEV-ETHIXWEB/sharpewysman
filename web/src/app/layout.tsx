import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Lato, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/ui";
import { SITE, SITE_URL } from "@/lib/site";
import { organizationLd, websiteLd } from "@/lib/seo";
import { getSettings } from "@/lib/wp";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { ChatLauncher } from "@/components/assistant/ChatLauncher";

/**
 * Typography
 *  - Source Serif 4 (Adobe, OFL): headings and accents. Robust rendering on Windows,
 *    professional-publishing pedigree. Loaded at the single weight the design uses (400, upright).
 *  - Lato: body and UI. Continuity with the Sharpe Wysman wordmark.
 *  - IBM Plex Mono: figures only (statistics, salaries, step numbers), tabular by design.
 */
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-serif-4",
  display: "swap",
});
/** Hero headlines: refined geometric sans, semibold, upright. */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: "600", variable: "--font-jakarta", display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap", preload: false });

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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#1e1d1f",
  width: "device-width",
  initialScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html
      lang="en-CA"
      className={`${serif.variable} ${jakarta.variable} ${lato.variable} ${plexMono.variable}`}
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
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
