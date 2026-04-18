// Feature: rbac-settings
import type { AccordionItem } from "@/components/ui-kit";
import { Accordion } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Tag, Typography } from "antd";
import { usePermissionsPanel } from "../../hooks/usePermissionsPanel";
import type { Permission as PermissionType } from "../../types/rbac";
import { groupPermissionsByResource } from "../../utils/groupPermissionsByResource";
import { DeletePermissionModal } from "../modals/DeletePermissionModal";
import { PermissionFormModal } from "../modals/PermissionFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PermissionRow({
  perm,
  onEdit,
  onDelete,
}: {
  perm: PermissionType;
  onEdit: (p: PermissionType) => void;
  onDelete: (p: PermissionType) => void;
}) {
  const token = useToken();
  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        padding: "8px 12px",
        borderRadius: token.borderRadiusSM,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        marginBottom: 6,
      }}
    >
      <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text strong style={{ fontSize: token.fontSize }}>
          {perm.name}
        </Typography.Text>
        <Flex align="center" gap={8}>
          <Tag style={{ fontSize: token.fontSizeSM - 1, margin: 0 }}>{perm.slug}</Tag>
          {perm.description && (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {perm.description}
            </Typography.Text>
          )}
        </Flex>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM - 1 }}>
          {formatDate(perm.createdAt)}
        </Typography.Text>
      </Flex>
      <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
        <PermissionGuard permission={Permission.PermissionsUpdate}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ fontSize: 15 }} />}
            onClick={() => onEdit(perm)}
            title="Edit"
          />
        </PermissionGuard>
        <PermissionGuard permission={Permission.PermissionsDelete}>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined style={{ fontSize: 15 }} />}
            onClick={() => onDelete(perm)}
            title="Delete"
          />
        </PermissionGuard>
      </Flex>
    </Flex>
  );
}

export function PermissionsPanel() {
  const token = useToken();
  const { state, actions, flags } = usePermissionsPanel();
  const {
    permissions,
    totalItems,
    isLoading,
    isError,
    search,
    page,
    createModalOpen,
    editTarget,
    deleteTarget,
  } = state;
  const {
    handleSearchChange,
    setCreateModalOpen,
    setEditTarget,
    setDeleteTarget,
    setPage,
    refetch,
  } = actions;
  const { hasData, isSearchActive } = flags;

  const groups = groupPermissionsByResource(permissions);

  const accordionItems: AccordionItem[] = groups.map((group) => ({
    key: group.resource,
    title: group.label,
    subtitle: `${group.permissions.length} permission${group.permissions.length !== 1 ? "s" : ""}`,
    content: (
      <div>
        {group.permissions.map((perm) => (
          <PermissionRow
            key={perm.id}
            perm={perm}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>
    ),
  }));

  return (
    <PermissionGuard permission={Permission.PermissionsList}>
      <Flex vertical gap={24} style={{ width: "100%", backgroundColor: token.colorBgElevated, border: `1px solid ${token.colorBorderSecondary}` }}>
        {/* Toolbar */}
        <Flex gap={12} align="center" wrap="wrap" style={{ padding: `${token.paddingSM}px ${token.paddingSM}px`}}>
          <PermissionGuard permission={Permission.PermissionsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              style={{ fontWeight: 600 }}
              block
            >
              Activate Permission
            </Button>
          </PermissionGuard>
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: "100%" }}
          />
        </Flex>

        {/* Content area */}
        <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
          {/* Error */}
          <ConditionalRenderer when={isError}>
            <ErrorAlert variant="section" error="Failed to load permissions" onRetry={refetch} />
          </ConditionalRenderer>

          {/* Empty — no search */}
          <ConditionalRenderer
            when={!isError && !hasData && !isSearchActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              No permissions activated yet. Activate your first permission to get started.
            </Typography.Text>
            <PermissionGuard permission={Permission.PermissionsCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
                style={{ fontWeight: 600 }}
              >
                Activate Permission
              </Button>
            </PermissionGuard>
          </ConditionalRenderer>

          {/* Empty — search active */}
          <ConditionalRenderer
            when={!isError && !hasData && isSearchActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              No permissions found matching your search.
            </Typography.Text>
            <Button type="link" onClick={() => handleSearchChange("")}>
              Clear search
            </Button>
          </ConditionalRenderer>

          {/* Grouped accordion */}
          <ConditionalRenderer when={!isError && hasData}>
            <Accordion
              items={accordionItems}
              expansionMode="single"
              size="md"
              density="comfortable"
            />
            {/* Pagination */}
            {totalItems > 30 && (
              <Flex justify="flex-end" style={{ marginTop: 16 }}>
                <Button.Group>
                  <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Button disabled={page * 30 >= totalItems} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </Button.Group>
              </Flex>
            )}
          </ConditionalRenderer>
        </DataLoader>

        {/* Modals */}
        <PermissionFormModal
          open={createModalOpen || editTarget !== null}
          target={editTarget}
          onClose={() => {
            setCreateModalOpen(false);
            setEditTarget(null);
          }}
        />
        <DeletePermissionModal
          open={deleteTarget !== null}
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      </Flex>
    </PermissionGuard>
  );
}
