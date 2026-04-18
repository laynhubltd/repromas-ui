// Feature: rbac-settings
import { Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  KeyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Badge, Button, Flex, Input, Popover, Select, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRolesPanel } from "../../hooks/useRolesPanel";
import type { Role, RoleScope } from "../../types/rbac";
import { DeleteRoleModal } from "../modals/DeleteRoleModal";
import { RoleFormModal } from "../modals/RoleFormModal";
import { ScopeBadge } from "../ScopeBadge";
import { RolePermissionsDrawer } from "./RolePermissionsDrawer";

const SCOPE_FILTER_OPTIONS = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RolesPanel() {
  const token = useToken();
  const { state, actions, flags } = useRolesPanel();
  const {
    roles,
    totalItems,
    isLoading,
    isError,
    search,
    scopeFilter,
    page,
    selectedRoleId,
    createModalOpen,
    editTarget,
    deleteTarget,
    filterOpen,
  } = state;
  const {
    handleSearchChange,
    handleScopeFilterChange,
    handleSortChange,
    handleManagePermissions,
    clearAllFilters,
    closeDrawer,
    setCreateModalOpen,
    setEditTarget,
    setDeleteTarget,
    setPage,
    setFilterOpen,
    refetch,
  } = actions;
  const { hasData, isFilterActive, activeFilterCount } = flags;

  const columns: ColumnsType<Role> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (scope: RoleScope) => <ScopeBadge scope={scope} />,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string | null) => (
        <Typography.Text type="secondary">{description ?? "—"}</Typography.Text>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 140,
      render: (_: unknown, record: Role) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard permission={Permission.RolesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleManagePermissions(record)}
              title="Manage Permissions"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.RolesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => setEditTarget(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.RolesDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => setDeleteTarget(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  const filterContent = (
    <Flex vertical gap={12} style={{ width: 220 }}>
      <div>
        <Typography.Text
          style={{ display: "block", marginBottom: 6, fontSize: token.fontSizeSM, fontWeight: 600 }}
        >
          Scope
        </Typography.Text>
        <Select
          allowClear
          placeholder="All scopes"
          value={scopeFilter}
          onChange={(val) => handleScopeFilterChange(val as RoleScope | undefined)}
          options={SCOPE_FILTER_OPTIONS}
          style={{ width: "100%" }}
        />
      </div>
      <Button size="small" type="link" onClick={clearAllFilters} style={{ padding: 0 }}>
        Clear all filters
      </Button>
    </Flex>
  );

  return (
    <PermissionGuard permission={Permission.RolesList}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        {/* Toolbar */}
        <Flex gap={12} align="center" wrap="wrap">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />

          {/* Scope filter — inside Popover when activeFilterCount >= 2, inline otherwise */}
          {activeFilterCount >= 2 ? (
            <Popover
              content={filterContent}
              trigger="click"
              open={filterOpen}
              onOpenChange={setFilterOpen}
              placement="bottomLeft"
            >
              <Badge count={activeFilterCount} size="small">
                <Button icon={<FilterOutlined />}>Filters</Button>
              </Badge>
            </Popover>
          ) : (
            <Select
              allowClear
              placeholder="Filter by scope"
              value={scopeFilter}
              onChange={(val) => handleScopeFilterChange(val as RoleScope | undefined)}
              options={SCOPE_FILTER_OPTIONS}
              style={{ width: 180 }}
            />
          )}

          <PermissionGuard permission={Permission.RolesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              style={{ fontWeight: 600 }}
            >
              Create Role
            </Button>
          </PermissionGuard>
        </Flex>

        {/* Master-detail layout */}
        <div style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "flex-start", gap: 0 }}>
          {/* Roles table */}
          <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
            <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
              {/* Error state */}
              <ConditionalRenderer when={isError}>
                <ErrorAlert
                  variant="section"
                  error="Failed to load roles"
                  onRetry={refetch}
                />
              </ConditionalRenderer>

              {/* Empty state — no filters active */}
              <ConditionalRenderer
                when={!isError && !hasData && !isFilterActive}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgContainer,
                })}
              >
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  No roles yet. Follow these steps to get started:
                </Typography.Text>
                <ol
                  style={{
                    textAlign: "left",
                    display: "inline-block",
                    marginBottom: 16,
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  <li>Create a role</li>
                  <li>Add permissions to it</li>
                  <li>Assign it to users</li>
                </ol>
                <div>
                  <PermissionGuard permission={Permission.RolesCreate}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateModalOpen(true)}
                      style={{ fontWeight: 600 }}
                    >
                      Create Role
                    </Button>
                  </PermissionGuard>
                </div>
              </ConditionalRenderer>

              {/* Empty state — filters active but no results */}
              <ConditionalRenderer
                when={!isError && !hasData && isFilterActive}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgContainer,
                })}
              >
                <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  No roles found matching your filters.
                </Typography.Text>
                <Button type="link" onClick={clearAllFilters}>
                  Clear filters
                </Button>
              </ConditionalRenderer>

              {/* Table */}
              <ConditionalRenderer when={!isError && hasData}>
                <Table<Role>
                  rowKey="id"
                  dataSource={roles}
                  columns={columns}
                  size="md"
                  density="comfortable"
                  onChange={(_pagination, _filters, sorter) => handleSortChange(sorter)}
                  rowClassName={(record) =>
                    record.id === selectedRoleId ? "ant-table-row-selected" : ""
                  }
                  pagination={{
                    current: page,
                    pageSize: 30,
                    total: totalItems,
                    showSizeChanger: false,
                    onChange: setPage,
                  }}
                />
              </ConditionalRenderer>
            </DataLoader>
          </div>
        </div>

        {/* Role permissions drawer — slides in from right */}
        <RolePermissionsDrawer
          selectedRoleId={selectedRoleId}
          open={selectedRoleId !== null}
          onClose={closeDrawer}
        />

        {/* Modals */}
        <RoleFormModal
          open={createModalOpen || editTarget !== null}
          target={editTarget}
          onClose={() => {
            setCreateModalOpen(false);
            setEditTarget(null);
          }}
        />
        <DeleteRoleModal
          open={deleteTarget !== null}
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(deletedId) => {
            if (selectedRoleId === deletedId) closeDrawer();
          }}
        />
      </div>
    </PermissionGuard>
  );
}
