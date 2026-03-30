import { useThemeColors } from "@/app/theme/useThemeColors";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { Typography } from "antd";

const HERO_TINT = "#f0f7f4";

function LevelsHeroSvg({ width = 120, primary }: { width?: number; primary: string }) {
  const height = width * (80 / 120);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect x="10" y="60" width="20" height="20" rx="2" fill={primary} fillOpacity="0.1" />
      <rect x="40" y="40" width="20" height="40" rx="2" fill={primary} fillOpacity="0.3" />
      <rect x="70" y="20" width="20" height="60" rx="2" fill={primary} fillOpacity="0.6" />
      <rect x="100" y="0" width="20" height="80" rx="2" fill={primary} />
    </svg>
  );
}

export function LevelsHeroBanner() {
  const token = useToken();
  const isMobile = useIsMobile();
  const colors = useThemeColors();

  return (
    <div
      style={{
        background: HERO_TINT,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          padding: isMobile ? 16 : 24,
          gap: isMobile ? 16 : 24,
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <Typography.Title
            level={5}
            style={{ margin: 0, marginBottom: 8, color: colors.primary }}
          >
            Levels
          </Typography.Title>
          <Typography.Text type="secondary">
            Academic levels define progression order for students.
          </Typography.Text>
        </div>
        <LevelsHeroSvg width={isMobile ? 100 : 120} primary={colors.primary} />
      </div>
    </div>
  );
}
