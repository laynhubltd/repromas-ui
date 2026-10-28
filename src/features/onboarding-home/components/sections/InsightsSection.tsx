import { MarketingContainer, MarketingSection } from "@/shared/ui/marketing";
import type { Guide } from "../../types";
import styles from "../HomePage.module.css";

type InsightsSectionProps = {
  guides: Guide[];
};

export function InsightsSection({ guides }: InsightsSectionProps) {
  return (
    <MarketingSection id="insights">
      <MarketingContainer>
        <div className={styles.insHead}>
          <h2>Guides for Registries</h2>
        </div>
        <div className={styles.posts}>
          {guides.map((guide) => (
            <a key={guide.title} className={styles.post} href={guide.href}>
              <svg className={styles.postThumb} viewBox="0 0 320 160" role="img" aria-label={guide.thumbLabel}>
                <defs>
                  <linearGradient id={`thumb-${guide.readMinutes}-${guide.category}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={guide.thumbGradient[0]} />
                    <stop offset="1" stopColor={guide.thumbGradient[1]} />
                  </linearGradient>
                </defs>
                <rect width="320" height="160" fill={`url(#thumb-${guide.readMinutes}-${guide.category})`} />
                <text x="160" y="90" textAnchor="middle" fill="#fff" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="24">
                  {guide.thumbLabel}
                </text>
              </svg>
              <div className={styles.postBody}>
                <div className={styles.postMeta}>
                  <span className={styles.postCat}>{guide.category}</span>
                  <span>·</span>
                  <span>{guide.readMinutes} min read</span>
                </div>
                <h3>{guide.title}</h3>
                <p>{guide.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
