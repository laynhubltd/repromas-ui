// Feature: program-graduation-config
import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row, Select, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useGraduationConfigTab } from "../hooks/useGraduationConfigTab";
import type { ProgramGraduationRequirement } from "../types/graduation-requirement";
import { DeleteGraduationRequirementModal } from "./modals/DeleteGraduationRequirementModal";
import { GraduationRequirementFormModal } from "./modals/GraduationRequirementFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildColumns(
  programs: { id: number; name: string }[],
  handleOpenEdit: (r: ProgramGraduationRequirement) => void,
  handleOpenDelete: (r: ProgramGraduationRequirement) => void,
): ColumnsType<ProgramGraduationRequirement> {
  return [
    {
      title: "Program",
      dataIndex: "programId",
      key: "program",
      render: (programId: number) =>
        programs.find((p) => p.id === programId)?.name ?? (
          <Typography.Text type="secondary">#{programId}</Typography.Text>
        ),
    },
    {
      title: "Curriculum Version",
      dataIndex: "curriculumVersionId",
      key: "curriculumVersion",
      render: (_: number, record: ProgramGraduationRequirement) =>
        record.curriculumVersion?.name ?? (
          <Typography.Text type="secondary">#{record.curriculumVersionId}</Typography.Text>
        ),
    },
    {
      title: "Entry Mode",
      dataIndex: "entryMode",
      key: "entryMode",
    },
    {
      title: "Min Total Credits",
      dataIndex: "minTotalCredits",
      key: "minTotalCredits",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 150,
    },
    {
      title: "Min Core Credits",
      dataIndex: "minCoreCredits",
      key: "minCoreCredits",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 140,
    },
    {
      title: "Min Elective Credits",
      dataIndex: "minElectiveCredits",
      key: "minElectiveCredits",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      width: 160,
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
      render: (_: unknown, record: ProgramGraduationRequirement) => (
        <Flex align="center" justify="flex-end" gap={4}>
          <PermissionGuard permission={Permission.GraduationRequirementsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleOpenEdit(record)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.GraduationRequirementsDelete}>
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

export function GraduationConfigTab() {
  const token = useToken();
  const { state, actions, flags } = useGraduationConfigTab();
  const {
    requirements,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    programFilter,
    curriculumVersionFilter,
    formTarget,
    deleteTarget,
    formModalOpen,
  } = state;
  const {
    handleProgramFilterChange,
    handleCurriculumVersionFilterChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isFilterActive } = flags;

  const cardState = isLoading ? "loading" : "default";
  const distinctPrograms = new Set(requirements.map((r) => r.programId)).size;

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 200,
  });
  const programs = programsData?.member ?? [];

  // Unique curriculum versions from loaded requirements for the filter dropdown
  const curriculumVersionOptions = Array.from(
    new Map(
      requirements
        .filter((r) => r.curriculumVersion)
        .map((r) => [r.curriculumVersionId, r.curriculumVersion!]),
    ).values(),
  ).map((v) => ({ value: v.id, label: v.name }));

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter:
      | SorterResult<ProgramGraduationRequirement>
      | SorterResult<ProgramGraduationRequirement>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("createdAt:desc");
      return;
    }
    handleSortChange(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  const columns = buildColumns(programs, handleOpenEdit, handleOpenDelete);

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        title="Graduation Requirements"
        body="Manage credit thresholds students must satisfy to graduate from a program under a specific curriculum version, differentiated by entry mode."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Requirements"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Programs Covered"
            value={isLoading ? "—" : distinctPrograms}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" wrap="wrap">
        <Select
          placeholder="Filter by program"
          allowClear
          value={programFilter}
          onChange={(val) => handleProgramFilterChange(val as number | undefined)}
          loading={isProgramsLoading}
          style={{ minWidth: 200 }}
          options={programs.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Select
          placeholder="Filter by curriculum version"
          allowClear
          value={curriculumVersionFilter}
          onChange={(val) => handleCurriculumVersionFilterChange(val as number | undefined)}
          style={{ minWidth: 220 }}
          options={curriculumVersionOptions}
        />

        <PermissionGuard permission={Permission.GraduationRequirementsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Requirement
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load graduation requirements"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No graduation requirements configured. Create your first requirement to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.GraduationRequirementsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Requirement
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No graduation requirements found matching your filters.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleProgramFilterChange(undefined);
              handleCurriculumVersionFilterChange(undefined);
            }}
          >
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Table<ProgramGraduationRequirement>
            rowKey="id"
            dataSource={requirements}
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

      <GraduationRequirementFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteGraduationRequirementModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
