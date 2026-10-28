import { Fragment } from "react";
import { Link } from "react-router-dom";
import { MarketingModuleIcon } from "@/assets/illustrations/MarketingModuleIcons";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { HighlightMark, MarketingContainer, MarketingSection, PillLink, SectionHeading } from "@/shared/ui/marketing";
import type { HomeModuleFoundation, HomeModuleLane, HomeModuleTile } from "../../types";
import type { HOME_MODULES_HEADING } from "../../utils/home-content";
import styles from "../HomePage.module.css";

type ModulesSectionProps = {
  heading: typeof HOME_MODULES_HEADING;
  lanes: HomeModuleLane[];
  foundation: HomeModuleFoundation;
  allModulesUrl: string;
};

function ModuleTile({ module, href }: { module: HomeModuleTile; href: string }) {
  return (
    <Link to={href} className={styles.mod} data-testid="module-tile">
      <MarketingModuleIcon id={module.id} />
      <span>{module.label}</span>
    </Link>
  );
}

function HandoffChevron() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ModulesSection({ heading, lanes, foundation, allModulesUrl }: ModulesSectionProps) {
  return (
    <MarketingSection id="modules" className={styles.modulesSection}>
      <MarketingContainer>
        <SectionHeading
          title={
            <>
              {heading.titleLead} <HighlightMark>{heading.titleMark}</HighlightMark> {heading.titleTail}
            </>
          }
          description={heading.text}
        />
        <div className={styles.flow}>
          {lanes.map((lane, index) => (
            <Fragment key={lane.title}>
              <div
                className={[styles.lane, index === lanes.length - 1 ? styles.laneLast : ""].join(" ")}
                role="group"
                aria-labelledby={`modules-lane-${index}`}
                data-testid="module-lane"
              >
                <div className={styles.laneHead}>
                  <span className={styles.step} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 id={`modules-lane-${index}`}>{lane.title}</h3>
                  <span className={styles.laneOwner}>{lane.owner}</span>
                  <Link to={lane.href} className={styles.laneLink}>
                    See all {lane.featureCount} features →
                  </Link>
                </div>
                <div className={styles.laneMods}>
                  {lane.modules.map((module) => (
                    <ModuleTile key={module.id} module={module} href={lane.href} />
                  ))}
                </div>
              </div>
              <ConditionalRenderer when={Boolean(lane.handoff)}>
                <div className={styles.handoff}>
                  <span className={styles.handoffDot}>
                    <HandoffChevron />
                  </span>
                  <p>
                    <b>{heading.handoffLabel}</b>
                    <span>{lane.handoff}</span>
                  </p>
                </div>
              </ConditionalRenderer>
            </Fragment>
          ))}
          <div className={styles.foundation} role="group" aria-labelledby="modules-lane-foundation">
            <div className={styles.foundationHead}>
              <h3 id="modules-lane-foundation">{foundation.title}</h3>
              <p>{foundation.text}</p>
              <Link to={foundation.href} className={styles.laneLink}>
                {foundation.linkLabel} →
              </Link>
            </div>
            <div className={styles.laneMods}>
              {foundation.modules.map((module) => (
                <ModuleTile key={module.id} module={module} href={module.href} />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.flowFoot}>
          <p>{heading.footNote}</p>
          <PillLink to={allModulesUrl} variant="outline">
            {heading.allLabel}
          </PillLink>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
