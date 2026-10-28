import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { PillLink } from "@/shared/ui/marketing";
import type { UsePricingPageReturn } from "../hooks/usePricingPage";
import styles from "./PricingPage.module.css";

type QuoteSummaryProps = Pick<UsePricingPageReturn, "state" | "format" | "flags" | "actions" | "links">;

export function QuoteSummary({ state, format, flags, actions, links }: QuoteSummaryProps) {
  const { quote, selection } = state;

  return (
    <aside className={styles.summary} aria-label="Your quote">
      <div className={styles.summaryHead}>
        <div className={styles.summaryRow}>
          <strong>YOUR QUOTE</strong>
          <span>NGN ₦</span>
        </div>
        <div className={styles.segment} role="group" aria-label="Commitment">
          <button type="button" aria-pressed={selection.term === 1} onClick={() => actions.chooseTerm(1)}>
            1 session
          </button>
          <button type="button" aria-pressed={selection.term === 3} onClick={() => actions.chooseTerm(3)}>
            3 sessions
          </button>
        </div>
      </div>
      <div className={styles.summaryBody}>
        <div>
          {quote.lines.map((line) => (
            <div key={line.label} className={styles.line}>
              <span>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>
        <ConditionalRenderer when={quote.showCommitmentOffer}>
          <div className={styles.offer}>
            <strong>Commit to 3 sessions</strong>
            <br />
            The third session is 50% off.
          </div>
        </ConditionalRenderer>
        <div className={styles.total}>
          <span>{quote.totalLabel}</span>
          <strong data-testid="quote-total">{quote.total === null ? "Quoted" : format.naira(quote.total)}</strong>
        </div>
        <div className={styles.line}>
          <span>One-time onboarding</span>
          <span data-testid="quote-one-time">{quote.oneTime > 0 ? format.naira(quote.oneTime) : "Included"}</span>
        </div>
        <PillLink to={links.quotation} variant="cta" size="large" fullWidth>
          Request a Quotation
        </PillLink>
        <ConditionalRenderer when={flags.isDraftPricing}>
          <p className={styles.draftNotice}>Draft pricing for review. Final figures are confirmed in your quotation.</p>
        </ConditionalRenderer>
      </div>
    </aside>
  );
}
