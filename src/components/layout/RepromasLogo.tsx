import { useToken } from "@/hooks/useToken";

interface RepromasLogoProps {
  collapsed?: boolean;
  /** Use white text (for dark sidebar) */
  lightText?: boolean;
}

export function RepromasLogo({
  collapsed = false,
  lightText = false,
}: RepromasLogoProps) {
  const token = useToken();

  if (collapsed) {
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: token.colorPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: token.colorBgContainer,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        R
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: token.colorPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: token.colorBgContainer,
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        R
      </div>
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: lightText ? token.colorBgContainer : token.colorText,
          letterSpacing: "-0.3px",
        }}
      >
        Repromas
      </span>
    </div>
  );
}
