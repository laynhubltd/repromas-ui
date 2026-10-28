import { useMemo, useState } from "react";
import { ADVISOR_URL, DEMO_BOOKING_URL, QUOTATION_URL } from "@/shared/constants/marketingLinks";
import type { CommitmentTerm, InstitutionTypeId, OnboardingPlan, PaymentModel, QuoteSelection } from "../types";
import { PRICE_BOOK } from "../utils/price-book";
import {
  INSTITUTION_OPTIONS,
  PRICING_FAQ,
  PRICING_FINAL_CTA,
  PRICING_HERO,
  PRICING_INTRO,
  PRICING_SEO,
  PRICING_VALUE_CARDS,
  QUOTE_STEPS,
} from "../utils/pricing-content";
import { computeQuote, formatNaira } from "../utils/quote-calculator";

const INITIAL_SELECTION: QuoteSelection = {
  institutionType: "polytechnic",
  paymentModel: "licence",
  onboarding: "standard",
  extraTrainingDays: 0,
  onshoreHosting: false,
  transcriptDigitisation: false,
  term: 1,
};

export function usePricingPage() {
  const [selection, setSelection] = useState<QuoteSelection>(INITIAL_SELECTION);
  const [step, setStep] = useState(0);

  const quote = useMemo(() => computeQuote(selection, PRICE_BOOK), [selection]);
  const lastStep = QUOTE_STEPS.length - 1;

  function update(patch: Partial<QuoteSelection>) {
    setSelection((current) => ({ ...current, ...patch }));
  }

  function priceLabel(type: InstitutionTypeId) {
    const licence = PRICE_BOOK.licencePerSession[type];
    return licence === null ? "Quoted" : formatNaira(licence);
  }

  return {
    seo: PRICING_SEO,
    links: { demo: DEMO_BOOKING_URL, advisor: ADVISOR_URL, quotation: QUOTATION_URL },
    content: {
      hero: PRICING_HERO,
      intro: PRICING_INTRO,
      steps: QUOTE_STEPS,
      institutions: INSTITUTION_OPTIONS,
      valueCards: PRICING_VALUE_CARDS,
      faq: PRICING_FAQ,
      finalCta: PRICING_FINAL_CTA,
      book: PRICE_BOOK,
    },
    state: { selection, step, quote },
    format: { naira: formatNaira, licencePrice: priceLabel },
    flags: {
      isDraftPricing: PRICE_BOOK.status === "draft",
      isFirstStep: step === 0,
      isLastStep: step === lastStep,
    },
    actions: {
      goToStep: (index: number) => setStep(Math.max(0, Math.min(lastStep, index))),
      nextStep: () => setStep((current) => Math.min(lastStep, current + 1)),
      previousStep: () => setStep((current) => Math.max(0, current - 1)),
      chooseInstitution: (institutionType: InstitutionTypeId) => update({ institutionType }),
      choosePaymentModel: (paymentModel: PaymentModel) => update({ paymentModel }),
      chooseOnboarding: (onboarding: OnboardingPlan) => update({ onboarding }),
      changeTrainingDays: (delta: number) =>
        setSelection((current) => ({
          ...current,
          extraTrainingDays: Math.max(0, Math.min(PRICE_BOOK.maxTrainingDays, current.extraTrainingDays + delta)),
        })),
      toggleHosting: () => setSelection((current) => ({ ...current, onshoreHosting: !current.onshoreHosting })),
      toggleDigitisation: () =>
        setSelection((current) => ({ ...current, transcriptDigitisation: !current.transcriptDigitisation })),
      chooseTerm: (term: CommitmentTerm) => update({ term }),
    },
  };
}

export type UsePricingPageReturn = ReturnType<typeof usePricingPage>;
