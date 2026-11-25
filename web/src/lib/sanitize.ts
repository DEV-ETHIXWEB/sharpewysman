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
        if (external) return { tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } };
        // Our own links open in the same tab (the old site set target="_new" on some).
        const { target: _t, rel: _r, ...own } = attribs;
        void _t;
        void _r;
        return { tagName, attribs: own };
      },
    },
    exclusiveFilter: (frame) => ["p", "li", "h2", "h3", "h4"].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length,
  });
  // Point links at the old WP domain to relative paths; enforce the no-dash house style
  return noDashes(out.replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "\u2014")).replace(/href="https?:\/\/(www\.)?sharpewysman\.com\/?/g, 'href="/');
}

/** Drops a leading heading that duplicates the page title (common in WP content). */
export function dropLeadingTitle(html: string, title: string): string {
  const norm = (t: string) =>
    t
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;|&/g, " and ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const m = html.match(/^\s*<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
  return m && norm(m[1]) === norm(title) ? html.slice(m[0].length) : html;
}

/**
 * Template placeholders left in the client's legal pages, filled with the facts
 * that apply to a Vancouver firm. The client should still confirm them with counsel.
 */
export function fillLegalPlaceholders(html: string): string {
  return html.replace(/\[Your Jurisdiction\]/gi, "the Province of British Columbia and the federal laws of Canada that apply there");
}
