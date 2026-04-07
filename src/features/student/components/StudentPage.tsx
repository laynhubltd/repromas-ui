// Feature: student

import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
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
import { Badge, Button, Col, Dropdown, Flex, Form, Input, Popover, Row, Select, Space, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useStudentsTab } from "../hooks/useStudentsTab";
import type { Student, StudentStatus } from "../types/student";
import { DeleteStudentModal } from "./modals/DeleteStudentModal";
import { StudentFormModal } from "./modals/StudentFormModal";
import { StatusBadge } from "./StatusBadge";
import { StudentDrawer } from "./StudentDrawer";

const STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "RUSTICATED", label: "Rusticated" },
];

const ENTRY_MODE_OPTIONS = [
  { value: "UTME", label: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
  { value: "TRANSFER", label: "Transfer" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StudentPage() {
  const token = useToken();
  const { state, actions, flags } = useStudentsTab();
  const {
    students,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    firstNameSearch,
    lastNameSearch,
    matricSearch,
    statusFilter,
    entryModeFilter,
    programFilter,
    formTarget,
    deleteTarget,
    formModalOpen,
    drawerStudentId,
  } = state;
  const {
    handleFirstNameSearchChange,
    handleLastNameSearchChange,
    handleMatricSearchChange,
    handleStatusFilterChange,
    handleEntryModeFilterChange,
    handleProgramFilterChange,
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
  } = actions;
  const { hasData, isSearchActive, isFilterActive } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const isAnyFilterActive = isSearchActive || isFilterActive;
  const cardState = isLoading ? "loading" : "default";

  const activeFilterCount = [statusFilter, entryModeFilter, programFilter].filter(
    (v) => v !== undefined,
  ).length;

  const clearAllFilters = () => {
    handleStatusFilterChange(undefined);
    handleEntryModeFilterChange(undefined);
    handleProgramFilterChange(undefined);
  };

  const { data: programsData } = useGetProgramsQuery({ itemsPerPage: 200 });
  const programs = programsData?.member ?? [];

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Status" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={statusFilter}
            onChange={(val) => handleStatusFilterChange(val as StudentStatus | undefined)}
            style={{ width: "100%" }}
            options={STATUS_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Entry Mode" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any entry mode"
            allowClear
            value={entryModeFilter}
            onChange={(val) => handleEntryModeFilterChange(val as typeof entryModeFilter)}
            style={{ width: "100%" }}
            options={ENTRY_MODE_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Program" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any program"
            allowClear
            showSearch
            optionFilterProp="label"
            value={programFilter}
            onChange={(val) => handleProgramFilterChange(val as number | undefined)}
            style={{ width: "100%" }}
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>
      </Form>
      {activeFilterCount > 0 && (
        <Button type="link" size="small" onClick={clearAllFilters} style={{ padding: 0 }}>
          Clear all filters
        </Button>
      )}
    </Flex>
  );

  const activeStudentsCount = students.filter((s) => s.status === "ACTIVE").length;

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<Student> | SorterResult<Student>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("lastName:asc");
      return;
    }
    handleSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const columns: ColumnsType<Student> = [
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (status: StudentStatus) => <StatusBadge status={status} />,
    },
    {
      title: "Entry Mode",
      dataIndex: "entryMode",
      key: "entryMode",
    },
    {
      title: "Current Level",
      key: "currentLevel",
      render: (_: unknown, record: Student) =>
        record.currentLevel?.name ?? (
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
      render: (_: unknown, record: Student) => {
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
              <PermissionGuard permission={Permission.StudentsUpdate}>
                <span>Edit</span>
              </PermissionGuard>
            ),
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          {
            key: "delete",
            label: (
              <PermissionGuard permission={Permission.StudentsDelete}>
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

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Students"
        body="Manage enrolled students within your institution. Each student record captures identity, admission context, and current academic standing."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Students"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Active Students"
            value={isLoading ? "—" : activeStudentsCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by first name…"
            value={firstNameSearch}
            onChange={(e) => handleFirstNameSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 200 }}
          />
          <Input
            placeholder="Search by last name…"
            value={lastNameSearch}
            onChange={(e) => handleLastNameSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 200 }}
          />
          <Input
            placeholder="Search by matric number…"
            value={matricSearch}
            onChange={(e) => handleMatricSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 220 }}
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
        <PermissionGuard permission={Permission.StudentsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Student
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load students" onRetry={refetch} />
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
            No students enrolled yet. Create your first student to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.StudentsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Student
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
            No students found matching your search or filters.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleFirstNameSearchChange("");
              handleLastNameSearchChange("");
              handleMatricSearchChange("");
              handleStatusFilterChange(undefined);
              handleEntryModeFilterChange(undefined);
              handleProgramFilterChange(undefined);
            }}
          >
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<Student>
            rowKey="id"
            dataSource={students}
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

      <StudentFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteStudentModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <StudentDrawer
        studentId={drawerStudentId}
        open={drawerStudentId !== null}
        onClose={handleCloseDrawer}
        onEdit={() => {
          const student = students.find((s) => s.id === drawerStudentId);
          if (student) {
            handleCloseDrawer();
            handleOpenEdit(student);
          }
        }}
        onDelete={() => {
          const student = students.find((s) => s.id === drawerStudentId);
          if (student) {
            handleCloseDrawer();
            handleOpenDelete(student);
          }
        }}
      />
    </Flex>
  );
}
