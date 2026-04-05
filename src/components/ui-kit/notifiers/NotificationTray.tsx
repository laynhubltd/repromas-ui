import { Card, Empty, Flex, List, Typography } from "antd";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { mergeUIKitStyles, type UIKitCommonProps } from "../foundation";
import { NotificationItem } from "./NotificationItem";
import type { NotificationRecord, NotificationTrayMode } from "./types";

interface NotificationGroup {
  key: string;
  label: ReactNode;
  notifications: NotificationRecord[];
}

function groupNotifications(notifications: NotificationRecord[]): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  for (const notification of notifications) {
    const groupKey = notification.groupKey ?? "general";
    const current = groups.get(groupKey);

    if (current) {
      current.notifications.push(notification);
      continue;
    }

    groups.set(groupKey, {
      key: groupKey,
      label: notification.groupLabel ?? "General",
      notifications: [notification],
    });
  }

  return [...groups.values()];
}

export interface NotificationTrayProps extends Omit<UIKitCommonProps, "tabIndex"> {
  notifications: NotificationRecord[];
  mode?: NotificationTrayMode;
  title?: ReactNode;
  ariaLabel?: string;
  maxHeight?: number;
  autoFocusFirst?: boolean;
  emptyState?: ReactNode;
}

export function NotificationTray({
  notifications,
  mode = "flat",
  title,
  ariaLabel = "Notifications",
  maxHeight,
  autoFocusFirst = false,
  emptyState,
  className,
  style,
  "data-testid": dataTestId,
}: NotificationTrayProps) {
  const orderedIds = useMemo(() => notifications.map((notification) => notification.id), [notifications]);
  const groupedNotifications = useMemo(
    () => (mode === "grouped" ? groupNotifications(notifications) : []),
    [mode, notifications],
  );
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const moveFocus = (currentId: string, direction: "previous" | "next") => {
    const currentIndex = orderedIds.indexOf(currentId);

    if (currentIndex < 0 || orderedIds.length === 0) {
      return;
    }

    const delta = direction === "next" ? 1 : -1;
    const nextIndex = (currentIndex + delta + orderedIds.length) % orderedIds.length;
    const nextId = orderedIds[nextIndex];

    if (!nextId) {
      return;
    }

    itemRefs.current.get(nextId)?.focus();
  };

  useEffect(() => {
    if (!autoFocusFirst || orderedIds.length === 0) {
      return;
    }

    const firstId = orderedIds[0];
    if (!firstId) {
      return;
    }
    itemRefs.current.get(firstId)?.focus();
  }, [autoFocusFirst, orderedIds]);

  const registerItemRef = (id: string) => (node: HTMLDivElement | null) => {
    if (node) {
      itemRefs.current.set(id, node);
      return;
    }
    itemRefs.current.delete(id);
  };

  const renderNotification = (notification: NotificationRecord) => (
    <List.Item key={notification.id}>
      <NotificationItem
        ref={registerItemRef(notification.id)}
        id={notification.id}
        severity={notification.severity}
        title={notification.title}
        body={notification.body}
        icon={notification.icon}
        timestamp={notification.timestamp}
        action={notification.action}
        dismissible={notification.dismissible}
        dismissLabel={notification.dismissLabel}
        onDismiss={notification.onDismiss}
        onArrowNavigate={(direction) => moveFocus(notification.id, direction)}
        focusable
      />
    </List.Item>
  );

  return (
    <Card
      size="small"
      role="region"
      aria-label={ariaLabel}
      className={className}
      data-testid={dataTestId}
      style={mergeUIKitStyles({ borderRadius: 12 }, style)}
      styles={{
        body: mergeUIKitStyles({
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight,
          overflowY: maxHeight ? "auto" : undefined,
        }),
      }}
    >
      {title ? <Typography.Text strong>{title}</Typography.Text> : null}
      {notifications.length === 0 ? (
        <Empty description={emptyState ?? "No notifications"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : null}
      {notifications.length > 0 && mode === "flat" ? (
        <List
          split={false}
          className="ui-kit-notification-tray-list"
          dataSource={notifications}
          renderItem={renderNotification}
        />
      ) : null}
      {notifications.length > 0 && mode === "grouped" ? (
        <Flex vertical gap={12}>
          {groupedNotifications.map((group) => (
            <section key={group.key} aria-label={`Notification group: ${group.key}`}>
              <Typography.Text strong className="ui-kit-notification-tray-group-title">
                {group.label}
              </Typography.Text>
              <List
                split={false}
                className="ui-kit-notification-tray-list"
                dataSource={group.notifications}
                renderItem={renderNotification}
              />
            </section>
          ))}
        </Flex>
      ) : null}
    </Card>
  );
}
