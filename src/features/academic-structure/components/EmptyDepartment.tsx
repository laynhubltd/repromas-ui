import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ApartmentOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

export interface EmptyDepartmentProps {
  onAddDepartment?: () => void;
}

export function EmptyDepartment({ onAddDepartment }: EmptyDepartmentProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        padding: isMobile ? "24px 12px" : "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: token.colorBgLayout,
        border: `1px dashed ${token.colorBorder}`,
        borderRadius: token.borderRadius,
      }}
    >
      <div
        style={{
          width: isMobile ? 40 : 48,
          height: isMobile ? 40 : 48,
          borderRadius: "50%",
          background: token.colorBgElevated,
          color: token.colorTextTertiary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          fontSize: isMobile ? 20 : 24,
        }}
      >
        <ApartmentOutlined />
      </div>
      <span
        style={{
          fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM,
          fontWeight: 600,
          color: token.colorTextSecondary,
          marginBottom: 4,
        }}
      >
        No Departments Found
      </span>
      <span
        style={{
          fontSize: isMobile ? 9 : 10,
          color: token.colorTextTertiary,
          textAlign: "center",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        There are no departments listed under this faculty.
        <br />
        Start by adding the first department.
      </span>
      {onAddDepartment && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          onClick={onAddDepartment}
        >
          Add Department
        </Button>
      )}
    </div>
  );
}
