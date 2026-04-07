import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
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
import {
  Badge,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useStaffTab } from "../hooks/useStaffTab";
import type { Staff } from "../types/staff";
import { StaffDrawer } from "./StaffDrawer";
import { DeleteStaffModal } from "./modals/DeleteStaffModal";
import { StaffFormModal } from "./modals/StaffFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StaffPage() {
  const token = useToken();
  const { state, actions, flags } = useStaffTab();
  const {
    staff,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    fileNumberSearch,
    departmentFilter,
    formTarget,
    deleteTarget,
    formModalOpen,
    drawerStaffId,
  } = state;
  const {
    handleFileNumberSearchChange,
    handleDepartmentFilterChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleOpenDrawer,
    handleCloseDrawer,
    refetch,
    clearAllFilters,
  } = actions;
  const { hasData, isSearchActive, isFilterActive } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const isAnyFilterActive = isSearchActive || isFilterActive;
  const cardState = isLoading ? "loading" : "default";
  const activeFilterCount = [departmentFilter].filter((v) => v !== undefined).length;

  const { data: departmentsData } = useGetDepartmentsQuery({ itemsPerPage: 200 });
  const departments = departmentsData?.member ?? [];

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<Staff> | SorterResult<Staff>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("createdAt:desc");
      return;
    }
    handleSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const columns: ColumnsType<Staff> = [
    {
      title: "File Number",
      dataIndex: "fileNumber",
      key: "fileNumber",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    {
      title: "Name",
      key: "name",
      render: (_: unknown, record: Staff) => {
        const first = record.profile?.firstName;
        const last = record.profile?.lastName;
        const name = [first, last].filter(Boolean).join(" ");
        return name ? (
          <Typography.Text>{name}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        );
      },
    },
    {
      title: "Department",
      key: "department",
      render: (_: unknown, record: Staff) =>
        record.department?.name ?? (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => formatDate(v),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 60,
      render: (_: unknown, record: Staff) => {
        const menuItems = [
          {
            key: "view",
            label: <span>View</span>,
            icon: <EyeOutlined />,
            onClick: () => handleOpenDrawer(record.id),
          },
          {
            key: "edit",
            label: (
              <PermissionGuard permission={Permission.StaffUpdate}>
                <span>Edit</span>
              </PermissionGuard>
            ),
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          {
            key: "delete",
            label: (
              <PermissionGuard permission={Permission.StaffDelete}>
                <span style={{ color: token.colorError }}>Delete</span>
              </PermissionGuard>
            ),
            icon: <DeleteOutlined style={{ color: token.colorError }} />,
            onClick: () => handleOpenDelete(record),
            danger: true as const,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Department" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any department"
            allowClear
            showSearch
            optionFilterProp="label"
            value={departmentFilter}
            onChange={(val: number | undefined) => handleDepartmentFilterChange(val)}
            style={{ width: "100%" }}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
        </Form.Item>
      </Form>
      {activeFilterCount > 0 && (
        <Button
          type="link"
          size="small"
          onClick={() => {
            clearAllFilters();
            setFilterOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      )}
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Staff"
        body="Manage academic staff members within your institution. Each staff record links a user account to a department with an assigned file number."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Staff"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by file number..."
            value={fileNumberSearch}
            onChange={(e) => handleFileNumberSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 240 }}
          />
          <Popover
            content={filterPopoverContent}
            title={
              <Flex justify="space-between" align="center">
                <Space>
                  <FilterOutlined />
                  <span>Filters</span>
                </Space>
              </Flex>
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
        <PermissionGuard permission={Permission.StaffCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Staff
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load staff" onRetry={refetch} />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isAnyFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No staff records yet. Create your first staff member to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.StaffCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Staff
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isAnyFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No staff found matching your search or filters.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleFileNumberSearchChange("");
              clearAllFilters();
            }}
          >
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<Staff>
            rowKey="id"
            dataSource={staff}
            columns={columns}
            size="md"
            density="comfortable"
            scroll={{ x: true }}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: itemsPerPage,
              total: totalItems,
              showSizeChanger: true,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange,
            }}
          />
        </ConditionalRenderer>
      </DataLoader>

      <StaffFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteStaffModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <StaffDrawer
        staffId={drawerStaffId}
        open={drawerStaffId !== null}
        onClose={handleCloseDrawer}
        onEdit={(staffMember: Staff) => {
          handleCloseDrawer();
          handleOpenEdit(staffMember);
        }}
        onDelete={(staffMember: Staff) => {
          handleCloseDrawer();
          handleOpenDelete(staffMember);
        }}
      />
    </Flex>
  );
}
