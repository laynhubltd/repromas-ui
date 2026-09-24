import type {
  ConfigTabGroupDefinition,
} from "@/components/ui-kit/config-tabs/types";
import { useMemo } from "react";
import type { PermissionRequirement } from "./types";
import { useAccessControl } from "./use-access-control";

/**
 * Headless pure filtering engine for grouped configuration tabs.
 *
 * - Drops individual tabs lacking the required permission.
 * - Drops entire groups if the group itself is unauthorized or all its tabs were filtered out.
 *
 * @param groups List of ConfigTabGroupDefinition objects.
 * @param isAllowed Predicate determining if a requirement is satisfied.
 * @returns Clean ConfigTabGroupDefinition array with non-empty groups.
 */
export function filterPermittedGroups(
  groups: ConfigTabGroupDefinition[] | undefined | null,
  isAllowed: (requirement?: PermissionRequirement) => boolean,
): ConfigTabGroupDefinition[] {
  if (!groups || groups.length === 0) return [];

  const permittedGroups: ConfigTabGroupDefinition[] = [];

  for (const group of groups) {
    // Check group-level permission
    if (group.permission && !isAllowed(group.permission)) {
      continue;
    }

    // Filter tabs within the group
    const permittedTabs = (group.tabs ?? []).filter(
      (tab) => !tab.permission || isAllowed(tab.permission),
    );

    // Only include group if it has at least one permitted tab
    if (permittedTabs.length > 0) {
      permittedGroups.push({
        ...group,
        tabs: permittedTabs,
      });
    }
  }

  return permittedGroups;
}

/**
 * Headless pure filtering engine for flat tab definitions.
 */
export function filterPermittedTabs<T extends { permission?: PermissionRequirement }>(
  tabs: T[] | undefined | null,
  isAllowed: (requirement?: PermissionRequirement) => boolean,
): T[] {
  if (!tabs || tabs.length === 0) return [];
  return tabs.filter((tab) => !tab.permission || isAllowed(tab.permission));
}

/**
 * React hook binding for filtering grouped tabs using the active user's permissions.
 */
export function usePermittedGroups(
  groups: ConfigTabGroupDefinition[] | undefined | null,
): ConfigTabGroupDefinition[] {
  const { isPermitted } = useAccessControl();

  return useMemo(
    () => filterPermittedGroups(groups, isPermitted),
    [groups, isPermitted],
  );
}
