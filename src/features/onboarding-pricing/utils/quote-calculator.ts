import type { InstitutionTypeId, PriceBook, QuoteLine, QuoteResult, QuoteSelection } from "../types";

const NAIRA = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

export function formatNaira(amount: number): string {
  return `₦${NAIRA.format(Math.round(amount))}`;
}

export const INSTITUTION_LABELS: Record<InstitutionTypeId, string> = {
  polytechnic: "Polytechnic",
  "college-of-education": "College of Education",
  university: "University",
  group: "Multi-campus / State",
};

/** Turns a quote-builder selection into summary lines and totals. Pure, so it is unit-tested directly. */
export function computeQuote(selection: QuoteSelection, book: PriceBook): QuoteResult {
  const lines: QuoteLine[] = [];
  let perSession = 0;
  let quoted = false;
  const typeLabel = INSTITUTION_LABELS[selection.institutionType];

  if (selection.paymentModel === "licence") {
    const licence = book.licencePerSession[selection.institutionType];
    if (licence === null) {
      quoted = true;
      lines.push({ label: `${typeLabel} licence`, value: "Quoted" });
    } else {
      perSession += licence;
      lines.push({ label: `${typeLabel} licence`, value: formatNaira(licence) });
    }
  } else {
    lines.push({ label: "Partnership licence", value: "₦0 upfront" });
    lines.push({ label: "Funding", value: "Capped share, per MoU" });
  }

  if (selection.onshoreHosting) {
    perSession += book.onshoreHostingPerSession;
    lines.push({ label: "Onshore hosting", value: formatNaira(book.onshoreHostingPerSession) });
  }

  if (selection.transcriptDigitisation) {
    lines.push({
      label: "Transcript digitisation",
      value: selection.paymentModel === "partnership" ? "Included" : "Quoted",
    });
  }

  lines.push({ label: "Modules", value: "All 31" });
  lines.push({ label: "Accounts", value: "Unlimited" });

  const days = Math.max(0, Math.min(book.maxTrainingDays, selection.extraTrainingDays));
  const oneTime = (selection.onboarding === "onsite" ? book.onsiteOnboarding : 0) + days * book.trainingDay;

  const isLicence = selection.paymentModel === "licence";
  let total: number | null = perSession;
  let totalLabel = "Per session";
  if (selection.term === 3) {
    total = isLicence ? perSession * book.threeSessionChargedSessions : perSession * 3;
    totalLabel = "3-session total";
  }
  if (quoted) total = null;

  return { lines, total, totalLabel, oneTime, showCommitmentOffer: isLicence };
}
