import type { ReactElement } from "react";
import { MarketingContainer } from "@/shared/ui/marketing";
import type { HomeStat } from "../../types";
import styles from "../HomePage.module.css";

type StatsSectionProps = {
  stats: HomeStat[];
};

const STAT_ICONS: Record<HomeStat["icon"], ReactElement> = {
  modules: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="4" width="14" height="14" rx="3" fill="#6D28D9" />
      <rect x="22" y="4" width="14" height="14" rx="3" fill="#C4B5FD" />
      <rect x="4" y="22" width="14" height="14" rx="3" fill="#F4B740" />
      <rect x="22" y="22" width="14" height="14" rx="3" fill="#34D399" />
    </svg>
  ),
  stages: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="8" cy="20" r="5" fill="#C4B5FD" />
      <circle cx="20" cy="20" r="5" fill="#6D28D9" />
      <circle cx="32" cy="20" r="5" fill="#F4B740" />
      <path d="M13 20h2M25 20h2" stroke="#6D28D9" strokeWidth="2" />
    </svg>
  ),
  uptime: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#DCFCE7" />
      <path d="M12 21l5 5 11-12" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className={styles.statsSection} aria-label="REPROMAS in numbers">
      <MarketingContainer className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.title} className={styles.stat}>
            <div className={styles.statTop}>
              <strong>{stat.value}</strong>
              {STAT_ICONS[stat.icon]}
            </div>
            <h3>{stat.title}</h3>
            <p>{stat.text}</p>
          </div>
        ))}
      </MarketingContainer>
    </section>
  );
}
