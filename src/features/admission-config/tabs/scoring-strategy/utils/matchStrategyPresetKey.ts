import type { StrategyPayload } from "../types/scoring-strategy";
import { STRATEGY_PRESETS, type StrategyPresetKey } from "@/shared/constants/scoringStrategyOptions";

function componentsMatch(
  left: StrategyPayload["components"],
  right: StrategyPayload["components"],
): boolean {
  if (!left?.length && !right?.length) return true;
  if (!left?.length || !right?.length) return false;
  if (left.length !== right.length) return false;

  return left.every((leftComponent) => {
    const rightComponent = right.find(
      (component) => component.type === leftComponent.type,
    );
    return (
      rightComponent?.weight_percentage === leftComponent.weight_percentage
    );
  });
}

export function matchStrategyPresetKey(
  strategy: Partial<StrategyPayload> | undefined,
): StrategyPresetKey | undefined {
  if (!strategy?.screening_method) return undefined;

  const entries = Object.entries(STRATEGY_PRESETS) as [
    StrategyPresetKey,
    StrategyPayload,
  ][];

  for (const [key, preset] of entries) {
    const matchesBase =
      preset.screening_method === strategy.screening_method &&
      preset.jamb_weight_percentage === strategy.jamb_weight_percentage &&
      preset.school_weight_percentage === strategy.school_weight_percentage &&
      preset.max_jamb_score === strategy.max_jamb_score &&
      preset.max_school_score === strategy.max_school_score &&
      preset.requires_jamb === strategy.requires_jamb;

    if (!matchesBase) continue;

    if (componentsMatch(preset.components, strategy.components)) {
      return key;
    }
  }

  return undefined;
}
