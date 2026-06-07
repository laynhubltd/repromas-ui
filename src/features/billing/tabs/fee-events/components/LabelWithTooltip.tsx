import { useToken } from "@/shared/hooks/useToken";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Flex, Tooltip, Typography } from "antd";
import type { CSSProperties } from "react";

type LabelWithTooltipProps = {
  label: string;
  tooltip: string;
  variant?: "secondary" | "default";
  style?: CSSProperties;
  uppercase?: boolean;
};

export function LabelWithTooltip({
  label,
  tooltip,
  variant = "secondary",
  style,
  uppercase = false,
}: LabelWithTooltipProps) {
  const token = useToken();

  const text =
    variant === "secondary" ? (
      <Typography.Text
        type="secondary"
        style={{
          fontSize: token.fontSizeSM,
          lineHeight: 1.3,
          fontWeight: uppercase ? 500 : undefined,
          textTransform: uppercase ? "uppercase" : undefined,
          letterSpacing: uppercase ? "0.02em" : undefined,
          ...style,
        }}
      >
        {label}
      </Typography.Text>
    ) : (
      <Typography.Text style={style}>{label}</Typography.Text>
    );

  return (
    <Flex align="center" gap={6} style={{ minWidth: 0 }}>
      {text}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined
          style={{
            color: token.colorTextTertiary,
            fontSize: token.fontSizeSM,
            cursor: "help",
            flexShrink: 0,
          }}
        />
      </Tooltip>
    </Flex>
  );
}
