// Feature: faculty-department-management
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  RightOutlined
} from "@ant-design/icons";
import { Button, Dropdown, Typography } from "antd";
import { useFacultyRow } from "../hooks/useFacultyRow";
import type { Faculty } from "../types/faculty";
import { DepartmentRow } from "./DepartmentRow";
import { DepartmentSearchBar } from "./DepartmentSearchBar";
import { DeleteDepartmentModal } from "./modals/DeleteDepartmentModal";
import { DepartmentFormModal } from "./modals/DepartmentFormModal";

export type FacultyRowProps = {
  faculty: Faculty;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  onEdit: (faculty: Faculty) => void;
  onDelete: (faculty: Faculty) => void;
  onAddDepartment: (faculty: Faculty) => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FacultyRow({
  faculty,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddDepartment,
}: FacultyRowProps) {
  const token = useToken();
  const { state, actions, flags } = useFacultyRow(faculty.id, isExpanded);
  const {
    departments,
    isLoading,
    isError,
    nameSearch,
    codeSearch,
    editTarget,
    deleteTarget,
  } = state;
  const {
    handleNameSearchChange,
    handleCodeSearchChange,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseEdit,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isSearchActive, canCreateDept } = flags;

  const facultyMenuItems = [
    {
      key: "edit",
      label: (
        <PermissionGuard permission={Permission.FacultiesUpdate}>
          <span>Edit</span>
        </PermissionGuard>
      ),
      icon: <EditOutlined />,
      onClick: () => onEdit(faculty),
    },
    {
      key: "delete",
      label: (
        <PermissionGuard permission={Permission.FacultiesDelete}>
          <span style={{ color: token.colorError }}>Delete</span>
        </PermissionGuard>
      ),
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: () => onDelete(faculty),
      danger: true,
    },
  ];

  // Dept count badge — use loaded departments count if expanded, else null departments means unknown
  const deptCount = isExpanded && !isLoading ? departments.length : (faculty.departments?.length ?? null);

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        marginBottom: 12,
        overflow: "hidden",
        background: token.colorBgContainer,
      }}
    >
      {/* Faculty header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          gap: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => onToggleExpand(faculty.id)}
      >
        {/* Expand/collapse icon */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: token.colorBgLayout,
            flexShrink: 0,
            color: token.colorTextSecondary,
          }}
        >
          {isExpanded ? (
            <DownOutlined style={{ fontSize: 12 }} />
          ) : (
            <RightOutlined style={{ fontSize: 12 }} />
          )}
        </span>

        {/* Name */}
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSize, display: "block" }}
            ellipsis
          >
            {faculty.name}
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
            {faculty.code}
          </span>
        </div>

        {/* Department count badge */}
        <ConditionalRenderer when={deptCount !== null}>
            <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: token.colorTextSecondary,
              background: token.colorBgLayout,
              padding: "3px 8px",
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
              whiteSpace: "nowrap",
            }}
          >
            {deptCount} Dept{deptCount !== 1 ? "s" : ""}
          </span>
        </ConditionalRenderer>

        {/* Created At */}
        <div style={{ flex: "0 0 auto", minWidth: 90 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}
          >
            {formatDate(faculty.createdAt)}
          </Typography.Text>
        </div>

        {/* Updated At */}
        <div style={{ flex: "0 0 auto", minWidth: 90 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}
          >
            {formatDate(faculty.updatedAt)}
          </Typography.Text>
        </div>

        {/* Actions */}
        <div
          style={{ flex: "0 0 auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            menu={{ items: facultyMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
            />
          </Dropdown>
        </div>
      </div>

      {/* Expanded department section */}
      {isExpanded && (
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgLayout,
          }}
        >
          {/* Search bar + Add Department button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <DepartmentSearchBar
              nameSearch={nameSearch}
              codeSearch={codeSearch}
              onNameChange={handleNameSearchChange}
              onCodeChange={handleCodeSearchChange}
            />
            {canCreateDept && (
              <PermissionGuard permission={Permission.DepartmentsCreate}>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onAddDepartment(faculty)}
                  style={{ fontWeight: 600 }}
                >
                  Add Department
                </Button>
              </PermissionGuard>
            )}
          </div>

          {/* Department list area */}
          <div>
            <DataLoader
              loading={isLoading}
              loader={<SkeletonRows count={3} variant="inline" />}
              minHeight="80px"
            >
              <ConditionalRenderer when={isError}>
                <div style={{ padding: "16px" }}>
                  <ErrorAlert
                    variant="section"
                    error="Failed to load departments"
                    onRetry={refetch}
                  />
                </div>
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && hasData}>
                {departments.map((dept) => (
                  <DepartmentRow
                    key={dept.id}
                    department={dept}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))}
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && !hasData && isSearchActive}>
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <Typography.Text type="secondary">
                    No departments matched your search.
                  </Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        handleNameSearchChange("");
                        handleCodeSearchChange("");
                      }}
                    >
                      Clear search
                    </Button>
                  </div>
                </div>
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && !hasData && !isSearchActive}>
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <Typography.Text type="secondary">No departments yet.</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <PermissionGuard permission={Permission.DepartmentsCreate}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => onAddDepartment(faculty)}
                      >
                        Add Department
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </ConditionalRenderer>
            </DataLoader>
          </div>
        </div>
      )}

      {/* Department modals — Edit and Delete are managed here; Create is managed by parent */}
      <DepartmentFormModal
        open={editTarget !== null}
        target={editTarget}
        onClose={handleCloseEdit}
      />
      <DeleteDepartmentModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
