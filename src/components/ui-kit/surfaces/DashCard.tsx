import { Flex, Grid, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { type UIResponsiveBehavior } from "../foundation";
import { Card, type CardProps } from "./Card";
import { getResponsiveSpacing, isStackedMode, resolveResponsiveMode } from "./shared";

export interface DashCardProps
  extends Omit<CardProps, "header" | "subheader" | "headerExtra" | "footer"> {
  title: ReactNode;
  meta?: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

const DEFAULT_DASHCARD_RESPONSIVE: UIResponsiveBehavior = {
  xs: "stack",
  md: "inline",
};

export function DashCard({
  title,
  meta,
  value,
  trend,
  icon,
  actions,
  footer,
  children,
  size = "md",
  density = "comfortable",
  responsive = DEFAULT_DASHCARD_RESPONSIVE,
  ...rest
}: DashCardProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const responsiveMode = resolveResponsiveMode(responsive, screens);
  const stacked = isStackedMode(responsiveMode);
  const spacing = getResponsiveSpacing(density, screens);
  const iconSize = size === "sm" ? 40 : size === "lg" ? 56 : 48;
  const iconFontSize = size === "sm" ? 18 : size === "lg" ? 24 : 20;
  const headingLevel = size === "sm" ? 4 : size === "lg" ? 2 : 3;

  return (
    <Card
      {...rest}
      size={size}
      density={density}
      responsive={responsive}
      header={
        <Flex vertical gap={2} style={{ minWidth: 0 }}>
          {typeof title === "string" ? <Typography.Text strong>{title}</Typography.Text> : title}
          {meta ? (
            typeof meta === "string" ? (
              <Typography.Text type="secondary">{meta}</Typography.Text>
            ) : (
              meta
            )
          ) : null}
        </Flex>
      }
      headerExtra={actions}
      footer={footer}
    >
      <Flex
        vertical={stacked}
        align={stacked ? "stretch" : "center"}
        justify="space-between"
        gap={spacing}
      >
        <div style={{ minWidth: 0 }}>
          {typeof value === "string" || typeof value === "number" ? (
            <Typography.Title level={headingLevel} style={{ margin: 0, lineHeight: 1.15 }}>
              {value}
            </Typography.Title>
          ) : (
            value
          )}
          {trend ? (
            typeof trend === "string" ? (
              <Typography.Text type="secondary">{trend}</Typography.Text>
            ) : (
              trend
            )
          ) : null}
        </div>

        {icon ? (
          <div
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: token.borderRadiusLG,
              background: `${token.colorPrimary}14`,
              color: token.colorPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: iconFontSize,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        ) : null}
      </Flex>

      {children ? <div style={{ marginTop: spacing }}>{children}</div> : null}
    </Card>
  );
}
