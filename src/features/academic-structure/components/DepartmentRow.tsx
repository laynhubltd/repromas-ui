// Feature: faculty-department-management
import {
  PermittedDropdown,
  type PermittedMenuItem,
} from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useDepartmentRow } from "../hooks/useDepartmentRow";
import type { Department } from "../types/faculty";

export type DepartmentRowProps = {
  department: Department;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DepartmentRow({ department, onEdit, onDelete }: DepartmentRowProps) {
  const token = useToken();
  const { flags } = useDepartmentRow(department);

  const menuItems: PermittedMenuItem[] = [];

  if (flags.canEdit) {
    menuItems.push({
      key: "edit",
      label: "Edit",
      permission: [Permission.DepartmentsUpdate, Permission.DepartmentsManage],
      icon: <EditOutlined />,
      onClick: () => onEdit(department),
    });
  }

  if (flags.canDelete) {
    menuItems.push({
      key: "delete",
      label: <span style={{ color: token.colorError }}>Delete</span>,
      permission: [Permission.DepartmentsDelete, Permission.DepartmentsManage],
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: () => onDelete(department),
      danger: true,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        gap: 12,
      }}
    >
      {/* Name */}
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <Typography.Text
          strong
          style={{ fontSize: token.fontSize, display: "block" }}
          ellipsis
        >
          {department.name}
        </Typography.Text>
      </div>

      {/* Code */}
      <div style={{ flex: "0 0 auto" }}>
        <span
          style={{
            padding: "2px 8px",
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            fontSize: token.fontSizeSM,
            fontWeight: 600,
            color: token.colorTextSecondary,
            fontFamily: "monospace",
          }}
        >
          {department.code}
        </span>
      </div>

      {/* Created At */}
      <div style={{ flex: "0 0 auto", minWidth: 90 }}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}
        >
          {formatDate(department.createdAt)}
        </Typography.Text>
      </div>

      {/* Actions */}
      <div style={{ flex: "0 0 auto" }}>
        <PermittedDropdown
          items={menuItems}
          trigger={["click"]}
          placement="bottomRight"
          emptyFallback={<div style={{ width: 24 }} />}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16 }} />}
            style={{ color: token.colorTextTertiary }}
          />
        </PermittedDropdown>
      </div>
    </div>
  );
}
