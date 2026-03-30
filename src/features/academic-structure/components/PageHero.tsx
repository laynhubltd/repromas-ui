import { hexToRgba } from "@/app/theme/themeConfig";
import { useThemeColors } from "@/app/theme/useThemeColors";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
const tintGreen = "#f0f7f4";

export function PageHero() {
  const token = useToken();
  const isMobile = useIsMobile();
  const colors = useThemeColors();
  return (
    <div
      style={{
        background: tintGreen,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        boxShadow: token.boxShadowSecondary,
        position: "relative",
      }}
    >
      <div
        style={{
          width: isMobile ? 3 : 4,
          minWidth: isMobile ? 3 : 4,
          background: colors.primary,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          padding: isMobile ? "12px 16px" : "12px 24px",
          gap: isMobile ? 12 : 0,
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: 720, minWidth: 0 }}>
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 4,
              fontSize: isMobile ? token.token.fontSizeLG : undefined,
            }}
          >
            Faculties & Programs Hierarchy
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM,
              lineHeight: 1.5,
            }}
          >
            Manage the academic structure by defining Faculty codes and names,
            Department codes and names, and specific Program details including
            degree titles and duration.
          </Typography.Text>
        </div>
        {!isMobile && (
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
              marginLeft: 24,
            }}
          >
            <InfoCircleOutlined style={{ fontSize: 18 }} />
          </div>
        )}
      </div>
    </div>
  );
}
