import { ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ASSESSMENT_FORMAT_OPTIONS,
  ASSESSMENT_FORMAT_TAG_COLORS,
  getAssessmentFormatLabel,
} from "@/shared/constants/priorQualificationTypeOptions";
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
  EyeOutlined,
  FilterOutlined,
  ImportOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Dropdown,
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
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { useQualificationTypeTab } from "../hooks/useQualificationTypeTab";
import type { PriorQualificationType } from "../types/prior-qualification-type";
import { formatScaleSummary } from "../utils/formatScaleSummary";
import { QualificationTypeDrawer } from "./QualificationTypeDrawer";
import { DeleteQualificationTypeModal } from "./modals/DeleteQualificationTypeModal";
import { ImportDefaultsSummaryModal } from "./modals/ImportDefaultsSummaryModal";
import { QualificationTypeFormModal } from "./modals/QualificationTypeFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const IS_ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function QualificationTypeTab() {
  const token = useToken();
  const { state, actions, flags } = useQualificationTypeTab();
  const {
    qualificationTypes,
    totalItems,
    isLoading,
    isError,
    sectionError,
    search,
    isActiveFilter,
    assessmentFormatFilter,
    page,
    itemsPerPage,
    formTarget,
    formOpen,
    deleteTarget,
    viewTarget,
    importSummary,
    importSummaryOpen,
    isImporting,
  } = state;

  const {
    handleSearchChange,
    handleIsActiveFilterChange,
    handleAssessmentFormatFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleOpenView,
    handleCloseView,
    handleImportDefaults,
    handleCloseImportSummary,
    clearAllFilters,
    refetch,
  } = actions;

  const { hasData, isFilterActive, isSearchActive, activeFilterCount, canEdit, canDelete } =
    flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const buildRowMenuItems = (
    record: PriorQualificationType,
  ): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        key: "view",
        label: "View details",
        icon: <EyeOutlined />,
        onClick: () => handleOpenView(record),
      },
    ];

    if (canEdit) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => handleOpenEdit(record),
      });
    }

    if (canDelete) {
      items.push({ type: "divider" });
      items.push({
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleOpenDelete(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<PriorQualificationType> = useMemo(
    () => [
    {
      title: "Code",
      key: "code",
      fixed: "left",
      width: 120,
      render: (_: unknown, row) => (
        <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
          {row.code}
        </Typography.Text>
      ),
    },
    {
      title: "Name",
      key: "name",
      render: (_: unknown, row) => (
        <Tooltip title={row.name}>
          <Button
            type="link"
            style={{ padding: 0, height: "auto", maxWidth: 280 }}
            onClick={() => handleOpenView(row)}
          >
            <Typography.Text strong ellipsis style={{ maxWidth: 280 }}>
              {row.name}
            </Typography.Text>
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Format",
      key: "assessmentFormat",
      width: 140,
      render: (_: unknown, row) => (
        <Tag color={ASSESSMENT_FORMAT_TAG_COLORS[row.assessmentFormat]}>
          {getAssessmentFormatLabel(row.assessmentFormat)}
        </Tag>
      ),
    },
    {
      title: "Scale",
      key: "scaleDefinition",
      width: 140,
      render: (_: unknown, row) => (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {formatScaleSummary(row)}
        </Typography.Text>
      ),
    },
    {
      title: "Active",
      key: "isActive",
      width: 100,
      render: (_: unknown, row) =>
        row.isActive ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 120,
      render: (_: unknown, row) => formatDate(row.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 56,
      fixed: "right",
      render: (_: unknown, record) => (
        <Dropdown
          menu={{ items: buildRowMenuItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            aria-label="Row actions"
            onClick={(event) => event.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ],
  [handleOpenDelete, handleOpenEdit, handleOpenView, token.fontSizeSM, canEdit, canDelete],
  );

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
        <Form.Item label="Assessment format" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any format"
            allowClear
            value={assessmentFormatFilter}
            onChange={handleAssessmentFormatFilterChange}
            style={{ width: "100%" }}
            options={ASSESSMENT_FORMAT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
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
        title="Qualification Types"
        body="Catalog of direct-entry qualification pathways. Seed defaults before configuring program requirements or DE candidate forms. Inactive types are hidden from form option resolvers but remain in historical data."
      />

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

        <Flex gap={8} wrap="wrap">
          <PermissionGuard permission={Permission.AdmissionPriorQualificationTypesCreate}>
            <Button
              icon={<ImportOutlined />}
              onClick={handleImportDefaults}
              loading={isImporting}
              disabled={isImporting}
            >
              Import defaults
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Qualification Type
            </Button>
          </PermissionGuard>
        </Flex>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load qualification types."}
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
            No qualification types yet. Import defaults or create one to start
            building your DE catalog.
          </Typography.Text>
          <Flex gap={8} justify="center" wrap="wrap">
            <PermissionGuard permission={Permission.AdmissionPriorQualificationTypesCreate}>
              <Button
                icon={<ImportOutlined />}
                onClick={handleImportDefaults}
                loading={isImporting}
                disabled={isImporting}
              >
                Import defaults
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                Create Qualification Type
              </Button>
            </PermissionGuard>
          </Flex>
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
            No qualification types match your search or filters.
          </Typography.Text>
          <Button type="link" onClick={clearAllFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<PriorQualificationType>
            rowKey="id"
            dataSource={qualificationTypes}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: true }}
            pagination={false}
          />
          <ConditionalRenderer when={totalItems > itemsPerPage}>
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
        </ConditionalRenderer>
      </DataLoader>

      <QualificationTypeFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteQualificationTypeModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <ImportDefaultsSummaryModal
        open={importSummaryOpen}
        result={importSummary}
        onClose={handleCloseImportSummary}
      />
      <QualificationTypeDrawer
        type={viewTarget}
        open={viewTarget !== null}
        onClose={handleCloseView}
        onEdit={(type) => {
          handleCloseView();
          handleOpenEdit(type);
        }}
        onDelete={(type) => {
          handleCloseView();
          handleOpenDelete(type);
        }}
      />
    </Flex>
  );
}
