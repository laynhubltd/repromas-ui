import type { DropdownProps, MenuProps } from "antd";
import { Dropdown } from "antd";
import type { ReactNode } from "react";
import {
  type PermittedMenuItem,
  usePermittedMenuItems,
} from "./permitted-menu";

export type PermittedDropdownProps = Omit<DropdownProps, "menu"> & {
  /** Menu items with optional `permission` requirements. */
  items: PermittedMenuItem[];
  /** Additional Ant Design MenuProps (e.g. onClick, selectable, selectedKeys). */
  menu?: Omit<MenuProps, "items">;
  /**
   * If true (default), hides the dropdown trigger entirely when 0 items are permitted.
   * If false, renders the trigger with `emptyFallback` or an empty menu.
   */
  hideIfEmpty?: boolean;
  /** Custom node rendered instead of children when 0 items survive permission filtering. */
  emptyFallback?: ReactNode;
};

/**
 * Ant Design Dropdown adapter with automatic RBAC item filtering and empty-trigger suppression.
 *
 * Prevents phantom menu items (empty text with active icons/listeners) and hides
 * dangling `···` action buttons when the user lacks permissions for all actions in the menu.
 */
export function PermittedDropdown({
  items,
  menu,
  hideIfEmpty = true,
  emptyFallback = null,
  children,
  ...dropdownProps
}: PermittedDropdownProps) {
  const permittedItems = usePermittedMenuItems(items);

  if (permittedItems.length === 0) {
    if (hideIfEmpty) {
      return <>{emptyFallback}</>;
    }
  }

  return (
    <Dropdown
      {...dropdownProps}
      menu={{
        ...menu,
        items: permittedItems,
      }}
    >
      {children}
    </Dropdown>
  );
}
