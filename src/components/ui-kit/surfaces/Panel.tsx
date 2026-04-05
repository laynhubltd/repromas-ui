import { DownOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useId, useState, type ReactNode } from "react";
import {
  isInteractiveStateDisabled,
  toAntdSize,
  type UIResponsiveBehavior,
} from "../foundation";
import { Card, type CardProps } from "./Card";

export interface PanelProps extends Omit<CardProps, "header" | "subheader" | "headerExtra"> {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

const DEFAULT_PANEL_RESPONSIVE: UIResponsiveBehavior = {
  xs: "stack",
  md: "inline",
};

export function Panel({
  title,
  subtitle,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  collapsed,
  onCollapseChange,
  children,
  footer,
  size = "md",
  density = "comfortable",
  responsive = DEFAULT_PANEL_RESPONSIVE,
  state = "default",
  loading,
  ...rest
}: PanelProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const contentId = useId();
  const isControlled = typeof collapsed === "boolean";
  const isCollapsed = collapsible ? (isControlled ? collapsed : internalCollapsed) : false;
  const toggleDisabled = isInteractiveStateDisabled(state) || loading || state === "loading";

  const handleToggle = () => {
    if (!collapsible || toggleDisabled) {
      return;
    }

    const next = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(next);
    }
    onCollapseChange?.(next);
  };

  return (
    <Card
      {...rest}
      size={size}
      density={density}
      responsive={responsive}
      state={state}
      loading={loading}
      header={typeof title === "string" ? <Typography.Text strong>{title}</Typography.Text> : title}
      subheader={
        subtitle
          ? typeof subtitle === "string"
            ? <Typography.Text type="secondary">{subtitle}</Typography.Text>
            : subtitle
          : undefined
      }
      headerExtra={
        actions || collapsible ? (
          <Flex align="center" gap={8} wrap>
            {actions}
            {collapsible ? (
              <Button
                type="text"
                size={toAntdSize(size)}
                icon={<DownOutlined rotate={isCollapsed ? -90 : 0} />}
                onClick={handleToggle}
                aria-label={isCollapsed ? "Expand panel section" : "Collapse panel section"}
                aria-expanded={!isCollapsed}
                aria-controls={contentId}
                disabled={toggleDisabled}
              >
                {isCollapsed ? "Expand" : "Collapse"}
              </Button>
            ) : null}
          </Flex>
        ) : undefined
      }
      footer={isCollapsed ? undefined : footer}
    >
      <div id={contentId} hidden={isCollapsed}>
        {children}
      </div>
    </Card>
  );
}
