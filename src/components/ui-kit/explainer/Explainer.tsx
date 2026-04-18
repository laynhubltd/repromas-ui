import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Flex, Typography, theme } from "antd";
import { useState, type ReactNode } from "react";
import {
  mergeUIKitStyles,
  toAntdSize,
  toSpacingUnit,
  type UIComponentDensity,
  type UIComponentSize,
  type UIKitCommonProps,
} from "../foundation";
import type { ExplainerActionLink, ExplainerMode, ExplainerVariant } from "./types";
import "./explainer.css";

function buildClassName(...tokens: Array<string | undefined>): string | undefined {
  const merged = tokens.filter((token): token is string => Boolean(token)).join(" ");
  return merged.length > 0 ? merged : undefined;
}

function renderTitleNode(title: ReactNode): ReactNode {
  if (typeof title === "string" || typeof title === "number") {
    return <Typography.Text strong>{title}</Typography.Text>;
  }
  return title;
}

function renderDescriptionNode(description: ReactNode): ReactNode {
  if (typeof description === "string" || typeof description === "number") {
    return <Typography.Text type="secondary">{description}</Typography.Text>;
  }
  return description;
}

function renderActionLink(actionLink?: ExplainerActionLink): ReactNode {
  if (!actionLink) {
    return undefined;
  }

  return (
    <Typography.Link
      href={actionLink.href}
      onClick={actionLink.onClick}
      target={actionLink.target}
      rel={actionLink.rel}
      aria-label={actionLink.ariaLabel}
      className="ui-kit-explainer__action-link"
    >
      {actionLink.label}
    </Typography.Link>
  );
}

/**
 * Use Explainer for instructional guidance and next-step education.
 * Use Notifiers for live or time-sensitive status feedback.
 */
export interface ExplainerProps extends Omit<UIKitCommonProps, "tabIndex"> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  actionLink?: ExplainerActionLink;
  variant?: ExplainerVariant;
  mode?: ExplainerMode;
  size?: UIComponentSize;
  density?: UIComponentDensity;
  dismissLabel?: ReactNode;
  onDismiss?: () => void;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  emptyImage?: ReactNode;
  liveMode?: "off" | "polite" | "assertive";
}

export function Explainer({
  title,
  description,
  icon,
  action,
  actionLink,
  variant = "inline",
  mode = "persistent",
  size = "md",
  density = "comfortable",
  dismissLabel = "Dismiss tip",
  onDismiss,
  visible,
  defaultVisible = true,
  onVisibleChange,
  emptyImage,
  liveMode = "polite",
  role,
  className,
  style,
  "data-testid": dataTestId,
}: ExplainerProps) {
  const { token } = theme.useToken();
  const spacing = toSpacingUnit(density);
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isControlled = typeof visible === "boolean";
  const isVisible = isControlled ? visible : internalVisible;
  const isDismissible = mode === "dismissible";
  const resolvedAction = action ?? renderActionLink(actionLink);

  const handleDismiss = () => {
    if (!isDismissible) {
      return;
    }

    if (!isControlled) {
      setInternalVisible(false);
    }

    onVisibleChange?.(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const actionSlot =
    resolvedAction || isDismissible ? (
      <Flex align="center" gap={8} wrap>
        {resolvedAction ? <div>{resolvedAction}</div> : null}
        {isDismissible ? (
          <Button
            type="text"
            size={toAntdSize(size)}
            icon={<CloseOutlined />}
            className="ui-kit-explainer__dismiss"
            aria-label={typeof dismissLabel === "string" ? dismissLabel : "Dismiss explainer guidance"}
            onClick={handleDismiss}
          >
            {dismissLabel}
          </Button>
        ) : null}
      </Flex>
    ) : undefined;

  if (variant === "panel") {
    return (
      <section
        role={role ?? "complementary"}
        aria-live={liveMode}
        className={buildClassName("ui-kit-explainer", "ui-kit-explainer--panel", className)}
        style={mergeUIKitStyles(
          {
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorFillAlter,
            padding: spacing,
            width: "100%",
          },
          style,
        )}
        data-testid={dataTestId}
      >
        <Flex align="flex-start" gap={spacing}>
          <div className="ui-kit-explainer__icon">{icon ?? <InfoCircleOutlined />}</div>
          <Flex vertical gap={Math.max(4, Math.round(spacing / 2))} style={{ minWidth: 0, flex: 1 }}>
            <div>{renderTitleNode(title)}</div>
            {description ? <div>{renderDescriptionNode(description)}</div> : null}
            {actionSlot ? <div>{actionSlot}</div> : null}
          </Flex>
        </Flex>
      </section>
    );
  }

  if (variant === "empty-state") {
    return (
      <section
        role={role ?? "status"}
        aria-live={liveMode}
        className={buildClassName("ui-kit-explainer", "ui-kit-explainer--empty-state", className)}
        style={mergeUIKitStyles(
          {
            border: `1px dashed ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
            padding: spacing,
            width: "100%",
          },
          style,
        )}
        data-testid={dataTestId}
      >
        <Empty image={emptyImage ?? Empty.PRESENTED_IMAGE_SIMPLE} description={false}>
          <Flex vertical align="center" gap={Math.max(6, spacing / 2)} style={{ textAlign: "center" }}>
            <div>{renderTitleNode(title)}</div>
            {description ? <div>{renderDescriptionNode(description)}</div> : null}
            {actionSlot ? <div>{actionSlot}</div> : null}
          </Flex>
        </Empty>
      </section>
    );
  }

  return (
    <Alert
      type="info"
      role={role ?? "note"}
      aria-live={liveMode}
      showIcon
      icon={icon ?? <InfoCircleOutlined />}
      message={renderTitleNode(title)}
      description={description ? renderDescriptionNode(description) : undefined}
      action={actionSlot}
      className={buildClassName("ui-kit-explainer", "ui-kit-explainer--inline", className)}
      data-testid={dataTestId}
      style={mergeUIKitStyles({ borderRadius: token.borderRadiusLG, marginBottom: 0 }, style)}
    />
  );
}
