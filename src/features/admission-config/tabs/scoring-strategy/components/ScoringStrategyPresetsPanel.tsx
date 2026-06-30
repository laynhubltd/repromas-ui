import { PrimarySegmented } from "@/components/ui-kit";
import {
  LANE_PROFILE_OPTIONS,
  SCORING_STRATEGY_PRESET_CATALOG,
  type StrategyPresetKey,
} from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Flex, Grid, Typography } from "antd";
import { useMemo } from "react";
import type { LaneProfile, StrategyPayload } from "../types/scoring-strategy";
import { matchStrategyPresetKey } from "../utils/matchStrategyPresetKey";

type ScoringStrategyPresetsPanelProps = {
  laneProfile?: LaneProfile;
  strategy?: Partial<StrategyPayload>;
  onPreset: (presetKey: StrategyPresetKey) => void;
  onLaneChange: (laneProfile: LaneProfile) => void;
  disabled?: boolean;
};

export function ScoringStrategyPresetsPanel({
  laneProfile = "UTME_JAMB",
  strategy,
  onPreset,
  onLaneChange,
  disabled = false,
}: ScoringStrategyPresetsPanelProps) {
  const token = useToken();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.sm;

  const activePresetKey = matchStrategyPresetKey(strategy);
  const activeLane =
    SCORING_STRATEGY_PRESET_CATALOG.find((item) => item.key === activePresetKey)
      ?.lane ?? laneProfile;

  const visibleLane = activePresetKey ? activeLane : laneProfile;

  const visiblePresets = useMemo(
    () =>
      SCORING_STRATEGY_PRESET_CATALOG.filter((item) => item.lane === visibleLane),
    [visibleLane],
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <Flex align="center" justify="space-between" gap={8} wrap="wrap">
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Shortcuts
        </Typography.Text>
        <PrimarySegmented
          size="small"
          value={visibleLane}
          disabled={disabled}
          options={LANE_PROFILE_OPTIONS}
          onChange={(value) => onLaneChange(value as LaneProfile)}
        />
      </Flex>

      <Flex gap={8} wrap="wrap" style={{ marginTop: 10 }}>
        {visiblePresets.map((preset) => {
          const selected = activePresetKey === preset.key;
          return (
            <Button
              key={preset.key}
              type={selected ? "primary" : "default"}
              size="middle"
              disabled={disabled}
              title={`${preset.description} (${preset.splitLabel})`}
              onClick={() => onPreset(preset.key)}
              style={{
                flex: isCompact ? "1 1 100%" : "1 1 auto",
                minWidth: isCompact ? undefined : 140,
                height: 36,
                fontWeight: selected ? 600 : 400,
              }}
            >
              {preset.title}
            </Button>
          );
        })}
      </Flex>
    </div>
  );
}
