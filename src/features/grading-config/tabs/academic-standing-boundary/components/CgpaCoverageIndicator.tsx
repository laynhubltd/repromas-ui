import { useToken } from "@/shared/hooks/useToken";
import { Alert, Card, Flex, Tag, Tooltip, Typography } from "antd";
import {
  deriveTierIntervals,
  type MinimalBoundary,
} from "../utils/tierIntervalDerivation";

export interface CgpaCoverageIndicatorProps {
  boundaries: MinimalBoundary[];
  policyMaxCgpa: number;
}

export function CgpaCoverageIndicator({
  boundaries,
  policyMaxCgpa,
}: CgpaCoverageIndicatorProps) {
  const token = useToken();
  const derivation = deriveTierIntervals(boundaries, policyMaxCgpa);
  const { segments, hasUnanchoredBase, unanchoredSegment } = derivation;

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case "success":
        return {
          bg: token.colorSuccessBg,
          border: token.colorSuccessBorder,
          text: token.colorSuccessText,
          bar: token.colorSuccess,
        };
      case "warning":
        return {
          bg: token.colorWarningBg,
          border: token.colorWarningBorder,
          text: token.colorWarningText,
          bar: token.colorWarning,
        };
      case "error":
        return {
          bg: token.colorErrorBg,
          border: token.colorErrorBorder,
          text: token.colorErrorText,
          bar: token.colorError,
        };
      default:
        return {
          bg: token.colorFillAlter,
          border: token.colorBorderSecondary,
          text: token.colorText,
          bar: token.colorPrimary,
        };
    }
  };

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorderSecondary,
      }}
      styles={{
        body: { padding: token.paddingMD },
      }}
    >
      <Flex vertical gap={12}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Typography.Text strong>Continuous CGPA Tier Intervals</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Scale: 0.00 – {policyMaxCgpa.toFixed(2)} CGPA
          </Typography.Text>
        </Flex>

        {/* Continuous Segment Bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 36,
            borderRadius: token.borderRadiusSM,
            overflow: "hidden",
            background: token.colorFillTertiary,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Segments from highest to lowest */}
          {segments.map((seg) => {
            const colors = getSeverityColors(seg.severity);
            return (
              <Tooltip
                key={seg.boundaryId}
                title={`${seg.name} (${seg.intervalText})`}
              >
                <div
                  style={{
                    width: `${seg.percentageWidth}%`,
                    backgroundColor: colors.bar,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "0 4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    borderRight: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            );
          })}

          {/* Unanchored gap segment */}
          {hasUnanchoredBase && unanchoredSegment && (
            <div
              title={`Unconfigured Gap: ${unanchoredSegment.intervalText}`}
              style={{
                width: `${unanchoredSegment.percentageWidth}%`,
                background: `repeating-linear-gradient(45deg, ${token.colorErrorBg}, ${token.colorErrorBg} 10px, ${token.colorErrorBorder} 10px, ${token.colorErrorBorder} 20px)`,
                color: token.colorErrorText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                padding: "0 4px",
              }}
            >
              ⚠ Gap: {unanchoredSegment.intervalText}
            </div>
          )}
        </div>

        {/* Unanchored Warning */}
        {hasUnanchoredBase && (
          <Alert
            type="warning"
            showIcon
            title="Unanchored Policy Base Tier"
            description={`The lowest tier starts at ${segments[segments.length - 1]?.minCgpa.toFixed(2)}. Students with a CGPA below this threshold will not match any academic standing tier. Add a boundary starting at 0.00 to close this gap.`}
          />
        )}

        {/* Interval Chips */}
        <Flex wrap="wrap" gap={8} align="center">
          {segments.map((seg) => (
            <Tag key={seg.boundaryId} color={seg.severity === "success" ? "success" : seg.severity === "warning" ? "warning" : "error"}>
              <strong>{seg.name}</strong>: {seg.intervalText}
            </Tag>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
