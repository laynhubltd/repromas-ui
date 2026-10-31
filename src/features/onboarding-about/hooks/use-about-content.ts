import { useMemo } from "react";
import { ADVISOR_URL, DEMO_BOOKING_URL } from "@/shared/constants/marketingLinks";
import {
  ABOUT_FINAL_CTA,
  ABOUT_HERO,
  ABOUT_INSTITUTIONS,
  ABOUT_PILLARS,
  ABOUT_SEO,
  aboutParagraphs,
} from "../utils/about-content";

export function useAboutContent() {
  return useMemo(
    () => ({
      seo: ABOUT_SEO,
      hero: ABOUT_HERO,
      title: ABOUT_HERO.title,
      paragraphs: [...aboutParagraphs],
      pillars: ABOUT_PILLARS,
      institutions: ABOUT_INSTITUTIONS,
      finalCta: ABOUT_FINAL_CTA,
      links: {
        demo: DEMO_BOOKING_URL,
        advisor: ADVISOR_URL,
      },
    }),
    [],
  );
}
