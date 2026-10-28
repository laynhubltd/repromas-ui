import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { HighlightMark, MarketingContainer, MarketingSection, SectionHeading } from "@/shared/ui/marketing";
import type { ProductArea, StatusTone } from "../../types";
import type { HOME_AREAS_HEADING } from "../../utils/home-content";
import styles from "../HomePage.module.css";

type ProductAreasSectionProps = {
  heading: typeof HOME_AREAS_HEADING;
  areas: ProductArea[];
};

const TONE_CLASS: Record<StatusTone, string> = {
  published: styles.published,
  vetting: styles.vetting,
  senate: styles.senate,
  draft: styles.draft,
};

function Snippet({ snippet }: { snippet: NonNullable<ProductArea["snippet"]> }) {
  if (snippet.kind === "people") {
    return (
      <div className={styles.people}>
        {snippet.people.map((person) => (
          <div key={person.name} className={styles.person}>
            <span className={styles.personPhoto}>{person.initials}</span>
            <span>
              <strong>{person.name}</strong>
              <span>{person.meta}</span>
            </span>
            <span className={[styles.tag, styles.published].join(" ")}>Admitted</span>
          </div>
        ))}
      </div>
    );
  }

  if (snippet.kind === "chips") {
    return (
      <div className={styles.chips}>
        {snippet.chips.map((chip) => (
          <span key={chip.label} className={styles.chip}>
            <svg className={styles.chipDot} viewBox="0 0 22 22" aria-hidden="true">
              <rect width="22" height="22" rx="6" fill={chip.colour} />
            </svg>
            {chip.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.mock}>
      <table>
        <ConditionalRenderer when={Boolean(snippet.headers)}>
          <thead>
            <tr>
              {snippet.headers?.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
        </ConditionalRenderer>
        <tbody>
          {snippet.rows.map((row) => (
            <tr key={row.cells.join("|")}>
              {row.cells.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
              <ConditionalRenderer when={Boolean(row.tag)}>
                <td>
                  <span className={[styles.tag, row.tag ? TONE_CLASS[row.tag.tone] : ""].join(" ")}>{row.tag?.label}</span>
                </td>
              </ConditionalRenderer>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductAreasSection({ heading, areas }: ProductAreasSectionProps) {
  return (
    <MarketingSection id="areas" tone="grey">
      <MarketingContainer>
        <SectionHeading
          title={
            <>
              {heading.titleLead} <HighlightMark>{heading.titleMark}</HighlightMark>
            </>
          }
          description={heading.text}
        />
        <div className={styles.areas}>
          {areas.map((area) => (
            <article key={area.label} className={styles.area}>
              <span className={styles.areaLabel}>{area.label}</span>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
              <ConditionalRenderer when={area.checks.length > 0}>
                <ul className={[styles.checks, area.singleColumnChecks ? styles.checksOne : ""].join(" ")}>
                  {area.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
              </ConditionalRenderer>
              <ConditionalRenderer when={Boolean(area.snippet)}>
                {area.snippet ? <Snippet snippet={area.snippet} /> : null}
              </ConditionalRenderer>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
