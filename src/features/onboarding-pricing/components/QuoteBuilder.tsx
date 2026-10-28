import type { ReactNode } from "react";
import { MarketingModuleIcon } from "@/assets/illustrations/MarketingModuleIcons";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { PillLink } from "@/shared/ui/marketing";
import type { UsePricingPageReturn } from "../hooks/usePricingPage";
import styles from "./PricingPage.module.css";

type QuoteBuilderProps = Pick<UsePricingPageReturn, "content" | "state" | "format" | "flags" | "actions" | "links">;

function OptionCard({
  pressed,
  onSelect,
  children,
  flag,
}: {
  pressed: boolean;
  onSelect: () => void;
  children: ReactNode;
  flag?: string;
}) {
  return (
    <button type="button" className={styles.option} aria-pressed={pressed} onClick={onSelect}>
      <ConditionalRenderer when={Boolean(flag)}>
        <span className={styles.flag}>{flag}</span>
      </ConditionalRenderer>
      {children}
    </button>
  );
}

export function QuoteBuilder({ content, state, format, flags, actions, links }: QuoteBuilderProps) {
  const { selection, step } = state;
  const { book } = content;

  return (
    <div className={styles.builderMain}>
      <ol className={styles.stepper} aria-label="Quote steps">
        {content.steps.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              className={[index === step ? styles.stepOn : "", index < step ? styles.stepDone : ""].join(" ")}
              aria-current={index === step ? "step" : undefined}
              onClick={() => actions.goToStep(index)}
            >
              <span className={styles.stepNumber}>{index + 1}</span>
              <span>
                {item.title}
                <small>{item.hint}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.stepColumn}>
      <div className={styles.mobileStep}>
        <span className={styles.mobileStepLabel}>
          Step {step + 1} of {content.steps.length}
        </span>
        <select
          aria-label="Quote step"
          value={step}
          onChange={(event) => actions.goToStep(Number(event.target.value))}
        >
          {content.steps.map((item, index) => (
            <option key={item.title} value={index}>
              {index + 1}. {item.title}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.stepBody}>
        <ConditionalRenderer when={step === 0}>
          <h2>Select Your Institution Type</h2>
          <p>Your licence is set by institution type, not by student numbers.</p>
          <div className={styles.options}>
            {content.institutions.map((option) => (
              <OptionCard
                key={option.id}
                pressed={selection.institutionType === option.id}
                onSelect={() => actions.chooseInstitution(option.id)}
                flag={option.popular ? "POPULAR" : undefined}
              >
                <MarketingModuleIcon id={option.icon} size={44} />
                <strong>{option.name}</strong>
                <span className={styles.optionSub}>{option.detail}</span>
                <span className={styles.optionPrice}>
                  {format.licencePrice(option.id)}
                  <ConditionalRenderer when={book.licencePerSession[option.id] !== null}>
                    <small>/session</small>
                  </ConditionalRenderer>
                </span>
              </OptionCard>
            ))}
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={step === 1}>
          <h2>Choose How to Pay</h2>
          <p>Both options include every module, hosting, backups, updates and support.</p>
          <div className={styles.options}>
            <OptionCard pressed={selection.paymentModel === "licence"} onSelect={() => actions.choosePaymentModel("licence")}>
              <strong>Institution Licence</strong>
              <span className={styles.optionSub}>A flat fee each academic session, paid from your budget. Raised on an LPO.</span>
              <span className={styles.optionPrice}>
                {format.licencePrice(selection.institutionType)}
                <small>/session</small>
              </span>
            </OptionCard>
            <OptionCard
              pressed={selection.paymentModel === "partnership"}
              onSelect={() => actions.choosePaymentModel("partnership")}
            >
              <strong>Partnership</strong>
              <span className={styles.optionSub}>
                Nothing upfront. Funded by a capped share of student-paid digital services, agreed in an MoU.
              </span>
              <span className={styles.optionPrice}>
                ₦0<small> upfront</small>
              </span>
            </OptionCard>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={step === 2}>
          <h2>Choose Your Onboarding</h2>
          <p>Standard onboarding is included with every plan.</p>
          <div className={styles.options}>
            <OptionCard pressed={selection.onboarding === "standard"} onSelect={() => actions.chooseOnboarding("standard")}>
              <strong>Standard</strong>
              <span className={styles.optionSub}>Remote set-up, data import and two training workshops.</span>
              <span className={styles.optionPrice}>Included</span>
            </OptionCard>
            <OptionCard pressed={selection.onboarding === "onsite"} onSelect={() => actions.chooseOnboarding("onsite")}>
              <strong>On-site</strong>
              <span className={styles.optionSub}>An onboarding engineer at your campus for one week.</span>
              <span className={styles.optionPrice}>
                {format.naira(book.onsiteOnboarding)}
                <small> one-time</small>
              </span>
            </OptionCard>
          </div>
          <div className={styles.addon}>
            <span>
              <strong>Extra on-site training days</strong>
              <span>{format.naira(book.trainingDay)} per day, for departments that need more time.</span>
            </span>
            <span className={styles.qty}>
              <button type="button" aria-label="Fewer training days" onClick={() => actions.changeTrainingDays(-1)}>
                −
              </button>
              <output aria-live="polite">{selection.extraTrainingDays}</output>
              <button type="button" aria-label="More training days" onClick={() => actions.changeTrainingDays(1)}>
                +
              </button>
            </span>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={step === 3}>
          <h2>Add Optional Extras</h2>
          <p>Most institutions don't need these to start.</p>
          <div className={styles.addon}>
            <span>
              <strong>Dedicated onshore hosting</strong>
              <span>Your own environment hosted in Nigeria. {format.naira(book.onshoreHostingPerSession)} per session.</span>
            </span>
            <button
              type="button"
              className={styles.toggle}
              aria-pressed={selection.onshoreHosting}
              aria-label="Dedicated onshore hosting"
              onClick={actions.toggleHosting}
            />
          </div>
          <div className={styles.addon}>
            <span>
              <strong>Historical transcript digitisation</strong>
              <span>Quoted by record count. Included in the Partnership model.</span>
            </span>
            <button
              type="button"
              className={styles.toggle}
              aria-pressed={selection.transcriptDigitisation}
              aria-label="Historical transcript digitisation"
              onClick={actions.toggleDigitisation}
            />
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={step === 4}>
          <h2>Review Your Selection</h2>
          <p>We'll turn this into a formal quotation and pilot plan.</p>
          <div className={styles.addon}>
            <span>
              <strong>{content.institutions.find((option) => option.id === selection.institutionType)?.name}</strong>
              <span>
                {selection.paymentModel === "licence" ? "Institution licence" : "Partnership"} ·{" "}
                {selection.term === 3 ? "3-session commitment" : "1 session"}
              </span>
            </span>
            <PillLink to={links.quotation} variant="cta">
              Request a Quotation
            </PillLink>
          </div>
          <div className={styles.addon}>
            <span>
              <strong>Start with the free pilot</strong>
              <span>One faculty, real data, a full mock results cycle in 30 days.</span>
            </span>
            <PillLink to={links.demo} variant="outline">
              Book a Demo
            </PillLink>
          </div>
        </ConditionalRenderer>
      </div>

      <div className={styles.stepNav}>
        <button
          type="button"
          className={styles.navBack}
          onClick={actions.previousStep}
          disabled={flags.isFirstStep}
        >
          Back
        </button>
        <button type="button" className={styles.navNext} onClick={actions.nextStep} disabled={flags.isLastStep}>
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
