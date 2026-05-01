// Feature: grading-config
import { useToken } from "@/shared/hooks/useToken";
import { Tooltip } from "antd";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";
import { buildCoverageSegments } from "../utils/overlapDetection";

type ScoreCoverageIndicatorProps = {
  boundaries: GradingSystemBoundary[];
};

export function ScoreCoverageIndicator({
  boundaries,
}: ScoreCoverageIndicatorProps) {
  const token = useToken();
  const segments = buildCoverageSegments(boundaries);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: 16,
        borderRadius: token.borderRadius,
        overflow: "hidden",
      }}
    >
      {segments.map((seg, idx) => {
        const widthPct = seg.end - seg.start;
        const isCovered = seg.covered;
        const bgColor = isCovered
          ? token.colorPrimary
          : token.colorBorderSecondary;

        const tooltipTitle = isCovered
          ? undefined
          : boundaries.length === 0
            ? "No boundaries defined yet."
            : `Gap: ${seg.start.toFixed(2)}–${seg.end.toFixed(2)} not covered`;

        const segment = (
          <div
            key={idx}
            style={{
              width: `${widthPct}%`,
              height: "100%",
              background: bgColor,
              borderRadius:
                idx === 0 && segments.length === 1
                  ? token.borderRadius
                  : idx === 0
                    ? `${token.borderRadius}px 0 0 ${token.borderRadius}px`
                    : idx === segments.length - 1
                      ? `0 ${token.borderRadius}px ${token.borderRadius}px 0`
                      : 0,
            }}
          />
        );

        if (!isCovered && tooltipTitle) {
          return (
            <Tooltip key={idx} title={tooltipTitle}>
              {segment}
            </Tooltip>
          );
        }

        return segment;
      })}
    </div>
  );
}
