import type { FC } from "react";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import { resolveHost } from "@/app/routing/host-resolver";
import { branding } from "@/config/branding";

export interface PageSEOProps {
  /** Page-specific title (e.g. "Admissions Portal", "Dashboard") */
  title?: string;
  /** Meta description for search engines and link previews */
  description?: string;
  /** Additional search keywords */
  keywords?: string;
  /** Social share preview image URL */
  image?: string;
  /** Canonical URL for this page */
  canonicalUrl?: string;
  /** Set to true to prevent search engines from indexing this page (e.g. private admin panels) */
  noIndex?: boolean;
  /** Whether to append the tenant/institution name to the title (default: true) */
  includeTenantSuffix?: boolean;
}

/**
 * Ultra-lightweight, zero-dependency SEO & document head management component for React 19.
 * Leverages React 19 native document metadata hoisting with dynamic multi-tenant awareness.
 */
export const PageSEO: FC<PageSEOProps> = ({
  title,
  description = "REPROMAS is a next-generation multi-tenant academic workflow and student information system.",
  keywords,
  image = "/apple-touch-icon.png",
  canonicalUrl,
  noIndex = false,
  includeTenantSuffix = true,
}) => {
  const theme = useAppSelector((state) => state.theme);

  // Derive tenant information
  const hostResolution = useMemo(
    () =>
      typeof window !== "undefined"
        ? resolveHost(window.location.hostname, {
            apexDomain: import.meta.env.VITE_APEX_DOMAIN,
          })
        : { tenantSlug: null, kind: "unknown" as const },
    []
  );

  const tenantName =
    theme.tenantName ??
    theme.schoolName ??
    branding.schoolName;

  const systemName = theme.systemName || branding.systemName || "REPROMAS";

  // Build formatted full page title
  const fullTitle = useMemo(() => {
    const parts: string[] = [];

    if (title && title.trim().length > 0) {
      parts.push(title.trim());
    }

    if (includeTenantSuffix) {
      if (hostResolution.kind === "tenant" && tenantName) {
        parts.push(tenantName);
      }
      parts.push(systemName);
    } else if (parts.length === 0) {
      parts.push(systemName);
    }

    return parts.join(" — ");
  }, [title, includeTenantSuffix, hostResolution.kind, tenantName, systemName]);

  // Sync document.title for immediate client-side route transitions
  useEffect(() => {
    if (typeof document !== "undefined" && fullTitle) {
      document.title = fullTitle;
    }
  }, [fullTitle]);

  return (
    <>
      {/* Native React 19 Document Metadata Elements (Hoisted to <head>) */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </>
  );
};

export default PageSEO;
