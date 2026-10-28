import type { ReactElement } from "react";
import { HighlightMark, MarketingContainer, PillLink } from "@/shared/ui/marketing";
import type { OfficeJourney as OfficeJourneyContent } from "../../types";
import type { HOME_HERO } from "../../utils/home-content";
import styles from "../HomePage.module.css";
import { OfficeJourney } from "./OfficeJourney";

type HeroSectionProps = {
  hero: typeof HOME_HERO;
  journey: OfficeJourneyContent;
  advisorUrl: string;
};

const BADGE_ICONS: Record<(typeof HOME_HERO)["badges"][number]["tone"], ReactElement> = {
  green: (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#DCFCE7" />
      <path d="M7.5 13.5l3.5 3.5 7.5-8" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  violet: (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#EDE9FE" />
      <path d="M13 6l6 2.5V13c0 3.5-2.6 6-6 7-3.4-1-6-3.5-6-7V8.5z" fill="#6D28D9" />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#FEF3C7" />
      <rect x="6.5" y="9" width="13" height="9" rx="2" fill="#F4B740" />
      <rect x="6.5" y="11" width="13" height="2" fill="#B9780C" />
    </svg>
  ),
};

export function HeroSection({ hero, journey, advisorUrl }: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <MarketingContainer className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <h1>
            {hero.titleLead} <HighlightMark>{hero.titleMark}</HighlightMark>
          </h1>
          <p className={styles.lead}>{hero.lead}</p>
          <div className={styles.ctas}>
            <PillLink to="#areas" variant="cta" size="large">
              See How It Works
            </PillLink>
            <PillLink to={advisorUrl} variant="outline" size="large">
              Talk to an Advisor
            </PillLink>
          </div>
          <p className={styles.fine}>{hero.fine}</p>
          <div className={styles.badges}>
            {hero.badges.map((badge) => (
              <span key={badge.strong} className={styles.badge}>
                {BADGE_ICONS[badge.tone]}
                <strong>{badge.strong}</strong> {badge.text}
              </span>
            ))}
          </div>
        </div>

        <OfficeJourney journey={journey} />
      </MarketingContainer>
    </section>
  );
}
