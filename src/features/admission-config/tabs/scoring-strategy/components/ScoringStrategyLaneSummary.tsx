import { getLaneProfileLabel, LANE_TAG_COLORS } from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Tag, Typography } from "antd";
import type { LaneProfile } from "../types/scoring-strategy";

type ScoringStrategyLaneSummaryProps = {
  laneProfile?: LaneProfile;
  requiresJamb?: boolean;
};

export function ScoringStrategyLaneSummary({
  laneProfile,
  requiresJamb,
}: ScoringStrategyLaneSummaryProps) {
  const token = useToken();

  if (!laneProfile) {
    return null;
  }

  const laneLabel = getLaneProfileLabel(laneProfile);

  let jambCopy = "Direct Entry — no JAMB";
  if (laneProfile === "UTME_JAMB") {
    jambCopy = "JAMB required";
  } else if (laneProfile === "UTME_OPEN") {
    jambCopy =
      requiresJamb === true
        ? "JAMB required for scoring"
        : "JAMB optional — renormalizes when missing";
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {jambCopy}{" "}
        <Tag
          color={LANE_TAG_COLORS[laneProfile]}
          style={{ marginInlineStart: 4 }}
        >
          {laneLabel}
        </Tag>
      </Typography.Text>
    </div>
  );
}
