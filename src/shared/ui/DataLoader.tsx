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
    <Spin />
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
    // Custom loaders (e.g. SkeletonRows) render full-width block content —
    // wrapping them in a flex centering container collapses their width.
    // Only apply centering for the default spinner.
    if (loader) {
      return (
        <div className={className} style={{ minHeight }}>
          {loader}
        </div>
      );
    }
    return (
      <div
        className={className}
        style={{
          minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {defaultLoader}
      </div>
    );
  }

  return <>{children}</>;
}
