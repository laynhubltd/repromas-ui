import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  COUNTER_PARTITION_OPTIONS,
  MATRIC_FORMAT_SLOT_FILTER_OPTIONS,
  MATRIC_FORMAT_STATUS_OPTIONS,
  MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
  MATRIC_NUMBER_FORMAT_UI_COPY,
  matricFormatStatusColorByValue,
  matricFormatStatusLabelByValue,
  matricSlotKey,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { FilterOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Dropdown, Flex, Form, Input, Popover, Row, Select, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { FormatBuilderDrawer } from "./FormatBuilderDrawer";
import { MatricFormatSlotOverview } from "./MatricFormatSlotOverview";
import { PrerequisitesBanner } from "./PrerequisitesBanner";
import { ActivateMatricNumberFormatModal } from "./modals/ActivateMatricNumberFormatModal";
import { CreateMatricNumberFormatModal } from "./modals/CreateMatricNumberFormatModal";
import { DeactivateMatricNumberFormatModal } from "./modals/DeactivateMatricNumberFormatModal";
import { DuplicateMatricNumberFormatModal } from "./modals/DuplicateMatricNumberFormatModal";
import { ReactivateMatricNumberFormatModal } from "./modals/ReactivateMatricNumberFormatModal";
import { useMatricNumberFormatTab } from "../hooks/useMatricNumberFormatTab";
import type { MatricNumberFormat } from "../types/matric-number-format";
import { formatDate, truncateTemplateSnippet } from "../utils/templateTokenHelpers";

const partitionLabelByValue = Object.fromEntries(
  COUNTER_PARTITION_OPTIONS.map((o) => [o.value, o.label]),
);

const laneFilterOptions = MATRIC_FORMAT_SLOT_FILTER_OPTIONS.map((o) => ({
  value: o.value === "ANY" ? "ANY" : matricSlotKey(o.value),
  label: o.label,
}));

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
    activeSlots,
    currentSessionId,
    sessionLabel,
    slotsLoading,
    slotsSectionError,
    draftCount,
    prerequisites,
    search,
    statusFilter,
    entryModeFilter,
    page,
    builderFormatId,
    builderReadOnly,
    builderOpen,
    createOpen,
    createEntryMode,
    duplicateTarget,
    activateTarget,
    deactivateTarget,
    reactivateTarget,
    getActivateSlotPeer,
    matricSlotLabel,
  } = state;

  const {
    handleSearchChange,
    handleStatusFilterChange,
    handleEntryModeFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenCreateForSlot,
    handleCloseCreate,
    handleCloseBuilder,
    handleOpenDuplicate,
    handleCloseDuplicate,
    handleOpenActivate,
    handleCloseActivate,
    handleCloseDeactivate,
    handleCloseReactivate,
    handleOpenBuilder,
    handleCreated,
    handleDuplicated,
    clearAllFilters,
    buildRowMenuItems,
    refetch,
    refetchActiveSlots,
  } = actions;

  const { hasData, isFilterActive, isSearchActive, activeFilterCount } = flags;

  const cardState = isLoading ? "loading" : "default";
  const isSearchOrFilterActive = isSearchActive || isFilterActive;

  const entryModeFilterKey =
    entryModeFilter === "ANY" ? "ANY" : matricSlotKey(entryModeFilter);

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Status" style={{ marginBottom: 12 }}>
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
        <Form.Item label="Lane" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any lane"
            value={entryModeFilterKey}
            onChange={(value: string) => {
              if (value === "ANY") {
                handleEntryModeFilterChange("ANY");
                return;
              }
              const slot = MATRIC_FORMAT_SLOT_FILTER_OPTIONS.find(
                (o) => o.value !== "ANY" && matricSlotKey(o.value) === value,
              );
              if (slot && slot.value !== "ANY") {
                handleEntryModeFilterChange(slot.value);
              }
            }}
            style={{ width: "100%" }}
            options={laneFilterOptions}
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
      title: "Lane",
      dataIndex: "entryMode",
      key: "entryMode",
      render: (entryMode: MatricNumberFormat["entryMode"]) => (
        <Tag>{matricSlotLabel(entryMode)}</Tag>
      ),
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
      width: 56,
      fixed: "right",
      render: (_: unknown, record: MatricNumberFormat) => (
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

      <MatricFormatSlotOverview
        slots={activeSlots}
        currentSessionId={currentSessionId}
        sessionLabel={sessionLabel}
        isLoading={slotsLoading}
        sectionError={slotsSectionError}
        onViewFormat={(format) => handleOpenBuilder(format, true)}
        onCreateForSlot={handleOpenCreateForSlot}
        onRetry={refetchActiveSlots}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Drafts"
            value={draftCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
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
        initialEntryMode={createEntryMode}
        lanePresetLocked={createEntryMode !== undefined}
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
        slotPeer={getActivateSlotPeer(activateTarget)}
        onClose={handleCloseActivate}
      />

      <DeactivateMatricNumberFormatModal
        open={deactivateTarget !== null}
        target={deactivateTarget}
        onClose={handleCloseDeactivate}
      />

      <ReactivateMatricNumberFormatModal
        open={reactivateTarget !== null}
        target={reactivateTarget}
        activeSlots={activeSlots}
        onClose={handleCloseReactivate}
      />

      <FormatBuilderDrawer
        formatId={builderFormatId}
        readOnly={builderReadOnly}
        open={builderOpen}
        onClose={handleCloseBuilder}
        prerequisites={prerequisites}
        activeSlots={activeSlots}
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
