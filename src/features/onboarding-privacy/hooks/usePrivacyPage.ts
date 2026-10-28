import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CONTACT_EMAIL } from "@/shared/constants/marketingLinks";
import {
  PRIVACY_DRAFT_NOTICE,
  PRIVACY_HERO,
  PRIVACY_NOTICE_STATUS,
  PRIVACY_SECTIONS,
  PRIVACY_SEO,
  PRIVACY_SUMMARY,
  PRIVACY_SUMMARY_HEADING,
} from "../utils/privacy-content";

/** Height of the sticky marketing header, so a deep-linked section isn't hidden under it. */
const HEADER_OFFSET = 100;

export function usePrivacyPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }, [hash]);

  return {
    seo: PRIVACY_SEO,
    content: {
      hero: PRIVACY_HERO,
      draftNotice: PRIVACY_DRAFT_NOTICE,
      summaryHeading: PRIVACY_SUMMARY_HEADING,
      summary: PRIVACY_SUMMARY,
      sections: PRIVACY_SECTIONS,
      contents: PRIVACY_SECTIONS.map((section, index) => ({
        id: section.id,
        label: `${index + 1}. ${section.title}`,
      })),
      contactEmail: CONTACT_EMAIL,
    },
    flags: {
      isDraft: PRIVACY_NOTICE_STATUS === "draft",
    },
  };
}
