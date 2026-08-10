// Feature: level-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Grid, Tag, Typography } from "antd";
import type { LevelCategory } from "../types/levelCategory";

const { useBreakpoint } = Grid;

export type LevelCategoryPanelProps = {
  categories: LevelCategory[];
  isLoading: boolean;
  isError: boolean;
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  refetchCategories: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (cat: LevelCategory) => void;
  onOpenDelete: (cat: LevelCategory) => void;
};

export function LevelCategoryPanel({
  categories,
  isLoading,
  isError,
  selectedCategoryId,
  onSelectCategory,
  refetchCategories,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}: LevelCategoryPanelProps) {
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
          Level Categories
        </Typography.Text>
        <PermissionGuard permission={Permission.LevelsCreate}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Add Category
          </Button>
        </PermissionGuard>
      </div>

      {/* Content area */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
        minHeight={120}
      >
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load categories"
            onRetry={refetchCategories}
          />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!isError && categories.length === 0}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No level categories found. Create one to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.LevelsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Add Category
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* List */}
        <ConditionalRenderer when={!isError && categories.length > 0}>
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              overflow: "hidden",
            }}
          >
            {categories.map((cat, index) => (
              <LevelCategoryRow
                key={cat.id}
                category={cat}
                isSelected={selectedCategoryId === cat.id}
                isMobile={isMobile}
                isLast={index === categories.length - 1}
                onSelect={() => onSelectCategory(cat.id)}
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

type LevelCategoryRowProps = {
  category: LevelCategory;
  isSelected: boolean;
  isMobile: boolean;
  isLast: boolean;
  onSelect: () => void;
  onEdit: (cat: LevelCategory) => void;
  onDelete: (cat: LevelCategory) => void;
};

function LevelCategoryRow({ category, isSelected, isMobile, isLast, onSelect, onEdit, onDelete }: LevelCategoryRowProps) {
  const token = useToken();

  const menuItems = [
    {
      key: "edit",
      label: <span>Edit</span>,
      icon: <EditOutlined />,
      onClick: (e: any) => { e.domEvent.stopPropagation(); onEdit(category); },
    },
    {
      key: "delete",
      label: <span style={{ color: token.colorError }}>Delete</span>,
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: (e: any) => { e.domEvent.stopPropagation(); onDelete(category); },
      danger: true as const,
    },
  ];

  const borderBottom = isLast ? "none" : `1px solid ${token.colorBorderSecondary}`;
  const backgroundColor = isSelected ? token.colorPrimary : token.colorBgContainer;
  const hoverColor = isSelected ? token.colorPrimaryHover : token.colorBgTextHover;
  const textColor = isSelected ? "#fff" : undefined;
  const actionColor = isSelected ? "rgba(255, 255, 255, 0.85)" : token.colorTextTertiary;

  const rowStyle = {
    padding: isMobile ? "12px 16px" : "10px 16px",
    borderBottom,
    background: backgroundColor,
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: isMobile ? 8 : 12,
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  return (
    <div 
      style={rowStyle}
      onClick={onSelect}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.background = backgroundColor)}
    >
      <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 4 : 12 }}>
        <Typography.Text strong style={{ fontSize: token.fontSize, color: textColor }} ellipsis>
          {category.name}
        </Typography.Text>
        <Tag style={{ fontFamily: "monospace", fontWeight: 600 }}>
          {category.code}
        </Tag>
      </div>

      {/* Actions */}
      <div style={{ flex: "0 0 auto" }}>
        <PermissionGuard permission={[Permission.LevelsUpdate, Permission.LevelsDelete]}>
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: actionColor }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </PermissionGuard>
      </div>
    </div>
  );
}
