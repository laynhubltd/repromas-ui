import { Collapse, Flex, Grid, Typography, theme } from "antd";
import type { CollapseProps } from "antd";
import type { Key, ReactNode } from "react";
import {
  isInteractiveStateDisabled,
  mergeUIKitStyles,
  toAntdSize,
  type UIKitComponentProps,
} from "../foundation";
import { getResponsiveSpacing, getSurfaceStateStyle, getSurfaceVariantStyle } from "./shared";

export type AccordionExpansionMode = "single" | "multiple";

export interface AccordionItem {
  key: string;
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  forceRender?: boolean;
}

export interface AccordionProps
  extends Omit<
      CollapseProps,
      "accordion" | "items" | "activeKey" | "defaultActiveKey" | "onChange" | "size" | "children"
    >,
    Omit<UIKitComponentProps, "role" | "tabIndex"> {
  items: AccordionItem[];
  expansionMode?: AccordionExpansionMode;
  activeKeys?: string[];
  defaultActiveKeys?: string[];
  onActiveKeysChange?: (keys: string[]) => void;
  onChange?: CollapseProps["onChange"];
}

function toKeyArray(next: Key | Key[] | undefined): string[] {
  if (Array.isArray(next)) {
    return next.map((entry) => String(entry));
  }
  if (typeof next === "string" || typeof next === "number") {
    return [String(next)];
  }
  return [];
}

export function Accordion({
  items,
  expansionMode = "single",
  activeKeys,
  defaultActiveKeys,
  onActiveKeysChange,
  onChange,
  size = "md",
  density = "comfortable",
  variant = "default",
  state = "default",
  className,
  style,
  ...rest
}: AccordionProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const spacing = getResponsiveSpacing(density, screens);
  const singleExpansion = expansionMode === "single";
  const isNonInteractive = isInteractiveStateDisabled(state) || state === "loading";
  const hasControlledKeys = activeKeys !== undefined;
  const hasDefaultKeys = defaultActiveKeys !== undefined;

  return (
    <Collapse
      {...rest}
      className={className}
      size={toAntdSize(size)}
      accordion={singleExpansion}
      activeKey={hasControlledKeys ? (singleExpansion ? activeKeys[0] : activeKeys) : undefined}
      defaultActiveKey={
        hasDefaultKeys ? (singleExpansion ? defaultActiveKeys[0] : defaultActiveKeys) : undefined
      }
      onChange={(next) => {
        onChange?.(next);
        onActiveKeysChange?.(toKeyArray(next));
      }}
      items={items.map((item) => ({
        key: item.key,
        label: (
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            {typeof item.title === "string" ? (
              <Typography.Text strong>{item.title}</Typography.Text>
            ) : (
              item.title
            )}
            {item.subtitle ? (
              typeof item.subtitle === "string" ? (
                <Typography.Text type="secondary">{item.subtitle}</Typography.Text>
              ) : (
                item.subtitle
              )
            ) : null}
          </Flex>
        ),
        extra: item.extra,
        children: item.content,
        forceRender: item.forceRender,
        collapsible: isNonInteractive || item.disabled ? "disabled" : undefined,
      }))}
      style={mergeUIKitStyles(
        {
          borderRadius: token.borderRadiusLG,
          overflow: "hidden",
          border: variant === "ghost" ? "none" : `1px solid ${token.colorBorderSecondary}`,
          paddingInline: 2,
          paddingBlock: 2,
        },
        getSurfaceVariantStyle(token, variant),
        getSurfaceStateStyle(state),
        style,
      )}
      styles={{
        header: {
          paddingInline: spacing,
          paddingBlock: spacing * 0.75,
        },
        body: {
          paddingInline: spacing,
          paddingBlock: spacing,
        },
      }}
    />
  );
}
