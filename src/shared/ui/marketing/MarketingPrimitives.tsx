import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import styles from "./marketing.module.css";

export type PillVariant = "cta" | "outline" | "solid";

export type PillLinkProps = {
  /** Internal path (`/pricing`), in-page anchor (`#areas`) or absolute URL */
  to: string;
  variant: PillVariant;
  size?: "default" | "large";
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANT_CLASS: Record<PillVariant, string> = {
  cta: styles.cta,
  outline: styles.outline,
  solid: styles.solid,
};

/** Rounded marketing button. Internal paths use the router; anchors and absolute URLs render a plain link. */
export function PillLink({ to, variant, size = "default", fullWidth = false, children }: PillLinkProps) {
  const className = [
    styles.btn,
    VARIANT_CLASS[variant],
    size === "large" ? styles.btnLarge : "",
    fullWidth ? styles.btnFull : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isExternal = /^https?:\/\//.test(to);
  const isAnchor = to.startsWith("#");

  if (isExternal) {
    return (
      <a className={className} href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (isAnchor) {
    return (
      <a className={className} href={to}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
}

export type MarketingRootProps = { children: ReactNode; className?: string };

/** Applies the marketing tokens, fonts and base type to everything inside. */
export function MarketingRoot({ children, className }: MarketingRootProps) {
  return <div className={[styles.root, className ?? ""].join(" ")}>{children}</div>;
}

export type MarketingContainerProps = { children: ReactNode; className?: string };

export function MarketingContainer({ children, className }: MarketingContainerProps) {
  return <div className={[styles.container, className ?? ""].join(" ")}>{children}</div>;
}

export type MarketingSectionProps = {
  children: ReactNode;
  id?: string;
  tone?: "white" | "grey";
  className?: string;
};

export function MarketingSection({ children, id, tone = "white", className }: MarketingSectionProps) {
  const classes = [styles.section, tone === "grey" ? styles.grey : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <section id={id} className={classes}>
      {children}
    </section>
  );
}

export type HighlightMarkProps = { children: ReactNode };

/** Hand-drawn style underline behind a phrase in a heading. */
export function HighlightMark({ children }: HighlightMarkProps) {
  return <span className={styles.mark}>{children}</span>;
}

export type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  pill?: string;
  size?: "default" | "small";
};

export function SectionHeading({ title, description, pill, size = "default" }: SectionHeadingProps) {
  return (
    <div className={[styles.sectionHead, size === "small" ? styles.sectionHeadSmall : ""].join(" ")}>
      <ConditionalRenderer when={Boolean(pill)}>
        <span className={styles.pill}>{pill}</span>
      </ConditionalRenderer>
      <h2>{title}</h2>
      <ConditionalRenderer when={Boolean(description)}>
        <p>{description}</p>
      </ConditionalRenderer>
    </div>
  );
}

export type CountPillProps = { children: ReactNode };

export function CountPill({ children }: CountPillProps) {
  return <span className={styles.pill}>{children}</span>;
}

export type MarketingAction = {
  label: string;
  to: string;
  variant: PillVariant;
};

export type MarketingFinalCtaProps = {
  id?: string;
  title: string;
  text: string;
  actions: MarketingAction[];
  fineprint?: string;
};

export function MarketingFinalCta({ id, title, text, actions, fineprint }: MarketingFinalCtaProps) {
  return (
    <section id={id} className={[styles.section, styles.finalCta].join(" ")}>
      <div className={[styles.container, styles.finalInner].join(" ")}>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className={styles.ctaRow}>
          {actions.map((action) => (
            <PillLink key={action.label} to={action.to} variant={action.variant} size="large">
              {action.label}
            </PillLink>
          ))}
        </div>
        <ConditionalRenderer when={Boolean(fineprint)}>
          <p className={styles.fine}>{fineprint}</p>
        </ConditionalRenderer>
      </div>
    </section>
  );
}
