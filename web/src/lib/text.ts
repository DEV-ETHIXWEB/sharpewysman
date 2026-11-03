/**
 * House style: no em dashes or en dashes anywhere on the site.
 * Applied to all CMS text so editors can never reintroduce them.
 *  - numeric ranges ("100–125", "$130,000—$170,000") become "100 to 125"
 *  - em dashes and spaced dashes used as punctuation become a comma
 *  - an unspaced en dash between words ("Vancouver–Seattle") becomes a hyphen
 */
export function noDashes(s: string): string {
  return s
    .replace(/(\d[\d,.]*[kK]?)\s*[–—]\s*(\$?\d)/g, "$1 to $2")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s+–\s+/g, ", ")
    .replace(/–/g, "-")
    .replace(/,\s*,/g, ",");
}
