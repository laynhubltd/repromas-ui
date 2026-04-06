import { useToken } from "@/shared/hooks/useToken";
import { Skeleton } from "antd";

type SkeletonRowsProps = {
  /** Number of skeleton rows to render (default: 3) */
  count?: number;
  /**
   * "card"   — bordered card with padding, margin-bottom, and a title line (default)
   * "inline" — borderless row with bottom border only, no title line
   */
  variant?: "card" | "inline";
};

/**
 * SkeletonRows — reusable skeleton placeholder for list/table loading states.
 *
 * Usage:
 *   <DataLoader loading={isLoading} loader={<SkeletonRows />}>
 *     ...
 *   </DataLoader>
 *
 *   <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="inline" />}>
 *     ...
 *   </DataLoader>
 */
export function SkeletonRows({ count = 3, variant = "card" }: SkeletonRowsProps) {
  const token = useToken();

  return (
    <>
      {Array.from({ length: count }, (_, i) =>
        variant === "card" ? (
          <div
            key={i}
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: "12px 16px",
              marginBottom: 12,
              background: token.colorBgContainer,
            }}
          >
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: "40%" }} />
          </div>
        ) : (
          <div
            key={i}
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </div>
        )
      )}
    </>
  );
}
