import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ADVISOR_URL, DEMO_BOOKING_URL } from "@/shared/constants/marketingLinks";
import { PLATFORM_CATEGORIES, PLATFORM_FINAL_CTA, PLATFORM_HERO, PLATFORM_SEO } from "../utils/platform-content";

/** Height of the sticky marketing header, so a deep-linked section isn't hidden under it. */
const HEADER_OFFSET = 100;

export function usePlatformPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }, [hash]);

  return {
    seo: PLATFORM_SEO,
    links: { demo: DEMO_BOOKING_URL, advisor: ADVISOR_URL },
    content: {
      hero: PLATFORM_HERO,
      categories: PLATFORM_CATEGORIES,
      finalCta: PLATFORM_FINAL_CTA,
    },
  };
}
