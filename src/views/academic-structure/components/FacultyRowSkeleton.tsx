import { useToken } from "@/hooks/useToken";
import { Skeleton } from "antd";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface FacultyRowSkeletonProps {
  message?: string;
}

export function FacultyRowSkeleton({ message = "Loading..." }: FacultyRowSkeletonProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        marginBottom: isMobile ? 12 : 16,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: isMobile ? "10px 12px" : "12px 16px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 10 : 0,
          background: token.colorBgContainer,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>
          <Skeleton.Button active size="small" style={{ width: 40, height: 24 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
            <Skeleton.Input active size="small" style={{ width: 120, height: 20 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
            <Skeleton.Input active size="small" style={{ width: 160, height: 20 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Skeleton.Button active size="small" style={{ width: 120, height: 24 }} />
          <Skeleton.Avatar active size="small" shape="square" />
          <Skeleton.Avatar active size="small" shape="square" />
        </div>
      </div>
      <div
        style={{
          padding: isMobile ? "24px 12px" : "32px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            marginBottom: 16,
            border: `2px solid ${token.colorPrimary}33`,
            borderTopColor: token.colorPrimary,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: token.colorTextTertiary,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {message}
        </span>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
