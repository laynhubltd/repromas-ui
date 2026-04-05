import type { TabsProps as AntTabsProps } from "antd";
import { Tabs as AntTabs, Result, Spin, theme } from "antd";
import { isValidElement, type CSSProperties, type ReactNode } from "react";
import { mergeUIKitStyles, toAntdSize, toSpacingUnit, type UIKitCommonProps, type UIKitVariantProps } from "../foundation";
import { TabLabel } from "./TabLabel";
import "./tabs.css";

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  badge?: number | "dot";
  disabled?: boolean;
  closable?: boolean;
}

export interface TabsProps
  extends Omit<UIKitCommonProps, "role" | "tabIndex">,
    Pick<UIKitVariantProps, "size" | "density" | "variant" | "state"> {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  tabPosition?: "top" | "bottom" | "left" | "right";
  extra?: ReactNode | { left?: ReactNode; right?: ReactNode };
  addable?: boolean;
  onAdd?: () => void;
  onClose?: (key: string) => void;
}

export type AntdTabsType = "line" | "card" | "editable-card";

/**
 * Maps ui-kit variant + addable/closable flags to the correct AntD Tabs `type`.
 * Exported for isolated property-based testing.
 */
export function resolveAntdTabsType(
  variant: TabsProps["variant"] = "default",
  addable: boolean = false,
  hasClosable: boolean = false,
): AntdTabsType {
  if (addable || hasClosable) return "editable-card";
  if (variant === "filled" || variant === "outlined") return "card";
  return "line"; // "default" and "ghost" both use line; ghost is differentiated by CSS
}

/**
 * Maps the `extra` prop to the shape expected by AntD Tabs `tabBarExtraContent`.
 * - falsy → undefined
 * - plain ReactNode (string, element, array, etc.) → passed as-is (renders at trailing end)
 * - `{ left?, right? }` object → passed as-is for AntD to split into both slots
 */
export function resolveTabBarExtraContent(
  extra: TabsProps["extra"],
): AntTabsProps["tabBarExtraContent"] {
  if (!extra) return undefined;
  // A plain object that is NOT a React element is treated as { left?, right? }
  if (typeof extra === "object" && !isValidElement(extra) && !Array.isArray(extra)) {
    return extra as { left?: ReactNode; right?: ReactNode };
  }
  return extra as ReactNode;
}

export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  tabPosition,
  extra,
  addable = false,
  onAdd,
  onClose,
  size,
  density,
  variant = "default",
  state = "default",
  className,
  style,
  "data-testid": dataTestId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: TabsProps): ReactNode {
  const { token } = theme.useToken();

  const hasClosable = items.some((item) => item.closable);
  const antdType = resolveAntdTabsType(variant, addable, hasClosable);

  // Requirement 1.4: when neither activeKey nor defaultActiveKey is provided,
  // fall back to the first non-disabled item's key.
  const resolvedDefaultActiveKey =
    activeKey === undefined && defaultActiveKey === undefined && state !== "disabled"
      ? items.find((item) => !item.disabled)?.key
      : defaultActiveKey;

  // Ghost variant CSS custom properties
  const ghostStyle: CSSProperties =
    variant === "ghost"
      ? ({
          "--tabs-ghost-bg": token.colorFillTertiary,
          "--tabs-ghost-active-bg": token.colorBgContainer,
        } as CSSProperties)
      : {};

  // State overlay for loading/error
  const stateOverlay: ReactNode | null =
    state === "loading" ? (
      <Spin size="large" style={{ display: "flex", justifyContent: "center", padding: 32 }} />
    ) : state === "error" ? (
      <Result status="error" title="Something went wrong" />
    ) : null;

  // Map TabItems to AntD items format
  const resolvedItems = items.map((item) => {
    const resolvedDisabled = item.disabled || state === "disabled";
    return {
      key: item.key,
      label: (
        <TabLabel
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          size={size}
          disabled={resolvedDisabled}
        />
      ),
      children: stateOverlay ?? item.children,
      disabled: resolvedDisabled,
      closable: item.closable,
    };
  });

  return (
    <AntTabs
      className={`${variant === "ghost" ? "ui-kit-tabs--ghost" : ""}${className ? ` ${className}` : ""}`}
      style={mergeUIKitStyles(ghostStyle, style)}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      type={antdType}
      items={resolvedItems}
      size={toAntdSize(size ?? "md")}
      tabBarGutter={toSpacingUnit(density ?? "comfortable")}
      tabPosition={tabPosition}
      activeKey={activeKey}
      defaultActiveKey={resolvedDefaultActiveKey}
      onChange={onChange}
      tabBarExtraContent={resolveTabBarExtraContent(extra)}
      onEdit={(key, action) => {
        if (action === "remove") onClose?.(key as string);
        if (action === "add") onAdd?.();
      }}
    />
  );
}
