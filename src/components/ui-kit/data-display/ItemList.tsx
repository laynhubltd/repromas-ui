import { RightOutlined } from "@ant-design/icons";
import { Empty, Flex, Typography, theme } from "antd";
import type { CSSProperties, ReactNode } from "react";
import {
  isInteractiveStateDisabled,
  mergeUIKitStyles,
  type UIComponentDensity,
  type UIComponentState,
  type UIKitCommonProps,
} from "../foundation";
import { buildClassName, getDataDisplaySpacing, getDataDisplayStateStyle } from "./shared";
import "./data-display.css";

export type ItemListVariant = "simple" | "media" | "navigation";

export interface ItemListItem {
  key: string;
  leading?: ReactNode;
  content: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface ItemListProps
  extends Omit<UIKitCommonProps, "tabIndex"> {
  items: ItemListItem[];
  variant?: ItemListVariant;
  density?: UIComponentDensity;
  state?: UIComponentState;
  bordered?: boolean;
  split?: boolean;
  emptyState?: ReactNode;
  onItemClick?: (item: ItemListItem, index: number) => void;
}

function getLeadingSize(variant: ItemListVariant, density: UIComponentDensity): number {
  if (variant === "media") {
    return density === "compact" ? 36 : density === "comfortable" ? 44 : 52;
  }

  return density === "compact" ? 24 : density === "comfortable" ? 28 : 32;
}

function renderContentNode(content: ReactNode): ReactNode {
  if (typeof content === "string" || typeof content === "number") {
    return <Typography.Text>{content}</Typography.Text>;
  }
  return content;
}

export function ItemList({
  items,
  variant = "simple",
  density = "comfortable",
  state = "default",
  bordered = true,
  split = true,
  emptyState,
  onItemClick,
  role,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  style,
  "data-testid": dataTestId,
}: ItemListProps) {
  const { token } = theme.useToken();
  const spacing = getDataDisplaySpacing(density);
  const rowPaddingBlock = density === "compact" ? spacing : spacing + 2;
  const leadingSize = getLeadingSize(variant, density);
  const listDisabled = isInteractiveStateDisabled(state) || state === "loading";

  const rowShellStyle: CSSProperties = {
    width: "100%",
    paddingBlock: rowPaddingBlock,
    paddingInline: spacing + 2,
    borderRadius: token.borderRadiusSM,
  };

  return (
    <section
      className={className}
      style={mergeUIKitStyles(
        bordered
          ? {
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusLG,
              overflow: "hidden",
              background: token.colorBgContainer,
            }
          : undefined,
        getDataDisplayStateStyle(state),
        style,
      )}
      data-testid={dataTestId}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {items.length === 0 ? (
        <div style={{ paddingBlock: spacing * 2 }}>
          {emptyState ?? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items available" />}
        </div>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {items.map((item, index) => {
          const itemDisabled = listDisabled || item.disabled;
          const defaultTrailing =
            variant === "navigation" ? <RightOutlined className="ui-kit-item-list__chevron" /> : null;
          const trailingContent = item.trailing ?? defaultTrailing;
          const shouldRenderInteractive =
            variant === "navigation" || Boolean(item.onClick || onItemClick || item.href);

          const handleActivate = () => {
            if (itemDisabled) {
              return;
            }
            item.onClick?.();
            onItemClick?.(item, index);
          };

          const itemBody = (
            <Flex
              align={variant === "media" ? "flex-start" : "center"}
              gap={spacing}
              style={{ width: "100%", minWidth: 0 }}
            >
              {item.leading ? (
                <div
                  style={{
                    width: leadingSize,
                    height: leadingSize,
                    borderRadius: variant === "media" ? token.borderRadiusSM : leadingSize / 2,
                    background: variant === "media" ? token.colorFillQuaternary : token.colorFillTertiary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.leading}
                </div>
              ) : null}

              <div style={{ minWidth: 0, flex: 1 }}>{renderContentNode(item.content)}</div>

              {trailingContent ? (
                <div style={{ flexShrink: 0, color: token.colorTextSecondary }}>
                  {renderContentNode(trailingContent)}
                </div>
              ) : null}
            </Flex>
          );

          if (shouldRenderInteractive && item.href && !itemDisabled) {
            return (
              <li
                key={item.key}
                style={{
                  padding: 0,
                  borderBottom:
                    split && index < items.length - 1 ? `1px solid ${token.colorBorderSecondary}` : undefined,
                }}
              >
                <a
                  className={buildClassName("ui-kit-item-list__interactive")}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  style={rowShellStyle}
                  onClick={handleActivate}
                >
                  {itemBody}
                </a>
              </li>
            );
          }

          if (shouldRenderInteractive) {
            return (
              <li
                key={item.key}
                style={{
                  padding: 0,
                  borderBottom:
                    split && index < items.length - 1 ? `1px solid ${token.colorBorderSecondary}` : undefined,
                }}
              >
                <button
                  type="button"
                  className={buildClassName("ui-kit-item-list__interactive")}
                  disabled={itemDisabled}
                  aria-disabled={itemDisabled}
                  aria-label={item.ariaLabel}
                  style={mergeUIKitStyles(rowShellStyle, {
                    border: 0,
                    background: "transparent",
                    textAlign: "left",
                  })}
                  onClick={handleActivate}
                >
                  {itemBody}
                </button>
              </li>
            );
          }

          return (
            <li
              key={item.key}
              style={{
                padding: 0,
                borderBottom:
                  split && index < items.length - 1 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <div style={rowShellStyle}>{itemBody}</div>
            </li>
          );
          })}
        </ul>
      )}
    </section>
  );
}
