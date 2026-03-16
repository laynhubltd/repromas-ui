import { useToken } from "@/hooks/useToken";
import { Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { SettingsBannerSvg } from "@/assets/illustrations/SettingsBannerSvg";
import { colors, hexToRgba } from "@/config/theme";

const BANNER_TINT = "#f0f7f4";

export function SettingsBanner() {
  const token = useToken();
  const isMobile = useIsMobile();

  const paddingVertical = token.sizeXS;
  const paddingHorizontal = isMobile ? token.sizeLG : token.sizeXL;
  const gap = isMobile ? token.sizeMD : token.sizeLG;
  const illustrationWidth = isMobile ? 180 : 220;

  return (
    <div
      style={{
        background: BANNER_TINT,
        border: `1px solid ${token.colorBorder}`,
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
          paddingTop: paddingVertical,
          paddingBottom: paddingVertical,
          paddingLeft: paddingHorizontal,
          paddingRight: paddingHorizontal,
          gap,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile ? token.sizeSM : token.sizeMD,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: "50%",
              background: hexToRgba(colors.primary, 0.1),
              color: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoCircleOutlined style={{ fontSize: 18 }} />
          </div>
          <div
            style={{
              maxWidth: 520,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: token.sizeXS,
            }}
          >
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              fontWeight: 700,
              color: token.colorText,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            Settings
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              lineHeight: 1.5,
              display: "block",
              color: token.colorTextSecondary,
            }}
          >
            Configure academic sessions, semesters, and semester types in one
            place. Set the current session, manage terms per session, and define
            semester types used across the system.
          </Typography.Text>
          </div>
        </div>

        {/* SVG illustration — right side on desktop, below on mobile */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-end",
            paddingLeft: isMobile ? 0 : 16,
          }}
        >
          <SettingsBannerSvg width={illustrationWidth} />
        </div>
      </div>
    </div>
  );
}
