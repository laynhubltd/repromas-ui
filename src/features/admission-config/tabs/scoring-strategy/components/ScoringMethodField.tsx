import { SCREENING_METHOD_OPTIONS_BY_LANE } from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Select } from "antd";
import type { LaneProfile, ScreeningMethod } from "../types/scoring-strategy";

type ScoringMethodFieldProps = {
  laneProfile?: LaneProfile;
  value?: ScreeningMethod;
  onChange?: (method: ScreeningMethod) => void;
  onMethodChange?: (method: ScreeningMethod) => void;
  disabled?: boolean;
};

export function ScoringMethodField({
  laneProfile = "UTME_JAMB",
  value,
  onChange,
  onMethodChange,
  disabled = false,
}: ScoringMethodFieldProps) {
  const token = useToken();
  const options = SCREENING_METHOD_OPTIONS_BY_LANE[laneProfile] ?? [];

  const handleChange = (method: ScreeningMethod) => {
    onMethodChange?.(method);
    onChange?.(method);
  };

  return (
    <Select
      placeholder="Select screening method"
      style={{ height: 40 }}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      options={options.map((option) => ({
        value: option.value,
        label: (
          <div>
            <div style={{ fontWeight: 500 }}>{option.label}</div>
            <div
              style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary,
              }}
            >
              {option.description}
            </div>
          </div>
        ),
      }))}
    />
  );
}
