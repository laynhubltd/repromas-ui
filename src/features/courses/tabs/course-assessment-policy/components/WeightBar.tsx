// Feature: course-assessment-policy
import { useToken } from "@/shared/hooks/useToken";
import type { CourseAssessmentComponent } from "../types/course-assessment-policy";
import { computeWeightState, computeWeightSum } from "../utils/weightBar";

type WeightBarProps = {
  components: CourseAssessmentComponent[];
  totalWeightPercentage: number;
};

/**
 * WeightBar — horizontal stacked bar visualising component weight distribution.
 *
 * Visual states:
 *   "complete"  — all segments use colorSuccess
 *   "partial"   — filled segments use colorPrimary; dashed remainder for unfilled portion
 *   "overflow"  — all segments use colorError
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 12.10
 */
export function WeightBar({
  components,
  totalWeightPercentage,
}: WeightBarProps) {
  const token = useToken();

  const sum = computeWeightSum(components);
  const state = computeWeightState(sum, totalWeightPercentage);

  // Determine segment colour based on state
  const segmentColor =
    state === "complete"
      ? token.colorSuccess
      : state === "overflow"
        ? token.colorError
        : token.colorPrimary;

  // Filled width as a percentage of the bar (capped at 100% for overflow display)
  const filledWidthPct = Math.min((sum / totalWeightPercentage) * 100, 100);

  // Remainder width (only relevant for "partial" state)
  const remainderWidthPct = 100 - filledWidthPct;

  return (
    <div>
      {/* Stacked bar */}
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: token.borderRadius,
          overflow: "hidden",
          background: token.colorBgLayout,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* Filled segments — outer div is sized to filledWidthPct of the bar */}
        {components.length > 0 && (
          <div
            style={{
              display: "flex",
              width: `${filledWidthPct}%`,
              height: "100%",
            }}
          >
            {components.map((component, index) => {
              const isLast = index === components.length - 1;
              // Each segment occupies its proportional share of the filled container.
              // sum > 0 is guaranteed here because components.length > 0.
              const segmentWidthPct = (component.weightPercentage / sum) * 100;
              return (
                <div
                  key={component.id}
                  title={`${component.code}: ${component.weightPercentage}%`}
                  style={{
                    width: `${segmentWidthPct}%`,
                    height: "100%",
                    background: segmentColor,
                    borderRight: !isLast
                      ? `1px solid ${token.colorBgContainer}`
                      : undefined,
                    minWidth: 1,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Dashed remainder region (partial state only) */}
        {state === "partial" && remainderWidthPct > 0 && (
          <div
            style={{
              width: `${remainderWidthPct}%`,
              height: "100%",
              backgroundImage: `repeating-linear-gradient(
                90deg,
                ${token.colorBorderSecondary} 0px,
                ${token.colorBorderSecondary} 4px,
                transparent 4px,
                transparent 8px
              )`,
            }}
          />
        )}
      </div>

      {/* Numeric label */}
      <div
        style={{
          marginTop: 4,
          fontSize: token.fontSizeSM,
          color:
            state === "complete"
              ? token.colorSuccess
              : state === "overflow"
                ? token.colorError
                : token.colorTextSecondary,
          fontWeight: state !== "partial" ? token.fontWeightStrong : undefined,
        }}
      >
        {sum} / {totalWeightPercentage}
      </div>
    </div>
  );
}
