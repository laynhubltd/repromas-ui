import { MarketingModuleIcon } from "@/assets/illustrations/MarketingModuleIcons";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CountPill, MarketingContainer, MarketingFinalCta, PillLink } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { usePlatformPage } from "../hooks/usePlatformPage";
import styles from "./PlatformPage.module.css";

export default function PlatformPage() {
  const { seo, links, content } = usePlatformPage();

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />
      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>{content.hero.pill}</CountPill>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.text}</p>
          <div className={styles.ctas}>
            <PillLink to={links.demo} variant="solid" size="large">
              Try for Free
            </PillLink>
            <PillLink to={links.advisor} variant="outline" size="large">
              Talk to an Advisor
            </PillLink>
          </div>
        </MarketingContainer>
      </section>

      {content.categories.map((category) => (
        <section key={category.id} id={category.id} className={styles.category} aria-labelledby={`${category.id}-title`}>
          <MarketingContainer>
            <div className={styles.categoryHead}>
              <h2 id={`${category.id}-title`}>{category.title}</h2>
              <span className={styles.count}>
                {category.features.length} {category.features.length === 1 ? "feature" : "features"}
              </span>
            </div>
            <p className={styles.categoryText}>{category.text}</p>
            <div className={styles.grid}>
              {category.features.map((feature) => (
                <article key={feature.title} className={styles.card} data-testid="platform-feature">
                  <MarketingModuleIcon id={feature.icon} size={40} />
                  <h3>
                    {feature.title}
                    <ConditionalRenderer when={Boolean(feature.rollingOut)}>
                      <span className={styles.soon}>{feature.rollingOut}</span>
                    </ConditionalRenderer>
                  </h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </MarketingContainer>
        </section>
      ))}

      <div className={styles.spacer} />
      <MarketingFinalCta
        title={content.finalCta.title}
        text={content.finalCta.text}
        actions={[
          { label: "Try for Free", to: links.demo, variant: "solid" },
          { label: "Talk to an Advisor", to: links.advisor, variant: "outline" },
        ]}
        fineprint="Test a full results cycle on your own curriculum first, then roll out across your institution at your own pace."
      />
    </>
  );
}
