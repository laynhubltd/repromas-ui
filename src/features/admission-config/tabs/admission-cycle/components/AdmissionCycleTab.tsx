import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ExplainerCallout, DashCard } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  ADMISSION_CYCLE_ENTRY_MODE_OPTIONS,
  ADMISSION_CYCLE_ITEMS_PER_PAGE,
  ADMISSION_CYCLE_STATUS_OPTIONS,
  ADMISSION_CYCLE_UI_COPY,
  identityModeColorByValue,
  identityModeLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Popover,
  Row,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useAdmissionCycleTab } from "../hooks/useAdmissionCycleTab";
import type { AdmissionCycleRow } from "../hooks/useAdmissionCycleTab";
import type { AdmissionIdentityMode } from "../types/admission-cycle";
import { formatEntryBatchLabel } from "../utils/admissionCycleDisplay";
import { AdmissionCycleRowActions } from "./AdmissionCycleStatusAction";
import { AdmissionCycleFormModal } from "./modals/AdmissionCycleFormModal";
import { DeleteAdmissionCycleModal } from "./modals/DeleteAdmissionCycleModal";
import { TransitionAdmissionCycleModal } from "./modals/TransitionAdmissionCycleModal";

const statusColorByValue = Object.fromEntries(
  ADMISSION_CYCLE_STATUS_OPTIONS.map((opt) => [opt.value, opt.color]),
) as Record<string, string>;

const statusLabelByValue = Object.fromEntries(
  ADMISSION_CYCLE_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdmissionCycleTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const { state, actions, flags } = useAdmissionCycleTab();
  const {
    cycles,
    totalItems,
    isLoading,
    isError,
    search,
    statusFilter,
    sessionFilter,
    entryModeFilter,
    batchNoFilter,
    page,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    transitionTarget,
    transitionDirection,
    transitionOpen,
    sessions,
    existingCycles,
    totalCyclesCount,
    activeCyclesCount,
    openForApplicationsCount,
    currentSessionCyclesCount,
    isMetricsRowLoading,
  } = state;
  const {
    handleSearchChange,
    handleStatusFilterChange,
    handleSessionFilterChange,
    handleEntryModeFilterChange,
    handleBatchNoFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleOpenTransition,
    handleCloseTransition,
    clearAllFilters,
    refetch,
  } = actions;
  const { hasData, isFilterActive, activeFilterCount } = flags;

  const cardState = isMetricsRowLoading ? "loading" : "default";

  const transitionSessionName = useMemo(() => {
    if (!transitionTarget) return undefined;
    return sessions.find((s) => s.id === transitionTarget.sessionId)?.name;
  }, [transitionTarget, sessions]);

  const columns: ColumnsType<AdmissionCycleRow> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 240,
      fixed: "left",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Session",
      key: "session",
      width: 180,
      render: (_, record) => (
        <Flex gap={8} align="center" wrap="wrap">
          <Typography.Text>{record.sessionName}</Typography.Text>
          <ConditionalRenderer when={record.isCurrentSession}>
            <Tag color="blue">Current</Tag>
          </ConditionalRenderer>
        </Flex>
      ),
    },
    {
      title: ADMISSION_CYCLE_UI_COPY.entryBatchColumn,
      key: "entryBatch",
      width: 160,
      render: (_, record) => (
        <Tag>{formatEntryBatchLabel(record.entryMode, record.batchNo)}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: string) => (
        <Tag color={statusColorByValue[status] ?? "default"}>
          {statusLabelByValue[status] ?? status}
        </Tag>
      ),
    },
    {
      title: "Identity mode",
      dataIndex: "admissionIdentityMode",
      key: "admissionIdentityMode",
      width: 160,
      render: (mode: AdmissionIdentityMode) => (
        <Tag color={identityModeColorByValue[mode] ?? "default"}>
          {identityModeLabelByValue[mode] ?? mode}
        </Tag>
      ),
    },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      width: 130,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      width: 130,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <AdmissionCycleRowActions
          cycle={record}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onTransition={handleOpenTransition}
        />
      ),
    },
  ];

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Status" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: "100%" }}
            options={ADMISSION_CYCLE_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
        <Form.Item label="Session" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any session"
            allowClear
            value={sessionFilter}
            onChange={handleSessionFilterChange}
            style={{ width: "100%" }}
            options={sessions.map((session) => ({
              value: session.id,
              label: session.isCurrent
                ? `${session.name} (Current)`
                : session.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="Entry mode" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any entry mode"
            allowClear
            value={entryModeFilter}
            onChange={handleEntryModeFilterChange}
            style={{ width: "100%" }}
            options={ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
        <Form.Item label="Batch number" style={{ marginBottom: 0 }}>
          <InputNumber
            placeholder="Any batch"
            min={1}
            precision={0}
            value={batchNoFilter}
            onChange={(value) =>
              handleBatchNoFilterChange(
                value !== null && value !== undefined ? value : undefined,
              )
            }
            style={{ width: "100%" }}
          />
        </Form.Item>
        <ConditionalRenderer when={activeFilterCount > 0}>
          <Button
            type="link"
            onClick={() => {
              clearAllFilters();
              setFilterPopoverOpen(false);
            }}
            style={{ padding: 0, marginTop: 8 }}
          >
            Clear all filters
          </Button>
        </ConditionalRenderer>
      </Form>
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="Admission Cycles"
        body="An admission cycle is the top-level container for one admission exercise. Each academic session can run separate cycles for UTME, Direct Entry, and Transfer, with multiple batches per entry mode when needed (e.g. a second UTME batch). During pre-processing, choose JAMB/CAPS or open admission — this drives the public candidate sign-up flow. Identity mode cannot be changed after applications open. Cycles advance one step at a time; rollbacks require a reason."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Cycles"
            value={totalCyclesCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Active Cycles"
            value={activeCyclesCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title={ADMISSION_CYCLE_UI_COPY.openForApplicationsMetric}
            value={openForApplicationsCount}
            state={cardState}
            size="md"
            density="comfortable"
            meta={
              currentSessionCyclesCount > 0
                ? `${currentSessionCyclesCount} in current session`
                : undefined
            }
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search cycles by name…"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />

          <Popover
            content={filterPopoverContent}
            title={
              <span>
                <FilterOutlined /> Filters
              </span>
            }
            trigger="click"
            arrow={false}
            placement="bottomLeft"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
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

        <PermissionGuard permission={Permission.AdmissionCyclesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Cycle
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load admission cycles."
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!hasData && !isFilterActive && !isError}>
          <Flex
            vertical
            gap={16}
            align="center"
            justify="center"
            style={{
              padding: 48,
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            }}
          >
            <Typography.Text type="secondary">
              No admission cycles configured yet. Create a cycle for the current
              academic session to begin setup.
            </Typography.Text>
            <PermissionGuard permission={Permission.AdmissionCyclesCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                Create Cycle
              </Button>
            </PermissionGuard>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!hasData && isFilterActive && !isError}>
          <Flex
            vertical
            gap={8}
            align="center"
            justify="center"
            style={{
              padding: 48,
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            }}
          >
            <Typography.Text type="secondary">
              No cycles match your search or filters.
            </Typography.Text>
            <Button type="link" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table
            columns={columns}
            dataSource={cycles}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={{
              current: page,
              pageSize: ADMISSION_CYCLE_ITEMS_PER_PAGE,
              total: totalItems,
              onChange: handlePageChange,
              showSizeChanger: false,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <AdmissionCycleFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        sessions={sessions}
        existingCycles={existingCycles}
      />
      <DeleteAdmissionCycleModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <TransitionAdmissionCycleModal
        open={transitionOpen}
        target={transitionTarget}
        direction={transitionDirection}
        sessionName={transitionSessionName}
        onClose={handleCloseTransition}
      />
    </Flex>
  );
}
