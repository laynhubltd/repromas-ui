import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { forwardRef, type AriaRole, type ReactNode } from "react";
import { mergeUIKitStyles, type UIKitCommonProps } from "../foundation";
import { InlineStatus } from "./InlineStatus";
import type { NotifierSeverity } from "./types";

type ArrowNavigationDirection = "previous" | "next";

function buildClassName(...tokens: Array<string | undefined>): string | undefined {
  const merged = tokens.filter((token): token is string => Boolean(token)).join(" ");
  return merged.length > 0 ? merged : undefined;
}

export interface NotificationItemProps extends UIKitCommonProps {
  id: string;
  severity?: NotifierSeverity;
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  timestamp?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  dismissLabel?: ReactNode;
  onDismiss?: (id: string) => void;
  statusRole?: AriaRole;
  liveMode?: "off" | "polite" | "assertive";
  itemRole?: AriaRole;
  onArrowNavigate?: (direction: ArrowNavigationDirection) => void;
  focusable?: boolean;
}

export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  function NotificationItem(
    {
      id,
      severity = "info",
      title,
      body,
      icon,
      timestamp,
      action,
      dismissible = false,
      dismissLabel = "Dismiss",
      onDismiss,
      statusRole,
      liveMode,
      itemRole = "article",
      onArrowNavigate,
      focusable = false,
      className,
      style,
      tabIndex,
      "data-testid": dataTestId,
      ...rest
    },
    ref,
  ) {
    const actionSlot =
      action || dismissible ? (
        <Flex align="center" gap={8} wrap>
          {action}
          {dismissible ? (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              aria-label={typeof dismissLabel === "string" ? dismissLabel : "Dismiss notification"}
              onClick={() => onDismiss?.(id)}
            >
              {dismissLabel}
            </Button>
          ) : null}
        </Flex>
      ) : undefined;

    return (
      <div
        ref={ref}
        role={itemRole}
        tabIndex={focusable ? (tabIndex ?? 0) : tabIndex}
        className={buildClassName(className, focusable ? "ui-kit-notifier-focusable" : undefined)}
        style={mergeUIKitStyles({ borderRadius: 12 }, style)}
        data-testid={dataTestId ?? `notification-item-${id}`}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onArrowNavigate?.("next");
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            onArrowNavigate?.("previous");
          }
        }}
      >
        <InlineStatus
          {...rest}
          severity={severity}
          title={title}
          body={body}
          icon={icon}
          timestamp={timestamp}
          action={actionSlot}
          role={statusRole}
          liveMode={liveMode}
          style={{ marginBottom: 0 }}
        />
      </div>
    );
  },
);
