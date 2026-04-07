// Feature: academic-calendar
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Grid, Tag, Typography } from "antd";
import type { SemesterType } from "../types/academic-calendar";

const { useBreakpoint } = Grid;

export type SemesterTypePanelProps = {
  semesterTypes: SemesterType[];
  semesterTypesLoading: boolean;
  semesterTypesError: boolean;
  refetchSemesterTypes: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (st: SemesterType) => void;
  onOpenDelete: (st: SemesterType) => void;
};

export function SemesterTypePanel({
  semesterTypes,
  semesterTypesLoading,
  semesterTypesError,
  refetchSemesterTypes,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}: SemesterTypePanelProps) {
  const token = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Typography.Text strong style={{ fontSize: token.fontSize, color: token.colorText }}>
          Semester Types
        </Typography.Text>
        <PermissionGuard permission={Permission.SemesterTypesCreate}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Add Semester Type
          </Button>
        </PermissionGuard>
      </div>

      {/* Content area */}
      <DataLoader
        loading={semesterTypesLoading}
        loader={<SkeletonRows count={3} variant="card" />}
        minHeight={120}
      >
        {/* Error state */}
        <ConditionalRenderer when={semesterTypesError}>
          <ErrorAlert
            variant="section"
            error="Failed to load semester types"
            onRetry={refetchSemesterTypes}
          />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!semesterTypesError && semesterTypes.length === 0}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No semester types yet. Create one to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.SemesterTypesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Add Semester Type
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* List */}
        <ConditionalRenderer when={!semesterTypesError && semesterTypes.length > 0}>
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              overflow: "hidden",
            }}
          >
            {semesterTypes.map((st, index) => (
              <SemesterTypeRow
                key={st.id}
                semesterType={st}
                isMobile={isMobile}
                isLast={index === semesterTypes.length - 1}
                onEdit={onOpenEdit}
                onDelete={onOpenDelete}
              />
            ))}
          </div>
        </ConditionalRenderer>
      </DataLoader>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

type SemesterTypeRowProps = {
  semesterType: SemesterType;
  isMobile: boolean;
  isLast: boolean;
  onEdit: (st: SemesterType) => void;
  onDelete: (st: SemesterType) => void;
};

function SemesterTypeRow({ semesterType, isMobile, isLast, onEdit, onDelete }: SemesterTypeRowProps) {
  const token = useToken();

  const menuItems = [
    {
      key: "edit",
      label: <span>Edit</span>,
      icon: <EditOutlined />,
      onClick: () => onEdit(semesterType),
    },
    {
      key: "delete",
      label: <span style={{ color: token.colorError }}>Delete</span>,
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: () => onDelete(semesterType),
      danger: true as const,
    },
  ];

  const borderBottom = isLast ? "none" : `1px solid ${token.colorBorderSecondary}`;

  if (isMobile) {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderBottom,
          background: token.colorBgContainer,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Stacked: sortOrder, name, code */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
          <Tag style={{ fontWeight: 700, fontSize: token.fontSizeSM, width: "fit-content" }}>
            #{semesterType.sortOrder}
          </Tag>
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {semesterType.name}
          </Typography.Text>
          <Tag style={{ fontFamily: "monospace", fontWeight: 600, width: "fit-content" }}>
            {semesterType.code}
          </Tag>
        </div>

        {/* Actions */}
        <PermissionGuard permission={[Permission.SemesterTypesUpdate, Permission.SemesterTypesDelete]}>
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </PermissionGuard>
      </div>
    );
  }

  // Desktop: inline layout
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom,
        background: token.colorBgContainer,
        gap: 12,
      }}
    >
      {/* Sort order badge */}
      <div style={{ flex: "0 0 auto" }}>
        <Tag
          style={{
            fontWeight: 700,
            fontSize: token.fontSizeSM,
            borderRadius: token.borderRadius,
            minWidth: 32,
            textAlign: "center",
          }}
        >
          #{semesterType.sortOrder}
        </Tag>
      </div>

      {/* Name */}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <Typography.Text strong style={{ fontSize: token.fontSize }} ellipsis>
          {semesterType.name}
        </Typography.Text>
      </div>

      {/* Code */}
      <div style={{ flex: "0 0 auto" }}>
        <Tag style={{ fontFamily: "monospace", fontWeight: 600 }}>
          {semesterType.code}
        </Tag>
      </div>

      {/* Actions */}
      <div style={{ flex: "0 0 auto" }}>
        <PermissionGuard permission={[Permission.SemesterTypesUpdate, Permission.SemesterTypesDelete]}>
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </PermissionGuard>
      </div>
    </div>
  );
}
