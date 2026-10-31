import { CountPill, HighlightMark, MarketingContainer, MarketingFinalCta } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { useAboutContent } from "../hooks/use-about-content";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  const { seo, hero, paragraphs, pillars, institutions, finalCta, links } = useAboutContent();

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />
      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>{hero.pill}</CountPill>
          <h1>{hero.title}</h1>
          <p>{hero.text}</p>
        </MarketingContainer>
      </section>

      <section className={styles.storySection}>
        <MarketingContainer className={styles.storyGrid}>
          <div className={styles.storyCopy}>
            <h2>
              Why We Built <HighlightMark>REPROMAS</HighlightMark>
            </h2>
            <div className={styles.storyParagraphs}>
              {paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>

          <div className={styles.pillars}>
            {pillars.map((pillar) => (
              <article key={pillar.badge} className={styles.pillarCard}>
                <span className={styles.pillarBadge} aria-hidden="true">
                  {pillar.badge}
                </span>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </div>
              </article>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <section id="institutions" className={styles.institutionsSection}>
        <MarketingContainer>
          <div className={styles.institutionsHead}>
            <h2>
              Designed for Every Tier of <HighlightMark>Tertiary Education</HighlightMark>
            </h2>
            <p>
              Pre-configured around the regulatory structures, grading scales and academic boards of Nigerian
              institutions.
            </p>
          </div>
          <div className={styles.institutionsGrid}>
            {institutions.map((item) => (
              <article key={item.type} className={styles.institutionCard}>
                <span className={styles.regulator}>{item.regulator}</span>
                <h3>{item.type}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <MarketingFinalCta
        title={finalCta.title}
        text={finalCta.text}
        actions={[
          { label: "Try for Free", to: links.demo, variant: "cta" },
          { label: "Talk to an Advisor", to: links.advisor, variant: "outline" },
        ]}
        fineprint={finalCta.fineprint}
      />
    </>
  );
}
