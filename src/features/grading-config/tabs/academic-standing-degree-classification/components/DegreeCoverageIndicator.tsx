import { useToken } from "@/shared/hooks/useToken";
import { Alert, Card, Flex, Tag, Tooltip, Typography } from "antd";
import type { DegreeIntervalDerivationResult } from "../utils/degreeIntervalDerivations";

export interface DegreeCoverageIndicatorProps {
  derivation: DegreeIntervalDerivationResult;
  policyMaxCgpa: number;
}

export function DegreeCoverageIndicator({
  derivation,
  policyMaxCgpa,
}: DegreeCoverageIndicatorProps) {
  const token = useToken();
  const { segments, gaps, overlaps, hasOverlaps, hasGaps } = derivation;

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "success":
        return "#52c41a";
      case "info":
        return "#1677ff";
      case "warning":
        return "#fa8c16";
      case "error":
        return "#ff4d4f";
      default:
        return "#722ed1";
    }
  };

  return (
    <Card size="small" title={<Typography.Text strong>Continuous CGPA Scale Coverage</Typography.Text>}>
      <Flex vertical gap={12}>
        {/* Scale Header */}
        <Flex justify="space-between" align="center">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Policy Scale: <strong>0.00 – {policyMaxCgpa.toFixed(2)} CGPA</strong>
          </Typography.Text>
          <Flex gap={8}>
            {hasOverlaps && <Tag color="error">Overlap Detected</Tag>}
            {hasGaps && <Tag color="warning">Unassigned Gaps</Tag>}
            {!hasOverlaps && !hasGaps && <Tag color="success">Full Scale Covered</Tag>}
          </Flex>
        </Flex>

        {/* Visual Bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 32,
            borderRadius: token.borderRadiusSM,
            overflow: "hidden",
            backgroundColor: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {segments.length === 0 ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: token.colorFillQuaternary,
                color: token.colorTextSecondary,
                fontSize: 12,
              }}
            >
              Zero custom bands defined (Standard national benchmark fallback active)
            </div>
          ) : (
            segments.map((seg, idx) => (
              <Tooltip
                key={seg.bandId ?? idx}
                title={`${seg.name} (${seg.code}): ${seg.intervalText}`}
              >
                <div
                  style={{
                    width: `${seg.percentageWidth}%`,
                    height: "100%",
                    backgroundColor: getSeverityBg(seg.severity),
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "0 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    borderRight: "1px solid rgba(255,255,255,0.3)",
                    transition: "opacity 0.2s",
                  }}
                >
                  {seg.code || seg.name}
                </div>
              </Tooltip>
            ))
          )}
        </div>

        {/* Overlap & Gap Warnings */}
        {hasOverlaps && (
          <Alert
            type="error"
            showIcon
            message="Overlapping Degree Classification Ranges"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {overlaps.map((o, idx) => (
                  <li key={idx}>
                    "{o.bandAName}" {o.rangeAText} overlaps with "{o.bandBName}" {o.rangeBText}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {hasGaps && segments.length > 0 && (
          <Alert
            type="warning"
            showIcon
            message="Unassigned CGPA Gaps Detected"
            description={
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Students with CGPAs in unassigned ranges ({gaps.map((g) => g.intervalText).join(", ")}) will be assigned <strong>"Unclassified"</strong> on broadsheets per strict policy evaluation rules.
              </Typography.Text>
            }
          />
        )}
      </Flex>
    </Card>
  );
}
