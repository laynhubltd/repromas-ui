/** Header and footer navigation for the public marketing site. */

import { SHOW_PRICING_PAGE } from "@/shared/constants/marketingFeatures";
import { QUOTATION_URL } from "@/shared/constants/marketingLinks";

export {
  ADVISOR_URL,
  DEMO_BOOKING_URL,
  MARKETING_FONTS_URL,
  WHATSAPP_URL,
} from "@/shared/constants/marketingLinks";

export type MarketingNavLink = {
  label: string;
  to: string;
  description?: string;
};

export type MarketingNavItem = {
  label: string;
  to?: string;
  children?: MarketingNavLink[];
};

export const MARKETING_NAV: MarketingNavItem[] = [
  {
    label: "Features",
    children: [
      { label: "All features", to: "/platform", description: "31 modules on one record" },
      { label: "Admissions", to: "/platform#pf-admissions", description: "Cycles, screening, matric numbers" },
      { label: "Bursary", to: "/platform#pf-bursary", description: "Fees, invoices, Remita, Flutterwave" },
      { label: "Academics", to: "/platform#pf-academics", description: "Curriculum, registration, score entry" },
      { label: "Results & governance", to: "/platform#pf-governance", description: "Approvals, broadsheet, senate" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "Universities", to: "/#why", description: "NUC CCMAS, 5.0 scale" },
      { label: "Polytechnics", to: "/#why", description: "NBTE, ND and HND" },
      { label: "Colleges of Education", to: "/#why", description: "NCCE, NCE" },
    ],
  },
  ...(SHOW_PRICING_PAGE ? [{ label: "Pricing", to: "/pricing" }] : []),
  {
    label: "Resources",
    children: [
      { label: "REPROMAS Academy", to: "/platform#pf-services", description: "Staff training videos" },
      { label: "Security & NDPA", to: "/#verify", description: "Claims you can check" },
      { label: "Contact", to: "/contact", description: "Talk to the team" },
    ],
  },
];

export type MarketingFooterColumn = {
  title: string;
  links: MarketingNavLink[];
};

export const MARKETING_FOOTER: MarketingFooterColumn[] = [
  {
    title: "Solutions",
    links: [
      { label: "Universities", to: "/#why" },
      { label: "Polytechnics", to: "/#why" },
      { label: "Colleges of Education", to: "/#why" },
      { label: "State systems", to: QUOTATION_URL },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "All features", to: "/platform" },
      { label: "Admissions", to: "/platform#pf-admissions" },
      { label: "Bursary & fees", to: "/platform#pf-bursary" },
      { label: "Course registration", to: "/platform#pf-academics" },
      { label: "Results & senate", to: "/platform#pf-governance" },
      { label: "Student portal", to: "/platform#pf-people" },
    ],
  },
  {
    title: "By Role",
    links: [
      { label: "For Registrars", to: "/#why" },
      { label: "For Bursars", to: "/#why" },
      { label: "For Exams & Records", to: "/#why" },
      { label: "For ICT Directors", to: "/#verify" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "REPROMAS Academy", to: "/platform#pf-services" },
      { label: "Security & NDPA", to: "/#verify" },
      ...(SHOW_PRICING_PAGE ? [{ label: "Pricing", to: "/pricing" }] : []),
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Register your institution", to: "/tenant-signup" },
      { label: "Privacy notice", to: "/privacy" },
    ],
  },
];
