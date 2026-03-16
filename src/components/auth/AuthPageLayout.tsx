import { branding } from "@/config/branding";
import { colors, hexToRgba } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import React from "react";
import { AuthIllustration } from "./AuthIllustration";
import { StudentIllustration } from "./StudentIllustration";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  /** Background illustration variant */
  illustration: "login" | "signup" | "reset";
}

const primaryRgba = (alpha: number) => hexToRgba(colors.primary, alpha);

/**
 * Full-viewport auth layout: left = glassmorphism branding panel (system name, school, slogan),
 * right = auth card. Responsive: stacks on small screens.
 */
export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  illustration,
}) => {
  const t = useToken();

  return (
    <div
      className="auth-page"
      style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        background: t.colorBgLayout,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background illustration (behind both panels) */}
      <AuthIllustration variant={illustration} />

      {/* Left: Glassmorphism branding panel – frosted glass with primary tint */}
      <div
        className="auth-page-brand-panel"
        style={{
          flex: "1 1 45%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: t.sizeXXL * 1.5,
          background: `linear-gradient(145deg, rgba(255,255,255,0.35) 0%, ${primaryRgba(0.18)} 50%, rgba(255,255,255,0.2) 100%)`,
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          borderRight: `1px solid rgba(255,255,255,0.4)`,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.5),
            inset -1px 0 0 ${primaryRgba(0.15)},
            4px 0 24px -4px ${primaryRgba(0.12)}
          `,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <StudentIllustration />
        </div>
        <div style={{ maxWidth: 420 }}>
          <h1
            className="auth-system-name"
            style={{
              margin: 0,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: t.colorPrimary,
              textShadow: `0 0 40px ${primaryRgba(0.3)}`,
            }}
          >
            {branding.systemName}
          </h1>
          <p
            className="auth-school-name"
            style={{
              margin: 0,
              marginTop: t.sizeMD,
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              fontWeight: 500,
              lineHeight: 1.45,
              color: t.colorText,
            }}
          >
            {branding.schoolName}
          </p>
        </div>
        <p
          className="auth-tagline"
          style={{
            margin: 0,
            fontSize: t.fontSizeSM,
            color: t.colorTextSecondary,
            letterSpacing: "0.02em",
          }}
        >
          {branding.tagline}
        </p>
      </div>

      {/* Right: Auth card area */}
      <div
        className="auth-page-form-area"
        style={{
          flex: "1 1 55%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: t.sizeLG,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="auth-page-card"
          style={{
            width: "100%",
            maxWidth: 440,
            padding: t.sizeXXL,
            background: t.colorBgContainer,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
