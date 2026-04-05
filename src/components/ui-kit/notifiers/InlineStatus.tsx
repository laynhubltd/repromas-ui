import { Alert, Flex, Typography } from "antd";
import type { AlertProps } from "antd";
import type { ReactNode } from "react";
import { mergeUIKitStyles, type UIKitCommonProps } from "../foundation";
import { getNotifierSeverityMeta } from "./shared";
import type { NotifierSeverity } from "./types";
import "./notifiers.css";

function buildClassName(...tokens: Array<string | undefined>): string | undefined {
  const merged = tokens.filter((token): token is string => Boolean(token)).join(" ");
  return merged.length > 0 ? merged : undefined;
}

export interface InlineStatusProps
  extends Omit<
      AlertProps,
      | "type"
      | "message"
      | "description"
      | "icon"
      | "showIcon"
      | "action"
      | "role"
      | "aria-live"
      | "tabIndex"
      | "children"
    >,
    UIKitCommonProps {
  severity?: NotifierSeverity;
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  timestamp?: ReactNode;
  action?: ReactNode;
  liveMode?: "off" | "polite" | "assertive";
  focusable?: boolean;
}

export function InlineStatus({
  severity = "info",
  title,
  body,
  icon,
  timestamp,
  action,
  liveMode,
  focusable = false,
  role,
  className,
  style,
  tabIndex,
  "data-testid": dataTestId,
  ...rest
}: InlineStatusProps) {
  const severityMeta = getNotifierSeverityMeta(severity);
  const hasDescription = Boolean(body || timestamp);
  const resolvedRole = role ?? severityMeta.role;

  return (
    <div
      tabIndex={focusable ? (tabIndex ?? 0) : tabIndex}
      className={buildClassName(className, focusable ? "ui-kit-notifier-focusable" : undefined)}
      data-testid={dataTestId}
      style={style}
    >
      <Alert
        {...rest}
        type={severityMeta.antdType}
        role={resolvedRole}
        aria-live={liveMode ?? severityMeta.liveMode}
        title={title}
        description={
          hasDescription ? (
            <Flex vertical gap={4}>
              {body ? <div>{body}</div> : null}
              {timestamp ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {timestamp}
                </Typography.Text>
              ) : null}
            </Flex>
          ) : undefined
        }
        action={action}
        showIcon
        icon={icon}
        style={mergeUIKitStyles({ borderRadius: 12 }, { marginBottom: 0 })}
      />
    </div>
  );
}
