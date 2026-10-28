import { Link } from "react-router-dom";
import { MarketingContainer, MarketingSection, SectionHeading } from "@/shared/ui/marketing";
import type { VerifyCard } from "../../types";
import type { HOME_VERIFY_HEADING } from "../../utils/home-content";
import styles from "../HomePage.module.css";

type VerifySectionProps = {
  heading: typeof HOME_VERIFY_HEADING;
  cards: VerifyCard[];
  contactUrl: string;
};

export function VerifySection({ heading, cards, contactUrl }: VerifySectionProps) {
  return (
    <MarketingSection id="verify" className={styles.verifySection}>
      <MarketingContainer>
        <SectionHeading title={heading.title} description={heading.text} size="small" />
        <div className={styles.verify}>
          {cards.map((card) => (
            <div key={card.title} className={styles.vcard}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <Link to={contactUrl}>{card.linkLabel}</Link>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
