import { Modal as AntModal, Button, Grid, theme } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type {
  UIComponentDensity,
  UIComponentSize,
  UIComponentVariant,
  UIKitCommonProps,
  UIKitVariantProps,
} from "../foundation";
import { mergeUIKitStyles, toSpacingUnit, UI_RADIUS } from "../foundation";
import { getSurfaceVariantStyle } from "./shared";

// ─── Types ───────────────────────────────────────────────────────────────────

type AntdToken = ReturnType<typeof theme.useToken>["token"];

export interface ModalProps
  extends UIKitCommonProps,
    Pick<UIKitVariantProps, "size" | "density" | "variant" | "state"> {
  // Visibility
  open: boolean;
  onClose?: () => void;

  // Content slots
  title?: ReactNode;
  children?: ReactNode;

  // Footer actions
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  footer?: ReactNode | null;
  /** Controls the footer button layout. Defaults to "horizontal" (buttons side-by-side, right-aligned). Use "vertical" for a stacked full-width layout. */
  footerLayout?: "horizontal" | "vertical";

  // Behaviour
  danger?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnHidden?: boolean;

  // Mobile
  mobileFullscreen?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODAL_SIZE_WIDTH: Record<UIComponentSize, number> = {
  sm: 400,
  md: 520,
  lg: 720,
};

// ─── Style Config Type ───────────────────────────────────────────────────────

type ModalStylesConfig = {
  header: CSSProperties;
  body: CSSProperties;
  content: CSSProperties;
  wrapper?: CSSProperties;
};

// ─── Pure Helper Functions ────────────────────────────────────────────────────

export function resolveModalWidth(
  size: UIComponentSize = "md",
  isMobile: boolean = false,
): number | string {
  if (isMobile) return "100%";
  return MODAL_SIZE_WIDTH[size];
}

export function resolveModalStyles(
  token: AntdToken,
  density: UIComponentDensity = "comfortable",
  variant: UIComponentVariant = "default",
  isMobile: boolean = false,
  mobileFullscreen: boolean = false,
): ModalStylesConfig {
  const spacing = toSpacingUnit(density);
  const variantStyle = getSurfaceVariantStyle(token, variant);

  return {
    header: {
      margin: 0,
      padding: spacing,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      background: variantStyle.background,
    },
    body: {
      ...(isMobile
        ? {
            maxHeight: mobileFullscreen ? "100vh" : "70vh",
            overflowY: "auto" as const,
          }
        : {}),
    },
    content: {
      background: variantStyle.background,
      ...(variant === "outlined"
        ? { border: `1px solid ${token.colorBorder}` }
        : variant === "ghost"
          ? { border: "none", boxShadow: "none" }
          : {}),
      ...(isMobile
        ? {
            borderRadius: `${UI_RADIUS.lg}px ${UI_RADIUS.lg}px 0 0`,
            margin: 0,
          }
        : {}),
    },
    wrapper: isMobile ? { alignItems: "flex-end", padding: 0 } : undefined,
  };
}

// ─── Default Footer Builder ───────────────────────────────────────────────────

export function buildDefaultFooter(
  token: AntdToken,
  confirmLabel: string | undefined,
  cancelLabel: string | undefined,
  onConfirm: (() => void) | undefined,
  onClose: (() => void) | undefined,
  isLoading: boolean,
  danger: boolean,
  footerLayout: "horizontal" | "vertical" = "horizontal",
): ReactNode {
  if (!onConfirm) return null;

  const isVertical = footerLayout === "vertical";

  // AntD v5 wraps everything in .ant-modal-content with padding: 20px 24px.
  // To make the footer span edge-to-edge we break out with negative margins
  // that exactly cancel the content wrapper's padding (24px sides, 20px bottom).
  const edgeBreakout: CSSProperties = {
    marginLeft: -24,
    marginRight: -24,
    marginBottom: -20,
  };

  return (
    <div style={{
      ...edgeBreakout,
      display: "flex",
      flexDirection: isVertical ? "column" : "row",
      justifyContent: isVertical ? undefined : "flex-end",
      gap: 8,
      padding: "12px 16px",
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      background: token.colorBgLayout,
      borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
    }}>
      {!isVertical && (
        <Button
          type="text"
          onClick={onClose}
          disabled={isLoading}
          style={{ fontWeight: 500, color: token.colorTextSecondary }}
        >
          {cancelLabel ?? "Cancel"}
        </Button>
      )}
      <Button
        type="primary"
        danger={danger}
        loading={isLoading}
        disabled={isLoading}
        onClick={onConfirm}
        block={isVertical}
        style={isVertical ? { height: 40, fontWeight: 600 } : { fontWeight: 600 }}
      >
        {confirmLabel}
      </Button>
      {isVertical && (
        <Button
          type="text"
          block
          onClick={onClose}
          disabled={isLoading}
          style={{ height: 36, color: token.colorTextSecondary, fontWeight: 500 }}
        >
          {cancelLabel ?? "Cancel"}
        </Button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Modal(props: ModalProps): ReactNode {
  const {
    open,
    onClose,
    title,
    children,
    confirmLabel,
    cancelLabel,
    onConfirm,
    danger = false,
    closable,
    maskClosable,
    destroyOnHidden = false,
    mobileFullscreen = false,
    footerLayout = "horizontal",
    size = "md",
    density = "comfortable",
    variant = "default",
    state = "default",
    className,
    style,
    "data-testid": dataTestId,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } = props;

  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !!screens.xs;

  const isLoading = state === "loading";
  const effectiveClosable = isLoading ? false : (closable ?? true);
  const effectiveMaskClosable = isLoading ? false : (maskClosable ?? true);

  const width = resolveModalWidth(size, isMobile);
  const styles = resolveModalStyles(token, density, variant, isMobile, mobileFullscreen);
  const mergedStyle = mergeUIKitStyles(getSurfaceVariantStyle(token, variant), style);

  // Footer slot resolution:
  // - footer prop explicitly provided (including null) → pass directly
  // - footer absent + onConfirm present → build default footer
  // - footer absent + onConfirm absent → null
  const footerContent =
    "footer" in props
      ? props.footer
      : onConfirm
        ? buildDefaultFooter(token, confirmLabel, cancelLabel, onConfirm, onClose, isLoading, danger, footerLayout)
        : null;

  return (
    <AntModal
      open={open}
      title={title}
      onCancel={onClose ?? (() => {})}
      width={width}
      styles={styles}
      style={mergedStyle}
      closable={effectiveClosable}
      maskClosable={effectiveMaskClosable}
      destroyOnHidden={destroyOnHidden}
      footer={footerContent}
      className={className}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </AntModal>
  );
}

// Re-export helpers used by consumers and tests
export { mergeUIKitStyles };
