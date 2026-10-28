import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CountPill, MarketingContainer } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { usePrivacyPage } from "../hooks/usePrivacyPage";
import { PrivacyBlockView } from "./PrivacyBlockView";
import styles from "./PrivacyPage.module.css";

export default function PrivacyPage() {
  const { seo, content, flags } = usePrivacyPage();
  const contentsList = (
    <ol>
      {content.contents.map((entry) => (
        <li key={entry.id}>
          <a href={`#${entry.id}`}>{entry.label}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />
      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>{content.hero.pill}</CountPill>
          <h1>{content.hero.title}</h1>
          <p className={styles.meta}>
            Last updated <time dateTime="2026-10-28">{content.hero.lastUpdated}</time> · {content.hero.scope}
          </p>
        </MarketingContainer>
      </section>

      <MarketingContainer className={styles.layout}>
        <nav className={styles.toc} aria-label="On this page">
          <p className={styles.tocTitle}>On this page</p>
          {contentsList}
        </nav>

        <article className={styles.article}>
          <ConditionalRenderer when={flags.isDraft}>
            <p className={styles.draft} role="note">
              {content.draftNotice}
            </p>
          </ConditionalRenderer>

          <details className={styles.tocMobile}>
            <summary>On this page</summary>
            {contentsList}
          </details>

          <section className={styles.summary} aria-labelledby="privacy-summary">
            <h2 id="privacy-summary">{content.summaryHeading}</h2>
            <ul>
              {content.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          {content.sections.map((section, index) => (
            <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>
                <span className={styles.number}>{index + 1}.</span> {section.title}
              </h2>
              {section.blocks.map((block, blockIndex) => (
                <PrivacyBlockView key={blockIndex} block={block} />
              ))}
            </section>
          ))}

          <aside className={styles.contact} aria-label="Contact about your data">
            <h2>Questions about your data?</h2>
            <p>
              Email <a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a> with “Data protection” in the subject
              line. A person on our team will reply.
            </p>
          </aside>
        </article>
      </MarketingContainer>
    </>
  );
}
