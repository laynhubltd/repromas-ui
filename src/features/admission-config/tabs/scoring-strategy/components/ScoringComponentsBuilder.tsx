import { useIsMobile } from "@/hooks/useBreakpoint";
import { getComponentTypeLabel } from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Flex, InputNumber, Typography } from "antd";
import type { ScoringComponent, ScreeningMethod } from "../types/scoring-strategy";
import { requiredComponentTypes } from "../utils/scoringStrategyDisplay";

type ScoringComponentsBuilderProps = {
  method: ScreeningMethod;
  value?: ScoringComponent[];
  onChange?: (value: ScoringComponent[]) => void;
  disabled?: boolean;
};

export function ScoringComponentsBuilder({
  method,
  value = [],
  onChange,
  disabled = false,
}: ScoringComponentsBuilderProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const expectedTypes = requiredComponentTypes(method);

  const components = expectedTypes.map((type) => {
    const existing = value.find((component) => component.type === type);
    return existing ?? { type, weight_percentage: 0 };
  });

  const total = components.reduce(
    (sum, component) => sum + (component.weight_percentage || 0),
    0,
  );
  const isValidTotal = total === 100;

  const handleWeightChange = (type: ScoringComponent["type"], weight: number | null) => {
    const next = components.map((component) =>
      component.type === type
        ? { ...component, weight_percentage: weight ?? 0 }
        : component,
    );
    onChange?.(next);
  };

  return (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        Set how the school-side score is split between components.
      </Typography.Text>

      {components.map((component) => (
        <Flex
          key={component.type}
          vertical={isMobile}
          align={isMobile ? "stretch" : "center"}
          gap={12}
          justify="space-between"
        >
          <Typography.Text strong style={{ minWidth: 160 }}>
            {getComponentTypeLabel(component.type)}
          </Typography.Text>
          <InputNumber
            min={0}
            max={100}
            disabled={disabled}
            value={component.weight_percentage}
            onChange={(weight) => handleWeightChange(component.type, weight)}
            addonAfter="%"
            style={{ width: isMobile ? "100%" : 160, height: 40 }}
          />
        </Flex>
      ))}

      <Typography.Text
        style={{
          color: isValidTotal ? token.colorSuccess : token.colorError,
          fontWeight: 600,
        }}
      >
        Total: {total}%
      </Typography.Text>
    </Flex>
  );
}
