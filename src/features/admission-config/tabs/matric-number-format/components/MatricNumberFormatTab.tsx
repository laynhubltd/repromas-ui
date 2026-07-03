import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  COUNTER_PARTITION_OPTIONS,
  MATRIC_FORMAT_STATUS_OPTIONS,
  MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
  MATRIC_NUMBER_FORMAT_UI_COPY,
  matricFormatStatusColorByValue,
  matricFormatStatusLabelByValue,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { FormatBuilderDrawer } from "./FormatBuilderDrawer";
import { PrerequisitesBanner } from "./PrerequisitesBanner";
import { ActivateMatricNumberFormatModal } from "./modals/ActivateMatricNumberFormatModal";
import { CreateMatricNumberFormatModal } from "./modals/CreateMatricNumberFormatModal";
import { DuplicateMatricNumberFormatModal } from "./modals/DuplicateMatricNumberFormatModal";
import { useMatricNumberFormatTab } from "../hooks/useMatricNumberFormatTab";
import type { MatricNumberFormat } from "../types/matric-number-format";
import { formatDate, isPrerequisitesReadyForTemplate, truncateTemplateSnippet } from "../utils/templateTokenHelpers";

const partitionLabelByValue = Object.fromEntries(
  COUNTER_PARTITION_OPTIONS.map((o) => [o.value, o.label]),
);

export function MatricNumberFormatTab() {
  const token = useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const { state, actions, flags } = useMatricNumberFormatTab();

  const {
    formats,
    totalItems,
    isLoading,
    isError,
    sectionError,
    activeFormat,
    draftCount,
    prerequisites,
    search,
    statusFilter,
    page,
    builderFormatId,
    builderReadOnly,
    builderOpen,
    createOpen,
    duplicateTarget,
    activateTarget,
  } = state;

  const {
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleCloseCreate,
    handleOpenBuilder,
    handleCloseBuilder,
    handleOpenDuplicate,
    handleCloseDuplicate,
    handleOpenActivate,
    handleCloseActivate,
    handleCreated,
    handleDuplicated,
    clearAllFilters,
    refetch,
  } = actions;

  const { hasData, isFilterActive, isSearchActive, activeFilterCount } = flags;

  const cardState = isLoading ? "loading" : "default";
  const isSearchOrFilterActive = isSearchActive || isFilterActive;

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: "100%" }}
            options={MATRIC_FORMAT_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button type="link" size="small" onClick={clearAllFilters} style={{ padding: 0 }}>
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  const columns: ColumnsType<MatricNumberFormat> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Typography.Text strong>{code}</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: MatricNumberFormat["status"]) => (
        <Tag color={matricFormatStatusColorByValue[status]}>
          {matricFormatStatusLabelByValue[status]}
        </Tag>
      ),
    },
    {
      title: "Template",
      dataIndex: "template",
      key: "template",
      render: (template: string) => (
        <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
          {truncateTemplateSnippet(template, 36)}
        </Typography.Text>
      ),
    },
    {
      title: "Partition",
      dataIndex: "counterPartition",
      key: "counterPartition",
      render: (value: MatricNumberFormat["counterPartition"]) =>
        partitionLabelByValue[value] ?? value,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (v: string) => formatDate(v),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_: unknown, record: MatricNumberFormat) => (
        <Flex justify="flex-end" gap={4}>
          <ConditionalRenderer when={record.status === "DRAFT"}>
            <PermissionGuard permission={Permission.MatricNumberFormatsUpdate}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                title="Edit"
                onClick={() => handleOpenBuilder(record, false)}
              />
            </PermissionGuard>
            <PermissionGuard permission={Permission.MatricNumberFormatsActivate}>
              <Button
                type="text"
                size="small"
                icon={<RocketOutlined />}
                title="Activate"
                disabled={!isPrerequisitesReadyForTemplate(prerequisites, record.template)}
                onClick={() => handleOpenActivate(record)}
              />
            </PermissionGuard>
          </ConditionalRenderer>
          <ConditionalRenderer when={record.status !== "DRAFT"}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              title="View"
              onClick={() => handleOpenBuilder(record, true)}
            />
            <PermissionGuard permission={Permission.MatricNumberFormatsCreate}>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                title="Duplicate"
                onClick={() => handleOpenDuplicate(record)}
              />
            </PermissionGuard>
          </ConditionalRenderer>
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title={MATRIC_NUMBER_FORMAT_UI_COPY.explainerTitle}
        body={MATRIC_NUMBER_FORMAT_UI_COPY.explainerBody}
        dismissible
        collapsible
      />

      <PrerequisitesBanner prerequisites={prerequisites} />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Live Format"
            value={activeFormat?.code ?? "None"}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Drafts"
            value={draftCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Formats"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" wrap="wrap">
        <Input
          placeholder="Search by code…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 240 }}
        />
        <Popover
          content={filterContent}
          title={
            <span>
              <FilterOutlined /> Filters
            </span>
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
        <PermissionGuard permission={Permission.MatricNumberFormatsCreate}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Create Draft
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load matric number formats"}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No matric number formats configured yet.
          </Typography.Text>
          <PermissionGuard permission={Permission.MatricNumberFormatsCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Create Draft
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">No formats match your search or filters.</Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<MatricNumberFormat>
            rowKey="id"
            dataSource={formats}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: true }}
            pagination={{
              current: page,
              pageSize: MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
              total: totalItems,
              onChange: handlePageChange,
              showSizeChanger: false,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <CreateMatricNumberFormatModal
        open={createOpen}
        onClose={handleCloseCreate}
        onCreated={handleCreated}
      />

      <DuplicateMatricNumberFormatModal
        open={duplicateTarget !== null}
        target={duplicateTarget}
        onClose={handleCloseDuplicate}
        onDuplicated={handleDuplicated}
      />

      <ActivateMatricNumberFormatModal
        open={activateTarget !== null}
        target={activateTarget}
        activeFormat={activeFormat}
        onClose={handleCloseActivate}
      />

      <FormatBuilderDrawer
        formatId={builderFormatId}
        readOnly={builderReadOnly}
        open={builderOpen}
        onClose={handleCloseBuilder}
        prerequisites={prerequisites}
        onActivate={() => {
          const draft = formats.find((f) => f.id === builderFormatId);
          if (draft) handleOpenActivate(draft);
        }}
        onDuplicate={() => {
          const current = formats.find((f) => f.id === builderFormatId);
          if (current) handleOpenDuplicate(current);
        }}
      />
    </Flex>
  );
}
