import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MarketingContainer } from "@/shared/ui/marketing";
import type { TrustedInstitution } from "../../types";
import styles from "../HomePage.module.css";

type TrustedSectionProps = {
  institutions: TrustedInstitution[];
};

function Tiles({ institutions }: TrustedSectionProps) {
  return (
    <>
      {institutions.map((institution) => (
        <div key={institution.name} className={styles.logoTile}>
          <span>
            <ConditionalRenderer when={Boolean(institution.crestUrl)}>
              <img src={institution.crestUrl} alt="" loading="lazy" />
            </ConditionalRenderer>
            {institution.name}
          </span>
        </div>
      ))}
    </>
  );
}

export function TrustedSection({ institutions }: TrustedSectionProps) {
  return (
    <section className={styles.trusted} aria-label="Institutions using REPROMAS">
      <MarketingContainer>
        <h2>Trusted by Institutions Across Nigeria</h2>
        <div className={styles.logos}>
          <div className={styles.logoTrack}>
            <Tiles institutions={institutions} />
          </div>
          <div className={styles.logoTrack} aria-hidden="true">
            <Tiles institutions={institutions} />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
