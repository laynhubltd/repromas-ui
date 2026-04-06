import { Spin } from "antd";
import type { ReactNode } from "react";

type DataLoaderProps = {
  /** When true, renders the loader instead of children */
  loading: boolean;
  /** Custom loader — skeleton, spinner, etc. Defaults to AntD Spin */
  loader?: ReactNode;
  /** Content to render when not loading */
  children: ReactNode;
  /** Optional wrapper className */
  className?: string;
  /** Minimum height for the loading container (default: "120px") */
  minHeight?: string | number;
};

const defaultLoader = (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "32px 0",
    }}
  >
    <Spin size="default" />
  </div>
);

/**
 * DataLoader — wraps any section that has a loading state.
 *
 * Usage:
 *   <DataLoader loading={isLoading}>
 *     <MyContent />
 *   </DataLoader>
 *
 *   <DataLoader loading={isLoading} loader={<MySkeleton />}>
 *     <MyContent />
 *   </DataLoader>
 */
export function DataLoader({
  loading,
  loader,
  children,
  className,
  minHeight = "120px",
}: DataLoaderProps) {
  if (loading) {
    return (
      <div
        className={className}
        style={{ minHeight, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {loader ?? defaultLoader}
      </div>
    );
  }

  return <>{children}</>;
}
