import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { QUOTA_FILTER_OPTIONS } from "@/shared/constants/programAdmissionConfigOptions";
import { useIsMobile } from "@/hooks/useBreakpoint";
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
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
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
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useProgramAdmissionConfigTab } from "../hooks/useProgramAdmissionConfigTab";
import type { ProgramAdmissionConfig } from "../types/program-admission-config";
import { formatGateSummaryTags, formatJambFloor } from "../utils/configDisplay";
import { computeQuotaSeats } from "../utils/seatMath";
import { ProgramAdmissionConfigDrawer } from "./ProgramAdmissionConfigDrawer";
import { DeleteProgramAdmissionConfigModal } from "./modals/DeleteProgramAdmissionConfigModal";
import { ProgramAdmissionConfigFormModal } from "./modals/ProgramAdmissionConfigFormModal";

export function ProgramAdmissionConfigTab() {
  const token = useToken();
  const isMobile = useIsMobile();
  const [filterOpen, setFilterOpen] = useState(false);
  const { state, actions, flags } = useProgramAdmissionConfigTab();
  const {
    configs,
    programs,
    configuredProgramCount,
    missingProgramCount,
    totalCapacity,
    fullQuotaProgramCount,
    isLoading,
    isError,
    sectionErrorMessage,
    programNameSearch,
    departmentNameSearch,
    programFilter,
    quotaFilter,
    page,
    itemsPerPage,
    totalItems,
    activeFilterCount,
    isQuotaHealthFilterActive,
    formOpen,
    formTarget,
    deleteOpen,
    deleteTarget,
    drawerOpen,
    drawerTarget,
  } = state;
  const {
    handleProgramNameSearchChange,
    handleDepartmentNameSearchChange,
    handleProgramFilterChange,
    handleQuotaFilterChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleOpenDrawer,
    handleCloseDrawer,
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

  const buildRowMenuItems = (
    record: ProgramAdmissionConfig,
  ): MenuProps["items"] => [
    {
      key: "view",
      label: "View details",
      icon: <EyeOutlined />,
      onClick: () => handleOpenDrawer(record),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => handleOpenEdit(record),
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleOpenDelete(record),
    },
  ];

  const columns: ColumnsType<ProgramAdmissionConfig> = [
    {
      title: "Program",
      dataIndex: ["program", "name"],
      key: "program",
      width: 220,
      fixed: "left",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Link onClick={() => handleOpenDrawer(record)}>
            <Typography.Text strong>
              {record.program?.name ?? "Unknown program"}
            </Typography.Text>
          </Typography.Link>
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
      title: "Eligibility gates",
      key: "eligibility",
      width: 200,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {formatGateSummaryTags(record).map((label) => (
            <Tag key={label}>{label}</Tag>
          ))}
          {record.minimumJambScore != null && (
            <Tag color="geekblue">JAMB {formatJambFloor(record)}</Tag>
          )}
        </Space>
      ),
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
      align: "center",
      render: (_, record) => (
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
        <Form.Item
          label="Quota Health"
          style={{ marginBottom: 0 }}
          extra="Narrows the current page only. Clear it to browse all pages."
        >
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
        <Button
          type="link"
          size="small"
          onClick={handleClearFilters}
          style={{ padding: 0 }}
        >
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
        body="Set per-program capacity, federal-character quota split (Merit/Catchment/ELDS), and minimum aggregate cut-offs used after scoring. O-Level credit gates are a pre-check on the Direct Entry lane before program subject rules apply."
      />

      <Flex gap={16} wrap="wrap">
        <DashCard
          title="Programs Configured"
          value={configuredProgramCount}
          state={isLoading ? "loading" : "default"}
        />
        <DashCard
          title="Programs Missing Config"
          value={missingProgramCount}
          state={isLoading ? "loading" : "default"}
        />
        <DashCard
          title="Total Capacity (Page)"
          value={totalCapacity}
          state={isLoading ? "loading" : "default"}
        />
        <DashCard
          title="Programs With Full Quota (Page)"
          value={fullQuotaProgramCount}
          state={isLoading ? "loading" : "default"}
        />
      </Flex>

      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex align="center" gap={12} wrap={isMobile ? "wrap" : "nowrap"}>
          <Input
            placeholder="Search by program name..."
            value={programNameSearch}
            onChange={(event) =>
              handleProgramNameSearchChange(event.target.value)
            }
            allowClear
            style={isMobile ? { width: "100%" } : { minWidth: 220, maxWidth: 280 }}
          />
          <Input
            placeholder="Search by department name..."
            value={departmentNameSearch}
            onChange={(event) =>
              handleDepartmentNameSearchChange(event.target.value)
            }
            allowClear
            style={isMobile ? { width: "100%" } : { minWidth: 220, maxWidth: 280 }}
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

        <PermissionGuard
          permission={Permission.AdmissionProgramAdmissionConfigsCreate}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Create Config
          </Button>
        </PermissionGuard>
      </Flex>

      <ConditionalRenderer when={isQuotaHealthFilterActive}>
        <Typography.Text type="secondary">
          Quota health filter is applied to the current page only. Clear it to
          browse all pages.
        </Typography.Text>
      </ConditionalRenderer>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionErrorMessage}
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
            No program admission configs yet. Create your first quota and
            cut-off rule.
          </Typography.Text>
          <PermissionGuard
            permission={Permission.AdmissionProgramAdmissionConfigsCreate}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
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
            scroll={{ x: 1100 }}
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

      {formOpen && (
        <ProgramAdmissionConfigFormModal
          open={formOpen}
          target={formTarget}
          onClose={handleCloseForm}
        />
      )}
      <DeleteProgramAdmissionConfigModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <ProgramAdmissionConfigDrawer
        config={drawerTarget}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onEdit={(config) => {
          handleCloseDrawer();
          handleOpenEdit(config);
        }}
        onDelete={(config) => {
          handleCloseDrawer();
          handleOpenDelete(config);
        }}
      />
    </Flex>
  );
}
