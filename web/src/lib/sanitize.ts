import "server-only";
import sanitizeHtml from "sanitize-html";
import { noDashes } from "./text";

/**
 * Sanitises CMS HTML before it is rendered with dangerouslySetInnerHTML.
 * Strips page-builder wrappers, inline styles and scripts while keeping
 * semantic content (headings, lists, links, emphasis, tables).
 */
export function cleanHtml(html: string): string {
  const out = sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "ul", "ol", "li", "a", "strong", "em", "b", "i", "blockquote", "br", "hr", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption", "img"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      // Legal pages on the old site use h5/h6 for sections; promote for a sane outline.
      h1: "h2",
      h5: "h3",
      h6: "h4",
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "") && !/sharpewysman\.com/.test(attribs.href ?? "");
        return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
      },
    },
    exclusiveFilter: (frame) => ["p", "li", "h2", "h3", "h4"].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
  });
  // Point links at the old WP domain to relative paths; enforce the no-dash house style
  return noDashes(out.replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "\u2014")).replace(/href="https?:\/\/(www\.)?sharpewysman\.com\/?/g, 'href="/');
}

/** Drops a leading heading that duplicates the page title (common in WP content). */
export function dropLeadingTitle(html: string, title: string): string {
  const re = new RegExp(`^\\s*<h[1-4][^>]*>\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*</h[1-4]>`, "i");
  return html.replace(re, "");
}
