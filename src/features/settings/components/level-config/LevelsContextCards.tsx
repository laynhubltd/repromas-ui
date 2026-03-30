import { useThemeColors } from "@/app/theme/useThemeColors";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";

export function LevelsContextCards() {
  const token = useToken();
  const isMobile = useIsMobile();
  const colors = useThemeColors();

  const cards = [
    {
      key: "hierarchy",
      icon: <InfoCircleOutlined style={{ fontSize: 18, color: colors.primary }} />,
      title: "Hierarchy Info",
      text: "Rank order dictates how students transfer between years.",
    },
    {
      key: "progression",
      icon: <SettingOutlined style={{ fontSize: 18, color: colors.primary }} />,
      title: "Auto-Progression",
      text: "The system calculates standing based on level thresholds.",
    },
    {
      key: "updates",
      icon: <HistoryOutlined style={{ fontSize: 18, color: colors.primary }} />,
      title: "Recent Updates",
      text: "Level descriptions and ordering can be managed here.",
    },
  ] as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: token.sizeLG,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.key}
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
            {card.icon}
            <Typography.Text strong>{card.title}</Typography.Text>
          </div>
          <Typography.Text type="secondary">{card.text}</Typography.Text>
        </div>
      ))}
    </div>
  );
}
