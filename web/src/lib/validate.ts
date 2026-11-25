/**
 * Field rules shared by the browser forms and the server route, so a value the
 * form accepts is never rejected later with a generic error.
 */
export const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;
export const PHONE_RE = /^[\d\s()+.\-x]{7,40}$/i;
export const CV_EXT_RE = /\.(pdf|docx?)$/i;
export const CV_MAX_MB = 5;

/** Returns a normalised https URL, or null if it can't be a web address. */
export function normaliseUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
