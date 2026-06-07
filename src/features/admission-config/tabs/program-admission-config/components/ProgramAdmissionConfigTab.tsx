import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  QUOTA_FILTER_OPTIONS,
} from "@/shared/constants/programAdmissionConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Flex,
  Form,
  Input,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useProgramAdmissionConfigTab } from "../hooks/useProgramAdmissionConfigTab";
import type { ProgramAdmissionConfig } from "../types/program-admission-config";
import { computeQuotaSeats } from "../utils/seatMath";
import { DeleteProgramAdmissionConfigModal } from "./modals/DeleteProgramAdmissionConfigModal";
import { ProgramAdmissionConfigFormModal } from "./modals/ProgramAdmissionConfigFormModal";

export function ProgramAdmissionConfigTab() {
  const token = useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const { state, actions, flags } = useProgramAdmissionConfigTab();
  const {
    configs,
    allConfigs,
    programs,
    configuredProgramCount,
    missingProgramCount,
    totalCapacity,
    fullQuotaProgramCount,
    isLoading,
    isError,
    search,
    programFilter,
    quotaFilter,
    activeFilterCount,
    formOpen,
    formTarget,
    deleteOpen,
    deleteTarget,
  } = state;
  const {
    handleSearchChange,
    handleProgramFilterChange,
    handleQuotaFilterChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleClearFilters,
    refetch,
  } = actions;
  const { hasData, isSearchOrFilterActive } = flags;

  const programOptions = useMemo(
    () =>
      programs.map((program) => ({
        value: program.id,
        label: program.department?.name
          ? `${program.name} (${program.department.name})`
          : program.name,
      })),
    [programs],
  );

  const columns: ColumnsType<ProgramAdmissionConfig> = [
    {
      title: "Program",
      dataIndex: ["program", "name"],
      key: "program",
      width: 220,
      fixed: "left",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>
            {record.program?.name ?? "Unknown program"}
          </Typography.Text>
          <Typography.Text type="secondary">
            {record.program?.department?.name ?? "Department not loaded"}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Capacity",
      dataIndex: "totalCapacity",
      key: "totalCapacity",
      width: 110,
    },
    {
      title: "Quota Split",
      key: "quotaSplit",
      width: 180,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          <Tag color="blue">M {record.meritPercentage}%</Tag>
          <Tag color="purple">C {record.catchmentPercentage}%</Tag>
          <Tag color="gold">E {record.eldsPercentage}%</Tag>
        </Space>
      ),
    },
    {
      title: "Cut-offs",
      key: "cutoffs",
      width: 180,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          <Tag>M {record.meritCutoff}</Tag>
          <Tag>C {record.catchmentCutoff}</Tag>
          <Tag>E {record.eldsCutoff}</Tag>
        </Space>
      ),
    },
    {
      title: "Slots Used / Available",
      key: "seats",
      width: 280,
      render: (_, record) => {
        const seats = computeQuotaSeats(record);
        return (
          <Space orientation="vertical" size={0}>
            <Typography.Text type="secondary">
              Merit: {record.meritSeatsUsed} / {seats.meritAvailable}
            </Typography.Text>
            <Typography.Text type="secondary">
              Catchment: {record.catchmentSeatsUsed} / {seats.catchmentAvailable}
            </Typography.Text>
            <Typography.Text type="secondary">
              ELDS: {record.eldsSeatsUsed} / {seats.eldsAvailable}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => {
        const seats = computeQuotaSeats(record);
        const hasZeroCutoff =
          Number(record.meritCutoff) === 0 ||
          Number(record.catchmentCutoff) === 0 ||
          Number(record.eldsCutoff) === 0;
        const quotaFull =
          seats.meritAvailable === 0 ||
          seats.catchmentAvailable === 0 ||
          seats.eldsAvailable === 0;
        return (
          <Space size={[4, 4]} wrap>
            <ConditionalRenderer when={quotaFull}>
              <Tag color="warning">Quota full</Tag>
            </ConditionalRenderer>
            <ConditionalRenderer when={hasZeroCutoff}>
              <Tag color="error">Zero cut-off</Tag>
            </ConditionalRenderer>
            <ConditionalRenderer when={!quotaFull && !hasZeroCutoff}>
              <Tag color="success">Healthy</Tag>
            </ConditionalRenderer>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleOpenDelete(record)}
            />
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Program" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any program"
            allowClear
            showSearch
            optionFilterProp="label"
            value={programFilter}
            onChange={handleProgramFilterChange}
            options={programOptions}
          />
        </Form.Item>
        <Form.Item label="Quota Health" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any health"
            allowClear
            value={quotaFilter}
            onChange={handleQuotaFilterChange}
            options={QUOTA_FILTER_OPTIONS}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button type="link" size="small" onClick={handleClearFilters} style={{ padding: 0 }}>
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Flex vertical gap={24}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="Admission Cut-offs and Quota"
        body="Set per-program capacity, federal-character quota split (Merit/Catchment/ELDS), and minimum aggregate cut-offs used by admission offers. Quota slots are computed using floor(capacity × percentage)."
      />

      <Flex gap={16} wrap="wrap">
        <DashCard title="Programs Configured" value={configuredProgramCount} state={isLoading ? "loading" : "default"} />
        <DashCard title="Programs Missing Config" value={missingProgramCount} state={isLoading ? "loading" : "default"} />
        <DashCard title="Total Capacity (Filtered)" value={totalCapacity} state={isLoading ? "loading" : "default"} />
        <DashCard title="Programs With Full Quota" value={fullQuotaProgramCount} state={isLoading ? "loading" : "default"} />
      </Flex>

      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex align="center" gap={12} wrap="wrap">
          <Input
            placeholder="Search by program or department..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            allowClear
            style={{ minWidth: 260, maxWidth: 340 }}
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
        </Flex>

        <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsCreate}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Create Config
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load admission cut-offs/quota."
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
          <Typography.Text type="secondary" style={{ marginBottom: 12 }}>
            No program admission configs yet. Create your first quota and cut-off rule.
          </Typography.Text>
          <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Create Config
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
          <Typography.Text type="secondary" style={{ marginBottom: 8 }}>
            No results match your search or filter selection.
          </Typography.Text>
          <Button type="link" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={configs}
            pagination={false}
            scroll={{ x: 1220 }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <ProgramAdmissionConfigFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        programs={programs}
        configs={allConfigs}
      />
      <DeleteProgramAdmissionConfigModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
