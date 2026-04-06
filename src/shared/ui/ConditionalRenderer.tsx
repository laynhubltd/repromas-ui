import type { CSSProperties, ReactNode } from "react";

type ConditionalRendererProps = {
  /** Render children only when this is true */
  when: boolean;
  /** Content to render when condition is met */
  children: ReactNode;
  /**
   * Optional wrapper element around children.
   * When omitted, children are rendered directly (no extra DOM node).
   */
  wrapper?: (children: ReactNode) => ReactNode;
};

/**
 * ConditionalRenderer — renders children only when `when` is true.
 *
 * Eliminates inline `{condition && (...)}` blocks in JSX, keeping view
 * components clean and readable.
 *
 * Basic usage:
 *   <ConditionalRenderer when={!hasData && !isSearchActive}>
 *     <EmptyState />
 *   </ConditionalRenderer>
 *
 * With a wrapper (e.g. a styled container):
 *   <ConditionalRenderer
 *     when={!hasData && !isSearchActive}
 *     wrapper={(children) => <div style={{ textAlign: "center", padding: 48 }}>{children}</div>}
 *   >
 *     <Typography.Text type="secondary">No items yet.</Typography.Text>
 *   </ConditionalRenderer>
 */
export function ConditionalRenderer({ when, children, wrapper }: ConditionalRendererProps) {
  if (!when) return null;
  if (wrapper) return <>{wrapper(children)}</>;
  return <>{children}</>;
}

// ─── Convenience style helper ────────────────────────────────────────────────

/**
 * centeredBox — returns a wrapper function for ConditionalRenderer that
 * renders children inside a centred, optionally bordered container.
 *
 * Usage:
 *   <ConditionalRenderer
 *     when={!hasData}
 *     wrapper={centeredBox({ border: `1px dashed ${token.colorBorder}`, ... })}
 *   >
 *     ...
 *   </ConditionalRenderer>
 */
export function centeredBox(style?: CSSProperties) {
  return (children: ReactNode) => (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
