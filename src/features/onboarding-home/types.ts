import type { MarketingIconId } from "@/assets/illustrations/MarketingModuleIcons";

export type HomeModuleTile = {
  id: MarketingIconId;
  label: string;
};

/** One stage of the student lifecycle in the home modules section. `href` points at its Platform page section. */
export type HomeModuleLane = {
  title: string;
  owner: string;
  href: string;
  featureCount: number;
  modules: HomeModuleTile[];
  /** What this stage passes to the next one; omitted on the last stage. */
  handoff?: string;
};

/** The modules every stage relies on, shown under the lanes. */
export type HomeModuleFoundation = {
  title: string;
  text: string;
  linkLabel: string;
  href: string;
  modules: (HomeModuleTile & { href: string })[];
};

export type JourneyOfficeId = "portal" | "bursary" | "department" | "lecturer" | "exams" | "senate" | "admissions";

/** An office on the hero journey ring. `angle` is in degrees, clockwise from 3 o'clock. */
export type JourneyOffice = {
  id: JourneyOfficeId;
  name: string;
  role: string;
  icon: MarketingIconId;
  angle: number;
};

/** "arc" runs along the ring to the next office; "via" passes through the student record in the centre. */
export type JourneyRoute = "arc" | "via";

export type JourneyStep = {
  from: JourneyOfficeId;
  to: JourneyOfficeId;
  route: JourneyRoute;
  title: string;
  text: string;
};

export type OfficeJourney = {
  title: string;
  offices: JourneyOffice[];
  steps: JourneyStep[];
};

export type HomeStat = {
  value: string;
  title: string;
  text: string;
  icon: "modules" | "stages" | "uptime";
};

export type StatusTone = "published" | "vetting" | "senate" | "draft";

export type ProductAreaSnippetRow = {
  cells: string[];
  tag?: { label: string; tone: StatusTone };
};

export type ProductArea = {
  label: string;
  title: string;
  text: string;
  checks: string[];
  singleColumnChecks?: boolean;
  snippet?:
    | { kind: "people"; people: { initials: string; name: string; meta: string }[] }
    | { kind: "table"; headers?: string[]; rows: ProductAreaSnippetRow[] }
    | { kind: "chips"; chips: { label: string; colour: string }[] };
};

export type WhyCard = {
  icon: "control" | "ndpa" | "gateways" | "naira";
  title: string;
  text: string;
};

export type VerifyCard = {
  title: string;
  text: string;
  linkLabel: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  institution: string;
  photoUrl?: string;
};

export type TrustedInstitution = {
  name: string;
  crestUrl?: string;
};

export type Guide = {
  category: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  status: "planned" | "published";
  href?: string;
  thumbLabel: string;
  thumbGradient: [string, string];
};
