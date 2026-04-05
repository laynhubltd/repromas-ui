/**
 * ExplainerCallout
 *
 * An inline contextual help block. Use it directly below a form field,
 * section header, or any UI element that benefits from a short explanation.
 *
 * Variants:
 *   intent  — info | tip | warning | new | beta
 *   size    — sm | md | lg
 *   dismissible — shows a close button; fires onDismiss when clicked
 *   collapsible — shows a toggle to expand/collapse the body
 */
import { CloseOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useState, type ReactNode } from "react";
import { mergeUIKitStyles, type UIComponentSize, type UIKitCommonProps } from "../foundation";
import { getIntentIcon } from "./ExplainerIcon";
import { getCalloutStyle, INTENT_META } from "./shared";
import type { ExplainerIntent } from "./types";

export interface ExplainerCalloutProps extends UIKitCommonProps {
  intent?: ExplainerIntent;
  title: ReactNode;
  body?: ReactNode;
  size?: UIComponentSize;
  /** Show a dismiss (×) button. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Allow the body to be collapsed. */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Optional CTA rendered below the body. */
  action?: ReactNode;
}

export function ExplainerCallout({
  intent = "info",
  title,
  body,
  size = "md",
  dismissible = false,
  onDismiss,
  collapsible = false,
  defaultCollapsed = false,
  action,
  className,
  style,
  "data-testid": dataTestId,
}: ExplainerCalloutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const meta = INTENT_META[intent];
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  const titleLevel = size === "sm" ? 5 : size === "lg" ? 4 : 5;

  return (
    <div
      role="note"
      aria-label={typeof title === "string" ? title : undefined}
      className={className}
      data-testid={dataTestId}
      style={mergeUIKitStyles(getCalloutStyle(intent), style)}
    >
      <Flex justify="space-between" align="flex-start" gap={8}>
        {/* icon + title */}
        <Flex align="flex-start" gap={8} style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: meta.color, fontSize: iconSize, lineHeight: 1.6, flexShrink: 0 }}>
            {getIntentIcon(intent)}
          </span>
          <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
            {typeof title === "string" ? (
              <Typography.Title level={titleLevel} style={{ margin: 0, color: meta.color }}>
                {title}
              </Typography.Title>
            ) : (
              title
            )}

            {/* body */}
            {body && !collapsed ? (
              <div style={{ marginTop: 2 }}>
                {typeof body === "string" ? (
                  <Typography.Text style={{ fontSize: size === "sm" ? 12 : 14 }}>{body}</Typography.Text>
                ) : (
                  body
                )}
              </div>
            ) : null}

            {/* action */}
            {action && !collapsed ? (
              <div style={{ marginTop: 8 }}>{action}</div>
            ) : null}
          </Flex>
        </Flex>

        {/* controls */}
        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
          {collapsible && body ? (
            <Button
              type="text"
              size="small"
              icon={<DownOutlined rotate={collapsed ? 0 : 180} />}
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand explanation" : "Collapse explanation"}
              style={{ color: meta.color }}
            />
          ) : null}
          {dismissible ? (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onDismiss}
              aria-label="Dismiss"
              style={{ color: meta.color }}
            />
          ) : null}
        </Flex>
      </Flex>
    </div>
  );
}
