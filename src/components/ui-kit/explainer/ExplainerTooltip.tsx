/**
 * ExplainerTooltip
 *
 * Wraps any trigger element and shows a rich tooltip on hover/focus.
 * Unlike a plain Ant Tooltip, it supports a title + body + optional action link,
 * and colour-codes by intent.
 *
 * Usage:
 *   <ExplainerTooltip title="What is a scope?" body="Scope controls...">
 *     <QuestionCircleOutlined />
 *   </ExplainerTooltip>
 */
import type { TooltipProps } from "antd";
import { Flex, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import type { UIKitCommonProps } from "../foundation";
import { getIntentIcon } from "./ExplainerIcon";
import { INTENT_META } from "./shared";
import type { ExplainerIntent } from "./types";

export interface ExplainerTooltipProps
  extends Omit<TooltipProps, "title" | "color" | "children"> {
  intent?: ExplainerIntent;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  /** The element that triggers the tooltip. */
  children: ReactNode;
  /** Max width of the tooltip overlay in px. */
  maxWidth?: number;
  className?: UIKitCommonProps["className"];
  style?: UIKitCommonProps["style"];
  "data-testid"?: string;
}

export function ExplainerTooltip({
  intent = "info",
  title,
  body,
  action,
  children,
  maxWidth = 280,
  placement = "top",
  ...rest
}: ExplainerTooltipProps) {
  const meta = INTENT_META[intent];

  const overlay = (
    <Flex vertical gap={4} style={{ maxWidth, padding: "2px 0" }}>
      <Flex align="center" gap={6}>
        <span style={{ fontSize: 14, opacity: 0.9 }}>{getIntentIcon(intent)}</span>
        {typeof title === "string" ? (
          <Typography.Text strong style={{ color: "#fff", fontSize: 13 }}>{title}</Typography.Text>
        ) : (
          title
        )}
      </Flex>
      {body ? (
        typeof body === "string" ? (
          <Typography.Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{body}</Typography.Text>
        ) : (
          body
        )
      ) : null}
      {action ? <div style={{ marginTop: 4 }}>{action}</div> : null}
    </Flex>
  );

  return (
    <Tooltip
      {...rest}
      title={overlay}
      color={meta.color}
      placement={placement}
      arrow={{ pointAtCenter: true }}
    >
      {/* Tooltip requires a single DOM child */}
      <span style={{ cursor: "help", display: "inline-flex", alignItems: "center" }}>
        {children}
      </span>
    </Tooltip>
  );
}
