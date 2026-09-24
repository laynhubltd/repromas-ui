import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import type { PermissionRequirement } from "./types";
import { useAccessControl } from "./use-access-control";

export type PermittedMenuItem =
  | (Exclude<ItemType, null | undefined> & {
      permission?: PermissionRequirement;
      children?: PermittedMenuItem[];
    })
  | null
  | undefined;

/**
 * Sanitizes divider items from an array of menu items:
 * - Drops leading dividers
 * - Drops trailing dividers
 * - Collapses consecutive duplicate dividers into a single divider
 */
function sanitizeDividers<T extends ItemType>(items: T[]): T[] {
  const result: T[] = [];

  for (const item of items) {
    const isDivider = item !== null && typeof item === "object" && item.type === "divider";

    if (isDivider) {
      // Don't add leading divider or duplicate consecutive divider
      if (result.length === 0) continue;
      const last = result[result.length - 1];
      if (last !== null && typeof last === "object" && last.type === "divider") {
        continue;
      }
    }
    result.push(item);
  }

  // Remove trailing divider
  while (result.length > 0) {
    const last = result[result.length - 1];
    if (last !== null && typeof last === "object" && "type" in last && last.type === "divider") {
      result.pop();
    } else {
      break;
    }
  }

  return result;
}

/**
 * Headless pure filtering engine for Ant Design menu items.
 *
 * Drops unauthorized items, recurses into sub-menus, removes empty sub-menus,
 * and sanitizes dividers.
 *
 * @param items List of PermittedMenuItem definitions.
 * @param isAllowed Predicate determining if a requirement is satisfied.
 * @returns Clean, permitted ItemType array ready for Ant Design Menu or Dropdown.
 */
export function filterPermittedMenuItems(
  items: PermittedMenuItem[] | undefined | null,
  isAllowed: (requirement?: PermissionRequirement) => boolean,
): ItemType[] {
  if (!items || items.length === 0) return [];

  const filtered: ItemType[] = [];

  for (const item of items) {
    if (!item) continue;

    // Check divider or group item without explicit permission
    if (item.type === "divider") {
      filtered.push(item as ItemType);
      continue;
    }

    // Check item permission
    if (item.permission && !isAllowed(item.permission)) {
      continue;
    }

    // Check recursive children if present
    if ("children" in item && Array.isArray(item.children)) {
      const permittedChildren = filterPermittedMenuItems(
        item.children,
        isAllowed,
      );
      // If a submenu had children but none survived permission filtering, omit the submenu
      if (item.children.length > 0 && permittedChildren.length === 0) {
        continue;
      }
      filtered.push({
        ...item,
        children: permittedChildren,
      } as ItemType);
      continue;
    }

    filtered.push(item as ItemType);
  }

  return sanitizeDividers(filtered);
}

/**
 * React hook binding for filtering menu items using the active user's permissions.
 */
export function usePermittedMenuItems(
  items: PermittedMenuItem[] | undefined | null,
): ItemType[] {
  const { isPermitted } = useAccessControl();

  return useMemo(
    () => filterPermittedMenuItems(items, isPermitted),
    [items, isPermitted],
  );
}
