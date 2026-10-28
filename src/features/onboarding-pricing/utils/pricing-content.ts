import type { FaqItem, InstitutionOption, QuoteStep } from "../types";

export const PRICING_HERO = {
  pill: "TRANSPARENT PRICING",
  title: "REPROMAS Pricing: Build Your Quote",
  text: "Every plan includes all 31 modules and unlimited student and staff accounts. Choose your institution type, how you'd like to pay, and the onboarding you need.",
};

export const PRICING_INTRO = {
  pill: "Priced in naira",
  title: "Flexible Pricing for Every Institution",
  text: "REPROMAS is priced per institution, not per student. Pay a flat licence each academic session, or start with nothing upfront under a partnership. Every option includes hosting, daily backups, updates and support, and all modules share one database.",
  chips: ["All 31 modules included", "Unlimited accounts", "No per-student fees", "3-session discount"],
};

export const QUOTE_STEPS: QuoteStep[] = [
  { title: "Institution", hint: "Type" },
  { title: "Payment", hint: "Licence or partnership" },
  { title: "Onboarding", hint: "Set-up and training" },
  { title: "Add-ons", hint: "Optional extras" },
  { title: "Review", hint: "Your quote" },
];

export const INSTITUTION_OPTIONS: InstitutionOption[] = [
  { id: "polytechnic", name: "Polytechnic", detail: "ND and HND · NBTE", icon: "senate-transitions", popular: true },
  { id: "college-of-education", name: "College of Education", detail: "NCE · NCCE", icon: "course-registration" },
  { id: "university", name: "University", detail: "Degree · NUC CCMAS", icon: "degree-classification" },
  { id: "group", name: "Multi-campus / State", detail: "Several institutions", icon: "academic-standing" },
];

export const PRICING_VALUE_CARDS = [
  {
    title: "Every Module Included",
    text: "All 31 modules in every plan. Switch on what each office needs and turn on more later.",
  },
  { title: "Priced in Naira", text: "Your quotation is in naira and doesn't move with the dollar rate." },
  {
    title: "No Hidden Fees",
    text: "Every price is published here. Gateway charges are set by Remita and Flutterwave and shown separately.",
  },
  {
    title: "Grows With Enrolment",
    text: "No per-student fees and unlimited accounts, so a bigger intake doesn't mean a bigger bill.",
  },
] as const;

export const PRICING_FAQ: FaqItem[] = [
  {
    question: "Is the licence priced per student?",
    answer: "No. It's a flat fee each academic session for the whole institution, with unlimited student and staff accounts.",
  },
  {
    question: "How does the partnership model work?",
    answer:
      "There's no upfront licence or hosting fee. REPROMAS is funded by a capped percentage, agreed in writing, of student-paid digital services such as transcripts, application forms and verification requests, deducted at the payment gateway. Student fees never change without your institution's written approval.",
  },
  {
    question: "Is the pilot really free?",
    answer: "Yes. The 90-day pilot on one faculty costs nothing and needs no procurement. You decide afterwards whether to continue.",
  },
  {
    question: "Are payment gateway charges included?",
    answer: "No. Remita and Flutterwave set their own charges, and those are separate from REPROMAS pricing.",
  },
  {
    question: "Do you work with LPOs and public procurement?",
    answer:
      "Yes. We send a formal quotation, a proposal letter and a procurement pack with our capability statement, security overview and CAC registration.",
  },
  {
    question: "Why are prices in naira?",
    answer: "Because your budget is in naira. Our prices don't change when the exchange rate moves.",
  },
  {
    question: "What happens to our data if we leave?",
    answer: "It belongs to your institution. You can export everything in open formats at any time.",
  },
];

export const PRICING_FINAL_CTA = {
  title: "Ready to Get a Quotation for Your Institution?",
  text: "Tell us your institution type and student population, and we'll send a quotation with a pilot plan.",
};

export const PRICING_SEO = {
  title: "Pricing: Build Your Quote",
  description:
    "Transparent naira pricing for REPROMAS. Every plan includes all 31 modules and unlimited accounts: choose a sessional licence or a zero-upfront partnership.",
};
