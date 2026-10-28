/**
 * Switches for parts of the public marketing site that are built but not yet published.
 *
 * Pricing is hidden until management agrees the pricing model: the page, its nav and footer links are off, and
 * /pricing redirects to the contact form with "Pricing & quotation" selected, so every price is discussed with us.
 * Set VITE_SHOW_PRICING=true (e.g. on staging) to review the page before it goes live.
 */
export const SHOW_PRICING_PAGE = import.meta.env.VITE_SHOW_PRICING === "true";
