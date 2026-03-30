import { useAppSelector } from "@/app/hooks";
import { BookOutlined } from "@ant-design/icons";
import React from "react";
import "./AuthPageLayout.css";
import { AuthPanelPattern } from "./AuthPanelPattern";
import { StudentIllustration } from "./StudentIllustration";

const DEFAULT_SYSTEM_NAME = "Repromas Academic";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  /** Background illustration variant — kept for future extensibility */
  illustration: "login" | "signup" | "reset";
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  illustration: _illustration,
}) => {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const tenantName = useAppSelector((state) => state.theme.tenantName);
  const logoUrl = useAppSelector((state) => state.theme.logoUrl);

  const displayName = tenantName ?? DEFAULT_SYSTEM_NAME;

  return (
    <div className="auth-page">
      {/* ── Left: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
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
          <div className="auth-form-panel__body">
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
