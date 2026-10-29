import type { ReactElement } from "react";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CountPill,
  MarketingContainer,
  MarketingFinalCta,
  MarketingSection,
  SectionHeading,
} from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { usePricingPage } from "../hooks/usePricingPage";
import { INSTITUTION_LABELS } from "../utils/quote-calculator";
import styles from "./PricingPage.module.css";
import { QuoteBuilder } from "./QuoteBuilder";
import { QuoteSummary } from "./QuoteSummary";

const VALUE_ICONS: ReactElement[] = [
  <svg key="modules" viewBox="0 0 44 44" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="#2E1065" />
    <rect x="24" y="4" width="16" height="16" rx="4" fill="#6D28D9" />
    <rect x="4" y="24" width="16" height="16" rx="4" fill="#8B5CF6" />
    <rect x="24" y="24" width="16" height="16" rx="4" fill="#C4B5FD" />
  </svg>,
  <svg key="naira" viewBox="0 0 44 44" aria-hidden="true">
    <circle cx="22" cy="22" r="17" fill="#EDE9FE" />
    <text x="22" y="29" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="20" fill="#2E1065">
      ₦
    </text>
  </svg>,
  <svg key="fees" viewBox="0 0 44 44" aria-hidden="true">
    <rect x="8" y="5" width="28" height="34" rx="5" fill="#C4B5FD" />
    <path d="M15 22l5 5 9-10" fill="none" stroke="#4C1D95" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="growth" viewBox="0 0 44 44" aria-hidden="true">
    <path d="M6 34l10-10 7 7 15-17" fill="none" stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 14h8v8" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function PricingPage() {
  const pricing = usePricingPage();
  const { seo, content, format, flags, links } = pricing;
  const { book } = content;

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />

      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>{content.hero.pill}</CountPill>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.text}</p>
        </MarketingContainer>
      </section>

      <section className={styles.intro}>
        <MarketingContainer className={styles.introInner}>
          <CountPill>{content.intro.pill}</CountPill>
          <h2>{content.intro.title}</h2>
          <p>{content.intro.text}</p>
          <div className={styles.chips}>
            {content.intro.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <section className={styles.builderSection} id="quote">
        <MarketingContainer className={styles.builder}>
          <QuoteBuilder
            content={pricing.content}
            state={pricing.state}
            format={pricing.format}
            flags={pricing.flags}
            actions={pricing.actions}
            links={pricing.links}
          />
          <QuoteSummary
            state={pricing.state}
            format={pricing.format}
            flags={pricing.flags}
            actions={pricing.actions}
            links={pricing.links}
          />
        </MarketingContainer>
      </section>

      <MarketingSection tone="grey" id="price-list">
        <MarketingContainer>
          <SectionHeading
            title="Full Price List (NGN)"
            description="Every price, published, from the same price list as the quote builder. Gateway charges from Remita and Flutterwave are separate."
          />
          <div className={styles.priceList}>
            <details open>
              <summary>
                Institution licence <span>Required, per academic session</span>
              </summary>
              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>Institution type</th>
                      <th>1 session</th>
                      <th>3 sessions*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.institutions.map((option) => {
                      const licence = book.licencePerSession[option.id];
                      return (
                        <tr key={option.id}>
                          <td>{INSTITUTION_LABELS[option.id]}</td>
                          <td>{licence === null ? "Quoted" : format.naira(licence)}</td>
                          <td>
                            {licence === null ? "Quoted" : format.naira(licence * book.threeSessionChargedSessions)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>
                Partnership model <span>No upfront licence</span>
              </summary>
              <div className={styles.tableScroll}>
                <table>
                  <tbody>
                    <tr>
                      <td>Licence and hosting</td>
                      <td>₦0 upfront</td>
                    </tr>
                    <tr>
                      <td>Funding</td>
                      <td>Capped share of student-paid digital services, agreed in an MoU</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>
                Onboarding &amp; services <span>One-time</span>
              </summary>
              <div className={styles.tableScroll}>
                <table>
                  <tbody>
                    <tr>
                      <td>Standard onboarding: remote set-up, data import, two training workshops</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>On-site onboarding: an engineer at your campus for one week</td>
                      <td>{format.naira(book.onsiteOnboarding)}</td>
                    </tr>
                    <tr>
                      <td>Extra on-site training day</td>
                      <td>{format.naira(book.trainingDay)} / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>
                Add-ons <span>Optional</span>
              </summary>
              <div className={styles.tableScroll}>
                <table>
                  <tbody>
                    <tr>
                      <td>Dedicated onshore hosting</td>
                      <td>{format.naira(book.onshoreHostingPerSession)} / session</td>
                    </tr>
                    <tr>
                      <td>Historical transcript digitisation</td>
                      <td>Quoted by record count</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
          <p className={styles.priceNote}>
            *3 sessions: the third session is 50% off. Prices exclude VAT.
            <ConditionalRenderer when={flags.isDraftPricing}>
              {" "}
              Draft pricing for review; final figures are confirmed in your quotation.
            </ConditionalRenderer>
          </p>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection>
        <MarketingContainer>
          <SectionHeading
            title="Pricing That Fits How Institutions Budget"
            description="One licence for the whole institution. Start with one faculty and grow without renegotiating."
          />
          <div className={styles.valueCards}>
            {content.valueCards.map((card, index) => (
              <div key={card.title} className={styles.valueCard}>
                {VALUE_ICONS[index]}
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingSection tone="grey">
        <MarketingContainer>
          <SectionHeading title="Pricing FAQ" description="What bursars and procurement officers ask us most." />
          <div className={styles.faq}>
            {content.faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </MarketingContainer>
      </MarketingSection>

      <MarketingFinalCta
        title={content.finalCta.title}
        text={content.finalCta.text}
        actions={[
          { label: "Configure My Quote", to: "#quote", variant: "cta" },
          { label: "Talk to an Advisor", to: links.advisor, variant: "outline" },
        ]}
        fineprint="Test a full results cycle on your own curriculum first, then roll out across your institution at your own pace."
      />
    </>
  );
}
