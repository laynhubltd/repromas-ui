import { useMemo } from "react";
import { ADVISOR_URL, DEMO_BOOKING_URL } from "@/shared/constants/marketingLinks";
import {
  GUIDES,
  HOME_AREAS_HEADING,
  HOME_FINAL_CTA,
  HOME_HERO,
  HOME_JOURNEY,
  HOME_MODULE_FOUNDATION,
  HOME_MODULE_LANES,
  HOME_MODULES_HEADING,
  HOME_PRODUCT_AREAS,
  HOME_SEO,
  HOME_STATS,
  HOME_VERIFY_CARDS,
  HOME_VERIFY_HEADING,
  HOME_WHY,
  HOME_WHY_CARDS,
  TESTIMONIALS,
  TRUSTED_INSTITUTIONS,
} from "../utils/home-content";

export function useHomePage() {
  const publishedGuides = useMemo(() => GUIDES.filter((guide) => guide.status === "published"), []);

  return {
    seo: HOME_SEO,
    links: { demo: DEMO_BOOKING_URL, advisor: ADVISOR_URL, platform: "/platform" },
    content: {
      hero: HOME_HERO,
      journey: HOME_JOURNEY,
      trusted: TRUSTED_INSTITUTIONS,
      modulesHeading: HOME_MODULES_HEADING,
      moduleLanes: HOME_MODULE_LANES,
      moduleFoundation: HOME_MODULE_FOUNDATION,
      stats: HOME_STATS,
      areasHeading: HOME_AREAS_HEADING,
      areas: HOME_PRODUCT_AREAS,
      why: HOME_WHY,
      whyCards: HOME_WHY_CARDS,
      verifyHeading: HOME_VERIFY_HEADING,
      verifyCards: HOME_VERIFY_CARDS,
      testimonials: TESTIMONIALS,
      guides: publishedGuides,
      finalCta: HOME_FINAL_CTA,
    },
    flags: {
      showTrusted: TRUSTED_INSTITUTIONS.length > 0,
      showTestimonials: TESTIMONIALS.length > 0,
      showGuides: publishedGuides.length > 0,
    },
  };
}
