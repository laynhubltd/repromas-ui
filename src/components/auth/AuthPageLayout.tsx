import { useAppSelector } from "@/app/hooks";
import { ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";
import "./AuthPageLayout.css";
import { AuthPanelPattern } from "./AuthPanelPattern";
import { StudentIllustration } from "./StudentIllustration";

const DEFAULT_SYSTEM_NAME = "Repromas Academic";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  /** Background illustration variant — kept for future extensibility */
  illustration: "login" | "signup" | "reset";
  /** Lock the form column to viewport height and scroll body content vertically */
  fillViewport?: boolean;
  /** Top-left back link destination */
  backTo?: string;
  backLabel?: string;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  illustration: _illustration,
  fillViewport = false,
  backTo,
  backLabel = "Back",
}) => {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const tenantName = useAppSelector((state) => state.theme.tenantName);
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);

  const displayName = tenantName ?? DEFAULT_SYSTEM_NAME;

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
              <img src={logoUrl} alt={displayName} className="auth-form-panel__logo-img" />
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
        </div>
      </div>

      {/* ── Right: Illustration Panel ── */}
      <div className="auth-illustration-panel" style={{ background: primaryColor }}>
        <AuthPanelPattern />
        <div className="auth-illustration-panel__brand">
          <span className="auth-illustration-panel__brand-name">REPROMAS</span>
        </div>
        <div className="auth-illustration-panel__content">
          <StudentIllustration />
        </div>
      </div>
    </div>
  );
};
