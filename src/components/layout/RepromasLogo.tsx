import type { CSSProperties, FC } from "react";
import { useMemo, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import { resolveHost } from "@/app/routing/host-resolver";
import { branding } from "@/config/branding";
import { useToken } from "@/shared/hooks/useToken";
import type { RoleEntity } from "@/features/auth/types";
import LogoMarkPrimaryLight from "@/assets/brand-kit/01-logo/repromas-primary-07-dots-transparent.svg?react";
import LogoMarkPrimaryDark from "@/assets/brand-kit/01-logo/repromas-primary-07-dots-for-dark-bg.svg?react";
import LogoMarkSecondaryLight from "@/assets/brand-kit/01-logo/repromas-secondary-05-echo-transparent.svg?react";
import LogoMarkSecondaryDark from "@/assets/brand-kit/01-logo/repromas-secondary-05-echo-for-dark-bg.svg?react";

export interface RepromasLogoProps {
  /** Collapsed sidebar mode (renders standalone logo mark/avatar) */
  collapsed?: boolean;
  /** Use light/white version (for dark sidebar or dark background) */
  lightText?: boolean;
  /** Logo mark style fallback: "secondary" (echo mark) or "primary" (dots mark). Default: "secondary" */
  markStyle?: "primary" | "secondary";
  /** Custom height for logo in pixels (default: 44) */
  height?: number;
  /** Override logo URL (if omitted, pulled from Redux theme slice) */
  customLogoUrl?: string | null;
  /** Override subtitle (if omitted, pulled from active role scope entity department, defaulting to "Admin" for Global) */
  customSubtitle?: string | null;
  /** @deprecated Use customSubtitle instead */
  customTitle?: string | null;
  /** Override tenant slug (if omitted, resolved from hostname) */
  customSlug?: string | null;
  /** Whether to render the department/scope subtitle beneath the slug title (default: true) */
  showScopeSubtitle?: boolean;
  /** @deprecated Alias for showScopeSubtitle */
  showFullName?: boolean;
  className?: string;
  style?: CSSProperties;
}

function resolveScopeDepartmentName(
  activeRoleScope: string | undefined,
  entity: RoleEntity | null | undefined,
  customOverride?: string | null
): string {
  if (customOverride !== undefined && customOverride !== null) {
    return customOverride;
  }

  if (!activeRoleScope || activeRoleScope === "GLOBAL") {
    return "Admin";
  }

  if (activeRoleScope === "DEPARTMENT" && entity && "name" in entity) {
    return entity.name;
  }

  if (
    activeRoleScope === "PROGRAM" &&
    entity &&
    "department" in entity &&
    entity.department?.name
  ) {
    return entity.department.name;
  }

  if (activeRoleScope === "FACULTY" && entity && "name" in entity) {
    return entity.name;
  }

  if (
    activeRoleScope === "STUDENT" &&
    entity &&
    "program" in entity &&
    entity.program?.department?.name
  ) {
    return entity.program.department.name;
  }

  if (
    entity &&
    "name" in entity &&
    typeof entity.name === "string" &&
    entity.name.trim().length > 0
  ) {
    return entity.name;
  }

  return "Admin";
}

export const RepromasLogo: FC<RepromasLogoProps> = ({
  collapsed = false,
  lightText = false,
  markStyle = "secondary",
  height = 44,
  customLogoUrl,
  customSubtitle,
  customTitle,
  customSlug,
  showScopeSubtitle = true,
  showFullName,
  className = "",
  style,
}) => {
  const token = useToken();
  const theme = useAppSelector((state) => state.theme);
  const auth = useAppSelector((state) => state.auth);
  const [imageError, setImageError] = useState(false);

  // Derive tenant slug from hostname if not provided via props
  const hostResolution = useMemo(
    () =>
      typeof window !== "undefined"
        ? resolveHost(window.location.hostname, {
          apexDomain: import.meta.env.VITE_APEX_DOMAIN,
        })
        : { tenantSlug: null },
    []
  );

  const rawLogoUrl = customLogoUrl !== undefined ? customLogoUrl : theme.logoUrl;
  const logoUrl = rawLogoUrl && rawLogoUrl.trim().length > 0 ? rawLogoUrl : null;

  const slug = customSlug !== undefined ? customSlug : hostResolution.tenantSlug;

  // Prominent slug in capital letters (e.g. FUTB or REPROMAS)
  const slugTitle = (
    slug && slug.trim().length > 0
      ? slug
      : theme.systemName || branding.systemName
  ).toUpperCase();

  // Department of the scope entity, defaulting to "Admin" for GLOBAL scope
  const overrideSubtitle = customSubtitle ?? customTitle;
  const scopeSubtitle = resolveScopeDepartmentName(
    auth.activeRole?.scope,
    auth.entity,
    overrideSubtitle
  );

  const shouldShowSubtitle = showFullName !== undefined ? showFullName : showScopeSubtitle;

  const MarkSvg =
    markStyle === "secondary"
      ? lightText
        ? LogoMarkSecondaryDark
        : LogoMarkSecondaryLight
      : lightText
        ? LogoMarkPrimaryDark
        : LogoMarkPrimaryLight;

  const hasValidCustomLogo = Boolean(logoUrl && !imageError);

  // Render the logo icon / avatar mark
  const renderMark = () => {
    if (hasValidCustomLogo && logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={scopeSubtitle ? `${slugTitle} - ${scopeSubtitle}` : slugTitle}
          onError={() => setImageError(true)}
          style={{
            width: height,
            height: height,
            objectFit: "contain",
            borderRadius: 8,
            display: "block",
          }}
          data-testid="repromas-logo-img"
        />
      );
    }

    return (
      <MarkSvg
        width={height}
        height={height}
        style={{ width: height, height: height, display: "block" }}
        data-testid="repromas-logo-svg"
      />
    );
  };

  // Collapsed Sidebar: Centered Mark Only
  if (collapsed) {
    return (
      <span
        className={`repromas-logo repromas-logo--collapsed inline-flex items-center justify-center ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          width: height,
          lineHeight: 0,
          ...style,
        }}
        data-testid="repromas-logo"
      >
        {renderMark()}
      </span>
    );
  }

  // Expanded Sidebar: Mark + Capitalized Slug Title + Department/Scope Subtitle Below
  return (
    <div
      className={`repromas-logo repromas-logo--expanded flex items-center ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        userSelect: "none",
        minWidth: 0,
        maxWidth: "100%",
        ...style,
      }}
      data-testid="repromas-logo"
    >
      <div
        style={{
          width: height,
          height: height,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderMark()}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "1.5px",
            lineHeight: 1.1,
            color: lightText ? token.colorBgContainer : token.colorTextHeading,
            fontFamily: token.fontFamily,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          data-testid="repromas-logo-slug-title"
        >
          {slugTitle}
        </span>

        {shouldShowSubtitle && scopeSubtitle && (
          <span
            title={scopeSubtitle}
            style={{
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.25,
              color: lightText ? "rgba(255, 255, 255, 0.75)" : token.colorTextSecondary,
              fontFamily: token.fontFamily,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
            data-testid="repromas-logo-scope-subtitle"
          >
            {scopeSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default RepromasLogo;
