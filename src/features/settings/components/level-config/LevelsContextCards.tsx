import { useThemeColors } from "@/app/theme/useThemeColors";
import { Card } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import {
    HistoryOutlined,
    InfoCircleOutlined,
    SettingOutlined,
} from "@ant-design/icons";

export function LevelsContextCards() {
  const isMobile = useIsMobile();
  const colors = useThemeColors();

  const cards = [
    {
      key: "hierarchy",
      icon: <InfoCircleOutlined style={{ fontSize: 18, color: colors.primary }} />,
      header: "Hierarchy Info",
      text: "Rank order dictates how students transfer between years.",
    },
    {
      key: "progression",
      icon: <SettingOutlined style={{ fontSize: 18, color: colors.primary }} />,
      header: "Auto-Progression",
      text: "The system calculates standing based on level thresholds.",
    },
    {
      key: "updates",
      icon: <HistoryOutlined style={{ fontSize: 18, color: colors.primary }} />,
      header: "Recent Updates",
      text: "Level descriptions and ordering can be managed here.",
    },
  ] as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          header={card.header}
          size="sm"
          density="comfortable"
          variant="outlined"
          style={{ height: "100%" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {card.icon}
          </div>
          {card.text}
        </Card>
      ))}
    </div>
  );
}
