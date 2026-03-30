import { useThemeColors } from "@/app/theme/useThemeColors";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { HistoryOutlined } from "@ant-design/icons";
import { Typography } from "antd";

export interface PageFooterProps {
  totalFaculties: number;
  totalDepartments: number;
  updatedAt?: string;
}

export function PageFooter({
  totalFaculties,
  totalDepartments,
  updatedAt = "—",
}: PageFooterProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const colors = useThemeColors();

  const items = [
    { color: colors.primary, label: "Active Infrastructure" },
    { color: colors.info, label: `${totalFaculties} Faculties` },
    { color: colors.warning, label: `${totalDepartments} Departments` },
  ];

  return (
    <footer
      style={{
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: isMobile ? "10px 12px" : "12px 24px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: isMobile ? 8 : 12,
      }}
    >
      <div style={{ display: "flex", gap: isMobile ? 16 : 32, flexWrap: "wrap" }}>
        {items.map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <Typography.Text
              style={{
                fontSize: isMobile ? 9 : 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: token.colorTextSecondary,
              }}
            >
              {label}
            </Typography.Text>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.7 }}>
        <HistoryOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />
        <Typography.Text
          style={{
            fontSize: isMobile ? 9 : 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: token.colorTextTertiary,
          }}
        >
          Update: {updatedAt}
        </Typography.Text>
      </div>
    </footer>
  );
}
