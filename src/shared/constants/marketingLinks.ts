/** Contact and conversion links for the public marketing site, shared by the shell and every page. */

export const DEMO_BOOKING_URL = import.meta.env.VITE_DEMO_BOOKING_URL || "/contact";
export const ADVISOR_URL = "/contact";

/** Opens the contact form with "Pricing & quotation" already chosen. */
export const QUOTATION_URL = "/contact?topic=pricing";

/** Team inbox that receives contact-form messages (the API's CONTACT_FORM_RECIPIENT). */
export const CONTACT_EMAIL = "info@repromas.com";

const rawSalesWhatsapp = (import.meta.env.VITE_SALES_WHATSAPP ?? "").replace(/\D/g, "");
const salesWhatsapp = /^0\d{10}$/.test(rawSalesWhatsapp)
  ? `234${rawSalesWhatsapp.slice(1)}`
  : rawSalesWhatsapp;

/** wa.me link with a prefilled message, or null when no sales number is configured. */
export const WHATSAPP_URL: string | null = salesWhatsapp
  ? `https://wa.me/${salesWhatsapp}?text=${encodeURIComponent("Hello REPROMAS, I'd like to know more about a pilot.")}`
  : null;

export const MARKETING_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Rubik:wght@400;500;600&display=swap";
