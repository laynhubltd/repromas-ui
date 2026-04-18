// Feature: course-management
import type { AccordionItem } from "@/components/ui-kit";
import { Accordion, DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Input,
  Pagination,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useCourseTab } from "../hooks/useCourseTab";
import type { Course } from "../types/course";
import { BulkUploadModal } from "./modals/BulkUploadModal";
import { BulkUploadSummaryModal } from "./modals/BulkUploadSummaryModal";
import { CourseFormModal } from "./modals/CourseFormModal";
import { DeleteCourseModal } from "./modals/DeleteCourseModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildColumns(
  handleOpenEdit: (c: Course) => void,
  handleOpenDelete: (c: Course) => void,
): ColumnsType<Course> {
  return [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (code: string) => <Typography.Text strong>{code}</Typography.Text>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Credit Units",
      dataIndex: "creditUnits",
      key: "creditUnits",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 120,
    },
    {
      title: "Department",
      dataIndex: "departmentId",
      key: "department",
      render: (_: unknown, record: Course) =>
        record.department?.name ?? (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
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
      width: 100,
      render: (_: unknown, record: Course) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard permission={Permission.CoursesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleOpenEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.CoursesDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleOpenDelete(record)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      ),
    },
  ];
}

function buildGroupColumns(
  handleOpenEdit: (c: Course) => void,
  handleOpenDelete: (c: Course) => void,
): ColumnsType<Course> {
  return buildColumns(handleOpenEdit, handleOpenDelete).filter(
    (col) => col.key !== "department",
  );
}

export function CoursesTab() {
  const token = useToken();
  const { state, actions, flags, bulkUpload } = useCourseTab();
  const {
    courses,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    codeSearch,
    titleSearch,
    departmentId,
    showInactive,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    bulkUploadModalOpen,
    groupByDepartment,
    groupedCourses,
  } = state;
  const {
    handleCodeSearchChange,
    handleTitleSearchChange,
    handleDepartmentFilterChange,
    handleShowInactiveChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    clearSearch,
    handleToggleGroupByDepartment,
    handleOpenBulkUpload,
    handleCloseBulkUpload,
    refetch,
  } = actions;
  const {
    hasData,
    isSearchActive,
    activeFilterCount,
    showDepartmentColumn,
    showDepartmentFilter,
    showGroupByToggle,
  } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const { state: bulkState, actions: bulkActions, flags: bulkFlags } = bulkUpload;

  const cardState = isLoading ? "loading" : "default";
  const activeCount = courses.filter((c) => c.isActive).length;

  const uploadMenuItems = [
    {
      key: "download-template",
      label: "Download Template",
      icon: <DownloadOutlined />,
      onClick: bulkActions.handleDownloadTemplate,
    },
    {
      key: "upload-bulk",
      label: "Upload Bulk",
      icon: <UploadOutlined />,
      onClick: handleOpenBulkUpload,
    },
  ];

  const { data: departmentsData } = useGetDepartmentsQuery(
    { itemsPerPage: 100 },
    { skip: !filterOpen && departmentId === undefined },
  );
  const departments = departmentsData?.member ?? [];

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<Course> | SorterResult<Course>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("code:asc");
      return;
    }
    handleSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const flatColumns = buildColumns(handleOpenEdit, handleOpenDelete).filter(
    (col) => showDepartmentColumn || col.key !== "department",
  );
  const groupColumns = buildGroupColumns(handleOpenEdit, handleOpenDelete);

  const accordionItems: AccordionItem[] = Array.from(
    groupedCourses.entries() as IterableIterator<[number, Course[]]>,
  )
    .map(([departmentId, deptCourses]) => {
      const deptName = deptCourses[0]?.department?.name ?? `Department ${departmentId}`;
      const count = deptCourses.length;
      return {
        key: String(departmentId),
        title: deptName,
        subtitle: `${count} course${count !== 1 ? "s" : ""}`,
        content: (
          <Table<Course>
            rowKey="id"
            dataSource={deptCourses}
            columns={groupColumns}
            size="sm"
            density="compact"
            scroll={{ x: true }}
            pagination={false}
          />
        ),
      };
    })
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="middle">
        <ConditionalRenderer when={showDepartmentFilter}>
          <Form.Item label="Department" style={{ marginBottom: 8 }}>
            <Select
              placeholder="Any department"
              allowClear
              showSearch
              optionFilterProp="label"
              value={departmentId}
              onChange={(val: number | undefined) => handleDepartmentFilterChange(val)}
              style={{ width: "100%" }}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
        </ConditionalRenderer>
        <Form.Item label="Show Inactive" style={{ marginBottom: 0 }}>
          <Flex align="center" gap={8}>
            <Switch
              checked={showInactive}
              onChange={handleShowInactiveChange}
              aria-label="Show Inactive"
            />
            <Typography.Text>Include inactive courses</Typography.Text>
          </Flex>
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            handleDepartmentFilterChange(undefined);
            setFilterOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Courses"
        body="Manage academic courses offered by your institution. Each course belongs to a department and defines a unique code, title, and credit unit count."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <DashCard
            title="Total Courses"
            value={totalItems}
            state={cardState}
            size="sm"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <DashCard
            title="Active Courses"
            value={isLoading ? "—" : activeCount}
            state={cardState}
            size="sm"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by code…"
            value={codeSearch}
            onChange={(e) => handleCodeSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 200 }}
          />
          <Input
            placeholder="Search by title…"
            value={titleSearch}
            onChange={(e) => handleTitleSearchChange(e.target.value)}
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
          <ConditionalRenderer when={showGroupByToggle}>
            <Flex align="center" gap={8}>
              <Switch
                checked={groupByDepartment}
                onChange={handleToggleGroupByDepartment}
                aria-label="Group by Department"
              />
              <Typography.Text>Group by Department</Typography.Text>
            </Flex>
          </ConditionalRenderer>
        </Flex>
        <PermissionGuard permission={Permission.CoursesCreate}>
          <Dropdown menu={{ items: uploadMenuItems }} trigger={["click"]}>
            <Button icon={<CloudUploadOutlined />}>Upload Multiple</Button>
          </Dropdown>
        </PermissionGuard>
        <PermissionGuard permission={Permission.CoursesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Course
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load courses" onRetry={refetch} />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No courses configured. Create your first course to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.CoursesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Course
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isSearchActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No courses found matching your search.
          </Typography.Text>
          <Button type="link" onClick={clearSearch}>
            Clear search
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData && !groupByDepartment}>
          <Table<Course>
            rowKey="id"
            dataSource={courses}
            columns={flatColumns}
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

        <ConditionalRenderer when={!isError && hasData && groupByDepartment}>
          <Accordion
            items={accordionItems}
            expansionMode="multiple"
            size="md"
            density="comfortable"
            variant="default"
          />
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={100}
              total={totalItems}
              onChange={(p) => handlePageChange(p)}
              showSizeChanger={false}
            />
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <CourseFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteCourseModal
        open={deleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <BulkUploadModal
        open={bulkUploadModalOpen}
        onClose={handleCloseBulkUpload}
        selectedFile={bulkState.selectedFile}
        isUploading={bulkState.isUploading}
        uploadError={bulkState.uploadError}
        hasFile={bulkFlags.hasFile}
        onFileChange={bulkActions.handleFileChange}
        onUpload={bulkActions.handleUpload}
        onDownloadTemplate={bulkActions.handleDownloadTemplate}
      />
      <BulkUploadSummaryModal
        open={bulkState.summaryModalOpen}
        summary={bulkState.summary}
        summaryState={bulkFlags.summaryState}
        onClose={bulkActions.handleCloseSummary}
        onDownloadErrorReport={bulkActions.handleDownloadErrorReport}
      />
    </Flex>
  );
}
