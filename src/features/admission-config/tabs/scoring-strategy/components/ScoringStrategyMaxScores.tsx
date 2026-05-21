import { useToken } from "@/shared/hooks/useToken";
import { Flex, Typography } from "antd";

type ScoringStrategyMaxScoresProps = {
  maxJambScore: number;
  maxSchoolScore: number;
  variant?: "compact" | "expanded";
};

type ScoreTileProps = {
  label: string;
  value: number;
  accentColor: string;
  variant: "compact" | "expanded";
};

function ScoreTile({ label, value, accentColor, variant }: ScoreTileProps) {
  const token = useToken();
  const isExpanded = variant === "expanded";

  return (
    <div
      style={{
        flex: 1,
        minWidth: isExpanded ? 140 : 108,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgLayout,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 4,
          background: accentColor,
        }}
      />
      <Flex
        vertical
        gap={4}
        style={{
          padding: isExpanded ? `${token.paddingSM}px ${token.paddingMD}px` : "8px 12px",
        }}
      >
        <Typography.Text
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Typography.Text>
        <Typography.Text
          strong
          style={{
            fontSize: isExpanded ? 28 : token.fontSizeLG,
            lineHeight: 1.1,
            color: token.colorText,
          }}
        >
          {value}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          points max
        </Typography.Text>
      </Flex>
    </div>
  );
}

export function ScoringStrategyMaxScores({
  maxJambScore,
  maxSchoolScore,
  variant = "compact",
}: ScoringStrategyMaxScoresProps) {
  const token = useToken();

  return (
    <Flex vertical gap={8} style={{ width: "100%" }}>
      <Typography.Text
        type="secondary"
        style={{
          fontSize: token.fontSizeSM,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        Max scores
      </Typography.Text>
      <Flex gap={8} wrap="wrap">
        <ScoreTile
          label="JAMB"
          value={maxJambScore}
          accentColor={token.colorPrimary}
          variant={variant}
        />
        <ScoreTile
          label="School"
          value={maxSchoolScore}
          accentColor="#722ed1"
          variant={variant}
        />
      </Flex>
    </Flex>
  );
}
