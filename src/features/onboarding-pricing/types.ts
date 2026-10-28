import type { MarketingIconId } from "@/assets/illustrations/MarketingModuleIcons";

export type InstitutionTypeId = "polytechnic" | "college-of-education" | "university" | "group";
export type PaymentModel = "licence" | "partnership";
export type OnboardingPlan = "standard" | "onsite";
export type CommitmentTerm = 1 | 3;

export type PriceBook = {
  /** Draft figures show a "not approved" notice everywhere a price appears. */
  status: "draft" | "approved";
  /** Licence per academic session in naira; null means quoted individually. */
  licencePerSession: Record<InstitutionTypeId, number | null>;
  onsiteOnboarding: number;
  trainingDay: number;
  onshoreHostingPerSession: number;
  /** Sessions charged for a 3-session licence commitment (2.5 = third session at 50% off). */
  threeSessionChargedSessions: number;
  maxTrainingDays: number;
};

export type QuoteSelection = {
  institutionType: InstitutionTypeId;
  paymentModel: PaymentModel;
  onboarding: OnboardingPlan;
  extraTrainingDays: number;
  onshoreHosting: boolean;
  transcriptDigitisation: boolean;
  term: CommitmentTerm;
};

export type QuoteLine = {
  label: string;
  value: string;
};

export type QuoteResult = {
  lines: QuoteLine[];
  /** Recurring total for the chosen term; null when the licence is quoted individually. */
  total: number | null;
  totalLabel: string;
  oneTime: number;
  showCommitmentOffer: boolean;
};

export type InstitutionOption = {
  id: InstitutionTypeId;
  name: string;
  detail: string;
  icon: MarketingIconId;
  popular?: boolean;
};

export type QuoteStep = {
  title: string;
  hint: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
