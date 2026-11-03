import type { Metadata } from "next";
import type { Article, Faq, Job, SiteSettings, TeamMember } from "./types";
import { FOUNDED_YEAR, SITE, SITE_URL } from "./site";

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

/** Page metadata with canonical URL, Open Graph and Twitter cards. */
export function buildMetadata({ title, description, path, image, type = "website", publishedTime, modifiedTime, noindex }: MetaInput): Metadata {
  const url = abs(path);
  const images = image ? [{ url: image.startsWith("http") ? image : abs(image) }] : undefined;
  return {
    // Titles that already carry the brand skip the "%s | Sharpe Wysman" template.
    title: title.includes(SITE.name) ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      ...(images ? { images } : {}),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/* ------------------------------------------------------------- JSON-LD */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": ["EmploymentAgency", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: abs("/images/logo-dark.png"),
    image: abs("/images/vancouver-skyline.jpg"),
    description: SITE.description,
    foundingDate: String(FOUNDED_YEAR),
    founder: { "@type": "Person", "@id": `${SITE_URL}/about#founder`, name: SITE.founder },
    telephone: settings.phoneHref,
    ...(settings.email ? { email: settings.email } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.addressLocality,
      addressRegion: settings.addressRegion,
      addressCountry: settings.addressCountry,
    },
    areaServed: [
      { "@type": "City", name: "Vancouver" },
      { "@type": "City", name: "Surrey" },
      { "@type": "City", name: "Burnaby" },
      { "@type": "City", name: "Richmond" },
      { "@type": "AdministrativeArea", name: "Metro Vancouver" },
      { "@type": "AdministrativeArea", name: "British Columbia" },
    ],
    knowsAbout: [
      "Accounting recruitment",
      "CPA recruitment",
      "Tax recruitment",
      "Audit and assurance recruitment",
      "Finance executive search",
      "Controller recruitment",
      "Contingency search",
      "Workplace consulting",
    ],
    sameAs: [settings.linkedin],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-CA",
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function jobPostingLd(job: Job, settings: SiteSettings) {
  const html = [
    job.body,
    job.highlights.length ? `<h3>Highlights</h3><ul>${job.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>` : "",
    job.requirements.length ? `<h3>What you'll bring</h3><ul>${job.requirements.map((h) => `<li>${h}</li>`).join("")}</ul>` : "",
  ].join("");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: html,
    identifier: { "@type": "PropertyValue", name: SITE.name, value: job.slug },
    datePosted: job.datePosted,
    ...(job.validThrough ? { validThrough: `${job.validThrough}T23:59:59-08:00` } : {}),
    employmentType: job.employmentType,
    // Client names are confidential; the agency is listed as the hiring organization.
    hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE_URL, logo: abs("/images/logo-dark.png") },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: settings.addressRegion,
        addressCountry: settings.addressCountry,
      },
    },
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "CAD",
            value: { "@type": "QuantitativeValue", minValue: job.salaryMin, maxValue: job.salaryMax ?? job.salaryMin, unitText: "YEAR" },
          },
        }
      : {}),
    directApply: true,
    url: abs(`/jobs/${job.slug}`),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    dateModified: a.modified ?? a.date,
    author: { "@type": "Organization", name: a.author, url: SITE_URL },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: abs(`/insights/${a.slug}`),
    ...(a.image ? { image: abs(a.image) } : {}),
  };
}

export function personLd(p: TeamMember, isFounder = false) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    ...(isFounder ? { "@id": `${SITE_URL}/about#founder` } : {}),
    name: p.name,
    jobTitle: p.role,
    worksFor: { "@id": ORG_ID },
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.linkedin ? { sameAs: [p.linkedin] } : {}),
    ...(isFounder
      ? { hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "Professional designation", name: "Chartered Accountant" } }
      : {}),
  };
}
