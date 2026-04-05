import { Card as AntCard, Flex, Grid, Typography, theme } from "antd";
import type { CardProps as AntCardProps } from "antd";
import type { ReactNode } from "react";
import {
  getInteractiveTabIndex,
  mergeUIKitStyles,
  type UIKitComponentProps,
} from "../foundation";
import {
  getResponsiveSpacing,
  getSurfaceStateStyle,
  getSurfaceVariantStyle,
  isStackedMode,
  resolveResponsiveMode,
  toAntdCardVariant,
} from "./shared";

export interface CardProps
  extends Omit<AntCardProps, "title" | "extra" | "size" | "variant" | "children" | "actions" | "styles">,
    UIKitComponentProps {
  header?: ReactNode;
  subheader?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Card({
  header,
  subheader,
  headerExtra,
  footer,
  children,
  size = "md",
  density = "comfortable",
  variant = "default",
  state = "default",
  responsive,
  style,
  className,
  tabIndex,
  role = "region",
  loading,
  ...rest
}: CardProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const responsiveMode = resolveResponsiveMode(responsive, screens);
  const stackedHeader = isStackedMode(responsiveMode);
  const spacing = getResponsiveSpacing(density, screens);

  const mergedHeader = header || subheader ? (
    <Flex vertical gap={2} style={{ minWidth: 0 }}>
      {typeof header === "string" ? <Typography.Text strong>{header}</Typography.Text> : header}
      {subheader ? (
        typeof subheader === "string" ? (
          <Typography.Text type="secondary">{subheader}</Typography.Text>
        ) : (
          subheader
        )
      ) : null}
      {stackedHeader && headerExtra ? <div>{headerExtra}</div> : null}
    </Flex>
  ) : stackedHeader ? (
    headerExtra
  ) : undefined;

  return (
    <AntCard
      {...rest}
      role={role}
      className={className}
      tabIndex={tabIndex ?? getInteractiveTabIndex(state)}
      size={size === "sm" ? "small" : "medium"}
      variant={toAntdCardVariant(variant)}
      loading={loading ?? state === "loading"}
      title={mergedHeader}
      extra={stackedHeader ? undefined : headerExtra}
      style={mergeUIKitStyles(
        getSurfaceVariantStyle(token, variant),
        getSurfaceStateStyle(state),
        style,
      )}
      styles={{
        header: {
          paddingInline: spacing,
          paddingBlock: spacing,
        },
        body: {
          padding: spacing,
        },
      }}
    >
      {children}
      {footer ? (
        <div
          style={mergeUIKitStyles({
            marginTop: spacing,
            paddingTop: spacing,
            borderTop: variant === "ghost" ? undefined : `1px solid ${token.colorBorderSecondary}`,
          })}
        >
          {footer}
        </div>
      ) : null}
    </AntCard>
  );
}
