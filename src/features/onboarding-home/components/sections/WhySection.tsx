import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { HighlightMark, MarketingContainer, MarketingSection, PillLink } from "@/shared/ui/marketing";
import type { WhyCard } from "../../types";
import type { HOME_WHY } from "../../utils/home-content";
import styles from "../HomePage.module.css";

const INSTITUTION_TIERS = [
  { label: "Universities · NUC CCMAS", to: "/about#institutions" },
  { label: "Polytechnics · NBTE ND & HND", to: "/about#institutions" },
  { label: "Colleges · NCCE NCE", to: "/about#institutions" },
] as const;

type WhySectionProps = {
  why: typeof HOME_WHY;
  cards: WhyCard[];
  demoUrl: string;
};

const WHY_ICONS: Record<WhyCard["icon"], ReactElement> = {
  control: (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <rect x="6" y="10" width="32" height="26" rx="6" fill="#C4B5FD" />
      <rect x="12" y="4" width="20" height="14" rx="5" fill="none" stroke="#4C1D95" strokeWidth="3" />
      <circle cx="22" cy="24" r="4" fill="#2E1065" />
    </svg>
  ),
  ndpa: (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M22 4l15 6v10c0 9-6.5 15.5-15 19C13.5 35.5 7 29 7 20V10z" fill="#6D28D9" />
      <path d="M15 21l5 5 9-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  gateways: (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <rect x="4" y="12" width="36" height="22" rx="5" fill="#8B5CF6" />
      <rect x="4" y="17" width="36" height="4" fill="#2E1065" />
      <rect x="9" y="26" width="12" height="3" rx="1.5" fill="#EDE9FE" />
    </svg>
  ),
  naira: (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="17" fill="#EDE9FE" />
      <text x="22" y="29" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="20" fill="#2E1065">
        ₦
      </text>
    </svg>
  ),
};

export function WhySection({ why, cards, demoUrl }: WhySectionProps) {
  return (
    <MarketingSection id="why" className={styles.whySection}>
      <MarketingContainer className={styles.why}>
        <div className={styles.whyCopy}>
          <h2>
            {why.titleLead} <HighlightMark>{why.titleMark}</HighlightMark>
          </h2>
          <p>{why.text}</p>
          <div className={styles.whyTiers}>
            {INSTITUTION_TIERS.map((tier) => (
              <Link key={tier.label} to={tier.to} className={styles.whyTierPill}>
                {tier.label}
              </Link>
            ))}
          </div>
          <PillLink to={demoUrl} variant="cta">
            Try for Free
          </PillLink>
        </div>
        <div className={styles.cards2}>
          {cards.map((card) => (
            <div key={card.title} className={styles.card}>
              {WHY_ICONS[card.icon]}
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
