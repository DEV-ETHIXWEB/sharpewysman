/**
 * Google Analytics 4 helpers (client side). Everything is a no-op unless
 * NEXT_PUBLIC_GA_ID is set and the visitor has accepted analytics cookies.
 */

export const CONSENT_KEY = "sw-consent";
export type Consent = "granted" | "denied";

type Gtag = (...args: unknown[]) => void;
const gtag = (): Gtag | undefined => (typeof window === "undefined" ? undefined : (window as unknown as { gtag?: Gtag }).gtag);

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
  gtag()?.("consent", "update", { analytics_storage: value });
}

/**
 * Conversion event. Called only after the server has confirmed the enquiry was
 * delivered, never on click. Sends the form type only: no personal data.
 */
export function trackLead(form: string) {
  gtag()?.("event", "generate_lead", { form_type: form });
}
