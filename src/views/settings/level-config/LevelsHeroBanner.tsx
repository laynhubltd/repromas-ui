import { colors } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import { Typography } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

const HERO_TINT = "#f0f7f4";

/** Stepped bars SVG for Levels hero (matches provided design). */
function LevelsHeroSvg({ width = 120 }: { width?: number }) {
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
      <rect
        x="10"
        y="60"
        width="20"
        height="20"
        rx="2"
        fill={colors.primary}
        fillOpacity="0.1"
      />
      <rect
        x="40"
        y="40"
        width="20"
        height="40"
        rx="2"
        fill={colors.primary}
        fillOpacity="0.3"
      />
      <rect
        x="70"
        y="20"
        width="20"
        height="60"
        rx="2"
        fill={colors.primary}
        fillOpacity="0.6"
      />
      <rect
        x="100"
        y="0"
        width="20"
        height="80"
        rx="2"
        fill={colors.primary}
      />
      <path
        d="M15 55 L45 35 L75 15 L105 -5"
        stroke={colors.primary}
        strokeDasharray="4 4"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function LevelsHeroBanner() {
  const token = useToken();
  const isMobile = useIsMobile();

  const paddingVertical = isMobile ? 16 : 24;
  const paddingHorizontal = isMobile ? 16 : 24;
  const illustrationWidth = isMobile ? 100 : 120;

  return (
    <div
      style={{
        background: HERO_TINT,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: colors.primary,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          padding: isMobile
            ? `${paddingVertical}px ${paddingHorizontal}px`
            : `${paddingVertical}px ${paddingHorizontal}px ${paddingVertical}px ${paddingHorizontal + 4}px`,
          gap: isMobile ? 16 : 24,
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: 560, minWidth: 0 }}>
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 8,
              fontWeight: 700,
              color: colors.primary,
              fontSize: isMobile ? token.fontSizeLG : 20,
            }}
          >
            Levels
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              lineHeight: 1.6,
              color: token.colorTextSecondary,
              display: "block",
            }}
          >
            Academic levels define the progression order for students—e.g. 100,
            200, 300. Rank order controls how levels are listed and used in the
            system.
          </Typography.Text>
        </div>
        {!isMobile && (
          <div
            style={{
              flexShrink: 0,
              opacity: 0.85,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <LevelsHeroSvg width={illustrationWidth} />
          </div>
        )}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              opacity: 0.85,
            }}
          >
            <LevelsHeroSvg width={illustrationWidth} />
          </div>
        )}
      </div>
    </div>
  );
}
