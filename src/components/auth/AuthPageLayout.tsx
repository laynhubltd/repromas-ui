import { useAppSelector } from "@/app/hooks";
import { resolveHost } from "@/app/routing/host-resolver";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";
import "./AuthPageLayout.css";
import { AuthPanelPattern } from "./AuthPanelPattern";
import {
  resolveAuthBrandDisplayName,
  resolveAuthPanelBackground,
} from "./resolveAuthBrandDisplayName";
import { StudentIllustration } from "./StudentIllustration";

type AuthPageLayoutProps = {
  children: React.ReactNode;
  /** Background illustration variant — kept for future extensibility */
  illustration: "login" | "signup" | "reset";
  /** Optional editorial / announcement block anchored at bottom of right panel */
  bottomPanel?: React.ReactNode;
  /** Softens illustration opacity while an interactive right-panel guide is open */
  illustrationDimmed?: boolean;
  /** Lock the form column to viewport height and scroll body content vertically */
  fillViewport?: boolean;
  /** Top-left back link destination */
  backTo?: string;
  backLabel?: string;
};

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  bottomPanel,
  illustrationDimmed = false,
  fillViewport = false,
  backTo,
  backLabel = "Back",
}) => {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const schoolName = useAppSelector((state) => state.theme.schoolName);
  const systemName = useAppSelector((state) => state.theme.systemName);
  const tenantName = useAppSelector((state) => state.theme.tenantName);
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);

  const tenantSlug =
    typeof window !== "undefined"
      ? resolveHost(window.location.hostname, {
          apexDomain: import.meta.env.VITE_APEX_DOMAIN,
        }).tenantSlug
      : null;

  const displayName = resolveAuthBrandDisplayName({
    schoolName,
    systemName,
    tenantName,
    tenantSlug,
  });
  const panelBackground = resolveAuthPanelBackground(primaryColor);

  return (
    <div className={`auth-page${fillViewport ? " auth-page--fill" : ""}`}>
      {/* ── Left: Form Panel ── */}
      <div
        className={`auth-form-panel${fillViewport ? " auth-form-panel--fill" : ""}`}
      >
        {backTo ? (
          <Link to={backTo} className="auth-form-panel__back">
            <ArrowLeftOutlined aria-hidden />
            <span>{backLabel}</span>
          </Link>
        ) : null}
        <div
          className={`auth-form-panel__inner${fillViewport ? " auth-form-panel__inner--fill" : ""}`}
        >
          <div className="auth-form-panel__header">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="auth-form-panel__logo-img"
              />
            ) : (
              <span className="auth-form-panel__logo-icon" aria-hidden="true">
                <BookOutlined />
              </span>
            )}
            <span className="auth-form-panel__system-name">{displayName}</span>
          </div>
          <div
            className={`auth-form-panel__body${fillViewport ? " auth-form-panel__body--fill" : ""}`}
          >
            {children}
          </div>
          <div className="auth-form-panel__mobile-footer">
            Powered by <strong>REPROMAS</strong>
          </div>
        </div>
      </div>

      {/* ── Right: Illustration & Editorial Panel ── */}
      <div
        className={`auth-illustration-panel${bottomPanel ? " auth-illustration-panel--with-bottom" : ""
          }`}
        style={{ background: panelBackground }}
      >
        <AuthPanelPattern />
        <div className="auth-illustration-panel__brand">
          <span className="auth-illustration-panel__brand-name">REPROMAS</span>
        </div>
        <div
          className={`auth-illustration-panel__content${bottomPanel ? " auth-illustration-panel__content--compact" : ""
            }${illustrationDimmed ? " auth-illustration-panel__content--dimmed" : ""}`}
        >
          <StudentIllustration />
        </div>
        <ConditionalRenderer when={Boolean(bottomPanel)}>
          <div className="auth-illustration-panel__bottom">{bottomPanel}</div>
        </ConditionalRenderer>
      </div>
    </div>
  );
};
