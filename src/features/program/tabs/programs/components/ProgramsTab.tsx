// Feature: program-graduation-config
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Input, Pagination, Row, Select, Switch, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useProgramsTab } from "../hooks/useProgramsTab";
import type { Program } from "../types/program";
import { DeleteProgramModal } from "./modals/DeleteProgramModal";
import { ProgramFormModal } from "./modals/ProgramFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildActionsColumn(
  handleOpenEdit: (p: Program) => void,
  handleOpenDelete: (p: Program) => void,
): ColumnsType<Program>[number] {
  return {
    title: "Actions",
    key: "actions",
    align: "right",
    width: 100,
    render: (_: unknown, record: Program) => (
      <Flex align="center" justify="flex-end" gap={4}>
        <PermissionGuard permission={Permission.ProgramsUpdate}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ fontSize: 16 }} />}
            onClick={() => handleOpenEdit(record)}
            title="Edit"
          />
        </PermissionGuard>
        <PermissionGuard permission={Permission.ProgramsDelete}>
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
  };
}

function buildFlatColumns(
  handleOpenEdit: (p: Program) => void,
  handleOpenDelete: (p: Program) => void,
): ColumnsType<Program> {
  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Degree Title",
      dataIndex: "degreeTitle",
      key: "degreeTitle",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Duration (years)",
      dataIndex: "durationInYears",
      key: "durationInYears",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 140,
    },
    {
      title: "Max Residency (years)",
      dataIndex: "maxResidencyYears",
      key: "maxResidencyYears",
      width: 160,
    },
    {
      title: "Department",
      dataIndex: "departmentId",
      key: "department",
      render: (_: unknown, record: Program) =>
        record.department?.name ?? <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => formatDate(v),
    },
    buildActionsColumn(handleOpenEdit, handleOpenDelete),
  ];
}

function buildGroupColumns(
  handleOpenEdit: (p: Program) => void,
  handleOpenDelete: (p: Program) => void,
): ColumnsType<Program> {
  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Degree Title",
      dataIndex: "degreeTitle",
      key: "degreeTitle",
    },
    {
      title: "Duration (years)",
      dataIndex: "durationInYears",
      key: "durationInYears",
      width: 140,
    },
    {
      title: "Max Residency (years)",
      dataIndex: "maxResidencyYears",
      key: "maxResidencyYears",
      width: 160,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDate(v),
    },
    buildActionsColumn(handleOpenEdit, handleOpenDelete),
  ];
}

export function ProgramsTab() {
  const token = useToken();
  const { state, actions, flags } = useProgramsTab();
  const {
    programs,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    nameSearch,
    degreeTitleSearch,
    departmentFilter,
    formTarget,
    deleteTarget,
    formModalOpen,
    groupByDepartment,
    groupedPrograms,
  } = state;
  const {
    handleNameSearchChange,
    handleDegreeTitleSearchChange,
    handleDepartmentFilterChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleToggleGroupByDepartment,
    refetch,
  } = actions;
  const { hasData, isNameSearchActive, isDegreeTitleSearchActive, showDepartmentFilter } = flags;

  const isSearchActive = isNameSearchActive || isDegreeTitleSearchActive;
  const cardState = isLoading ? "loading" : "default";
  const distinctDepartments = new Set(programs.map((p) => p.departmentId)).size;

  const { data: departmentsData } = useGetDepartmentsQuery({ itemsPerPage: 200 });
  const departments = departmentsData?.member ?? [];

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<Program> | SorterResult<Program>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("name:asc");
      return;
    }
    handleSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const flatColumns = buildFlatColumns(handleOpenEdit, handleOpenDelete).filter(
    (col) => showDepartmentFilter || col.key !== "department",
  );
  const groupColumns = buildGroupColumns(handleOpenEdit, handleOpenDelete);

  const accordionItems: AccordionItem[] = Array.from(
    groupedPrograms.entries() as IterableIterator<[number, Program[]]>,
  )
    .map(([departmentId, deptPrograms]) => {
      const deptName = deptPrograms[0]?.department?.name ?? `Department ${departmentId}`;
      const count = deptPrograms.length;
      return {
        key: String(departmentId),
        title: deptName,
        subtitle: `${count} program${count !== 1 ? "s" : ""}`,
        extra: (
          <PermissionGuard permission={Permission.ProgramsCreate}>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCreate({ departmentId } as Partial<Program>);
              }}
            >
              Add Program
            </Button>
          </PermissionGuard>
        ),
        content: (
          <Table<Program>
            rowKey="id"
            dataSource={deptPrograms}
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

  // Determine defaultDepartmentId for create modal when opened from accordion
  const createDefaultDepartmentId =
    formTarget && !("updatedAt" in formTarget)
      ? (formTarget as Partial<Program>).departmentId
      : undefined;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Programs"
        body="Manage academic degree programs offered by your institution. Each program belongs to a department and defines degree title, duration, and maximum residency years."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Programs"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Departments Represented"
            value={isLoading ? "—" : distinctDepartments}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" wrap="wrap">
        <Input
          placeholder="Search by name…"
          value={nameSearch}
          onChange={(e) => handleNameSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 240 }}
        />
        <Input
          placeholder="Search by degree title…"
          value={degreeTitleSearch}
          onChange={(e) => handleDegreeTitleSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 240 }}
        />

        <ConditionalRenderer when={showDepartmentFilter}>
          <Select
            placeholder="Filter by department"
            allowClear
            value={departmentFilter}
            onChange={(val) => handleDepartmentFilterChange(val as number | undefined)}
            style={{ minWidth: 200 }}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Flex align="center" gap={8}>
            <Switch
              checked={groupByDepartment}
              onChange={handleToggleGroupByDepartment}
              aria-label="Group by Department"
            />
            <Typography.Text>Group by Department</Typography.Text>
          </Flex>
        </ConditionalRenderer>

        <PermissionGuard permission={Permission.ProgramsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCreate()}
            style={{ fontWeight: 600 }}
          >
            Create Program
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load programs" onRetry={refetch} />
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
            No programs configured. Create your first program to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.ProgramsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCreate()}
              style={{ fontWeight: 600 }}
            >
              Create Program
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
            No programs found matching your search.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleNameSearchChange("");
              handleDegreeTitleSearchChange("");
            }}
          >
            Clear search
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData && !groupByDepartment}>
          <Table<Program>
            rowKey="id"
            dataSource={programs}
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
              onChange={(p) => handlePageChange(p, 100)}
              showSizeChanger={false}
            />
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <ProgramFormModal
        open={formModalOpen}
        target={"updatedAt" in (formTarget ?? {}) ? (formTarget as Program) : null}
        onClose={handleCloseForm}
        defaultDepartmentId={createDefaultDepartmentId}
      />
      <DeleteProgramModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
