import { colors } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import {
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

const CARDS = [
  {
    key: "hierarchy",
    icon: <InfoCircleOutlined style={{ fontSize: 18, color: colors.primary }} />,
    title: "Hierarchy Info",
    text: "Rank order dictates how students transfer between years. Lower ranks must be completed before higher ranks are accessible.",
  },
  {
    key: "progression",
    icon: (
      <SettingOutlined style={{ fontSize: 18, color: colors.primary }} />
    ),
    title: "Auto-Progression",
    text: "The system automatically calculates student standing based on credit threshold assigned to each level.",
  },
  {
    key: "updates",
    icon: (
      <HistoryOutlined style={{ fontSize: 18, color: colors.primary }} />
    ),
    title: "Recent Updates",
    text: "Last updated by Admin. Level descriptions can be modified here.",
  },
] as const;

export function LevelsContextCards() {
  const token = useToken();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: token.sizeLG,
      }}
    >
      {CARDS.map(({ key, icon, title, text }) => (
        <div
          key={key}
          style={{
            padding: 16,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            {icon}
            <Typography.Text
              strong
              style={{
                fontSize: token.fontSizeSM,
                color: token.colorText,
              }}
            >
              {title}
            </Typography.Text>
          </div>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: token.colorTextSecondary,
              display: "block",
            }}
          >
            {text}
          </Typography.Text>
        </div>
      ))}
    </div>
  );
}
