import type { RouteMenuItem } from "@/app/routing/route-menu-config";
import { appPaths } from "@/app/routing/app-path";
import {
  SETUP_STEP_LABELS,
  SETUP_STEP_TOOLTIP_BLOCKED,
} from "@/shared/constants/setupChecklistOptions";
import { Tooltip } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo, type ReactNode } from "react";
import type { SetupStepId } from "../types/setup";
import { useSetupStatus } from "./useSetupStatus";

function wrapLabelWithTooltip(
  label: ReactNode,
  tooltip: string,
  isCurrentStep: boolean,
): ReactNode {
  const content = (
    <span
      className={isCurrentStep ? "setup-menu-item-current" : undefined}
      data-setup-current={isCurrentStep ? "true" : undefined}
    >
      {label}
    </span>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <Tooltip title={tooltip} placement="right">
      {content}
    </Tooltip>
  );
}

export function useSetupGatedMenuItems(items: RouteMenuItem[]): ItemType[] {
  const { state, actions, flags } = useSetupStatus();

  return useMemo(() => {
    if (!flags.shouldGateMenus) {
      return items;
    }

    return items.map((item) => {
      if (!item || typeof item !== "object" || !("key" in item)) {
        return item;
      }

      const key = String(item.key);

      if (key === appPaths.dashboard) {
        return item;
      }

      const setupStepId = item.setupStepId as SetupStepId | undefined;

      if (!setupStepId) {
        return item;
      }

      let accessible = actions.canAccess(setupStepId);

      if (setupStepId === "settings") {
        accessible = actions.canAccess("settings");
      }

      const isCurrentStep = state.evaluation.currentStepId === setupStepId;
      const stepLabel = SETUP_STEP_LABELS[setupStepId];
      const blockedTooltip = accessible
        ? isCurrentStep
          ? `Next: ${stepLabel}`
          : ""
        : SETUP_STEP_TOOLTIP_BLOCKED[setupStepId];

      const itemLabel = "label" in item ? item.label : null;

      if (accessible) {
        return {
          ...item,
          disabled: false,
          label: wrapLabelWithTooltip(itemLabel, blockedTooltip, isCurrentStep),
        };
      }

      return {
        ...item,
        disabled: true,
        label: wrapLabelWithTooltip(itemLabel, blockedTooltip, false),
      };
    });
  }, [items, state.evaluation, actions, flags.shouldGateMenus]);
}
