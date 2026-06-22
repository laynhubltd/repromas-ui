import { ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Flex,
  Form,
  Input,
  Pagination,
  Popover,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useDocumentTypeTab } from "../hooks/useDocumentTypeTab";
import type { AdmissionDocumentType } from "../types/document-type";
import { DeleteDocumentTypeModal } from "./modals/DeleteDocumentTypeModal";
import { DocumentTypeFormModal } from "./modals/DocumentTypeFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const IS_ACTIVE_OPTIONS = [
  { value: "true",  label: "Active" },
  { value: "false", label: "Inactive" },
];

const IS_REQUIRED_OPTIONS = [
  { value: "true",  label: "Required" },
  { value: "false", label: "Optional" },
];

export function DocumentTypeTab() {
  const token = useToken();
  const { state, actions, flags } = useDocumentTypeTab();
  const {
    documentTypes,
    totalItems,
    isLoading,
    isError,
    sectionError,
    search,
    isActiveFilter,
    isRequiredFilter,
    page,
    itemsPerPage,
    formTarget,
    formOpen,
    deleteTarget,
  } = state;

  const {
    handleSearchChange,
    handleIsActiveFilterChange,
    handleIsRequiredFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    clearAllFilters,
    refetch,
  } = actions;

  const { hasData, isFilterActive, isSearchActive, activeFilterCount } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns: ColumnsType<AdmissionDocumentType> = [
    {
      title: "Name",
      key: "name",
      fixed: "left",
      render: (_: unknown, r: AdmissionDocumentType) => (
        <Typography.Text strong>{r.name}</Typography.Text>
      ),
    },
    {
      title: "Code",
      key: "code",
      render: (_: unknown, r: AdmissionDocumentType) => (
        <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
          {r.code}
        </Typography.Text>
      ),
    },
    {
      title: "MIME Types",
      key: "mimeTypes",
      render: (_: unknown, r: AdmissionDocumentType) => (
        <Flex wrap="wrap" gap={4}>
          {r.mimeTypes.map((mime) => (
            <Tag key={mime} style={{ fontSize: token.fontSizeSM }}>
              {mime}
            </Tag>
          ))}
        </Flex>
      ),
    },
    {
      title: "Max Size",
      key: "maxSizeMb",
      width: 100,
      render: (_: unknown, r: AdmissionDocumentType) => `${r.maxSizeMb} MB`,
    },
    {
      title: "Required",
      key: "isRequired",
      width: 100,
      render: (_: unknown, r: AdmissionDocumentType) =>
        r.isRequired ? (
          <Tag color="blue">Required</Tag>
        ) : (
          <Tag color="default">Optional</Tag>
        ),
    },
    {
      title: "Status",
      key: "isActive",
      width: 100,
      render: (_: unknown, r: AdmissionDocumentType) =>
        r.isActive ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: "Updated",
      key: "updatedAt",
      width: 120,
      render: (_: unknown, r: AdmissionDocumentType) => formatDate(r.updatedAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 80,
      fixed: "right",
      render: (_: unknown, record: AdmissionDocumentType) => (
        // 2 actions → inline per Action Density Rule (≤ 2 = inline)
        <Space size={4}>
          <PermissionGuard permission={Permission.AdmissionDocumentTypesUpdate}>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionDocumentTypesDelete}>
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleOpenDelete(record)}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  // ─── Filter popover content ───────────────────────────────────────────────
  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Status" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={
              isActiveFilter !== undefined ? String(isActiveFilter) : undefined
            }
            onChange={(val) =>
              handleIsActiveFilterChange(
                val === undefined ? undefined : val === "true",
              )
            }
            style={{ width: "100%" }}
            options={IS_ACTIVE_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Required" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any"
            allowClear
            value={
              isRequiredFilter !== undefined
                ? String(isRequiredFilter)
                : undefined
            }
            onChange={(val) =>
              handleIsRequiredFilterChange(
                val === undefined ? undefined : val === "true",
              )
            }
            style={{ width: "100%" }}
            options={IS_REQUIRED_OPTIONS}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={clearAllFilters}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Flex
      vertical
      gap={24}
      style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}
    >
      <ExplainerCallout
        intent="info"
        collapsible
        title="Document Types"
        body="Define the catalog of documents candidates may be required to upload (e.g. Birth Certificate, WAEC Result). Each type has a unique immutable code, accepted MIME types, and a max file size. Active types appear as options in the Form Builder's FILE field. Deactivate rather than delete types that have been used in forms or uploads."
      />

      {/* Toolbar */}
      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 240 }}
          />

          <Popover
            content={filterContent}
            title={
              <Space>
                <FilterOutlined />
                <span>Filters</span>
              </Space>
            }
            trigger="click"
            open={filterOpen}
            onOpenChange={setFilterOpen}
            placement="bottomLeft"
            arrow={false}
          >
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                type={activeFilterCount > 0 ? "primary" : "default"}
              >
                Filters
              </Button>
            </Badge>
          </Popover>
        </Flex>

        <PermissionGuard permission={Permission.AdmissionDocumentTypesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Document Type
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Table */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load document types."}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isFilterActive && !isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16 }}
          >
            No document types yet. Create one to start building your admission
            document catalog.
          </Typography.Text>
          <PermissionGuard permission={Permission.AdmissionDocumentTypesCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Create Document Type
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && (isFilterActive || isSearchActive)}
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
            No document types match your search or filters.
          </Typography.Text>
          <Button type="link" onClick={clearAllFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<AdmissionDocumentType>
            rowKey="id"
            dataSource={documentTypes}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: true }}
            pagination={false}
          />
          <Flex justify="flex-end" style={{ marginTop: token.marginMD }}>
            <Pagination
              current={page}
              pageSize={itemsPerPage}
              total={totalItems}
              showSizeChanger={false}
              onChange={handlePageChange}
            />
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      {/* Modals */}
      <DocumentTypeFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteDocumentTypeModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
