import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { CurriculumSelect } from "@/components/ui-kit/data-entry/CurriculumSelect";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetSemesterTypesQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import { CloneVersionModal } from "@/features/settings/tabs/curriculum-version";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { getOrdinalSemesterName } from "@/shared/utils/semesterOrdinal";
import { CopyOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Flex, Form, Pagination, Popover, Row, Select, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useCourseConfigurationsTab } from "../hooks/useCourseConfigurationsTab";
import type { FormattedSemester } from "../types/course-configuration";
import { CurriculumGrid } from "./CurriculumGrid";
import { CourseConfigFormModal } from "./modals/CourseConfigFormModal";
import { DeleteCourseConfigModal } from "./modals/DeleteCourseConfigModal";


export function CourseConfigurationsTab() {
  const token = useToken();
  const { state, actions, flags } = useCourseConfigurationsTab();
  const {
    configs,
    totalItems,
    levels,
    isLoading,
    isError,
    sectionError,
    selectedProgramId,
    selectedVersionId,
    filterLevelId,
    filterSemesterTypeId,
    page,
    itemsPerPage,
    gridRows,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    prefillLevelId,
    prefillSemesterTypeId,
  } = state;
  const {
    handleProgramChange,
    handleVersionChange,
    handleLevelFilterChange,
    handleSemesterTypeFilterChange,
    handleClearFilters,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isProgramSelected, isVersionSelected, activeFilterCount } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const bothSelected = isProgramSelected && isVersionSelected;
  const cardState = isLoading ? "loading" : "default";

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    sort: "name:asc",
    itemsPerPage: 100,
  });
  const programs = programsData?.member ?? [];

  const { data: versionsData } = useGetCurriculumVersionsQuery(
    selectedProgramId
      ? { forProgramId: selectedProgramId, include: "program", sort: "name:asc", itemsPerPage: 100 }
      : { sort: "name:asc", itemsPerPage: 100 },
    { skip: !isProgramSelected },
  );
  const versions = versionsData?.member ?? [];

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId),
    [versions, selectedVersionId],
  );

  const [branchTarget, setBranchTarget] = useState<CurriculumVersion | null>(null);

  const { data: semesterTypesData } = useGetSemesterTypesQuery(
    { sort: "sortOrder:asc", itemsPerPage: 100 },
    { skip: !filterOpen && filterSemesterTypeId === undefined },
  );
  const semesterTypesForFilter = semesterTypesData?.member ?? [];

  const selectedFilterLevel = useMemo(
    () => levels.find((l) => l.id === filterLevelId),
    [levels, filterLevelId],
  );

  const filterSemesterTypeOptions = useMemo(
    () =>
      semesterTypesForFilter.map((s) => ({
        value: s.id,
        label: getOrdinalSemesterName(s.sortOrder, selectedFilterLevel?.rankOrder),
      })),
    [semesterTypesForFilter, selectedFilterLevel],
  );

  // Derive unique semester types and formatted semesters from loaded configs for the grid columns
  const semesterTypes = useMemo<SemesterType[]>(() => {
    const map = new Map<number, SemesterType>();
    for (const config of configs) {
      if (config.semesterType && !map.has(config.semesterTypeId)) {
        map.set(config.semesterTypeId, config.semesterType);
      }
    }
    return Array.from(map.values());
  }, [configs]);

  const semesters = useMemo<FormattedSemester[]>(() => {
    const map = new Map<number, FormattedSemester>();
    for (const config of configs) {
      if (config.semester && !map.has(config.semesterTypeId)) {
        map.set(config.semesterTypeId, config.semester);
      }
    }
    return Array.from(map.values());
  }, [configs]);

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Level" style={{ marginBottom: 8 }}>
          <LevelSelect
            placeholder="Any level"
            allowClear
            layout="vertical"
            showSearch
            value={filterLevelId}
            onChange={(val: number | undefined) => handleLevelFilterChange(val)}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Semester Type" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any semester type"
            allowClear
            showSearch
            optionFilterProp="label"
            value={filterSemesterTypeId}
            onChange={(val: number | undefined) => handleSemesterTypeFilterChange(val)}
            style={{ width: "100%" }}
            options={filterSemesterTypeOptions}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            handleClearFilters();
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
        title="Course Configurations"
        body="Manage how courses are placed into a program's curriculum. Select a program and curriculum version to view and edit the curriculum grid rows represent levels, columns represent semester types."
        dismissible
        collapsible
      />

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Select
            placeholder="Select program"
            allowClear
            showSearch
            optionFilterProp="label"
            value={selectedProgramId}
            onChange={(val: number | undefined) => handleProgramChange(val)}
            loading={isProgramsLoading}
            style={{ minWidth: 220, height: 40 }}
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
          />
          <CurriculumSelect
            programId={selectedProgramId}
            value={selectedVersionId}
            onChange={(val) => handleVersionChange(val ?? undefined)}
            disabled={!isProgramSelected}
            style={{ minWidth: 260, height: 40 }}
          />
          <ConditionalRenderer when={bothSelected && selectedVersion?.scope === "GLOBAL"}>
            <Button
              icon={<CopyOutlined />}
              onClick={() => setBranchTarget(selectedVersion ?? null)}
            >
              Branch for this Program
            </Button>
          </ConditionalRenderer>
          <ConditionalRenderer when={bothSelected}>
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
          </ConditionalRenderer>
        </Flex>
        <PermissionGuard permission={Permission.CourseConfigsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenCreate()}
            disabled={!bothSelected}
            style={{ fontWeight: 600 }}
          >
            Add Course
          </Button>
        </PermissionGuard>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <DashCard
            title="Total Configurations"
            value={bothSelected ? totalItems : "—"}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load course configurations"}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !bothSelected}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            Select a program and curriculum version to view the curriculum grid.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && bothSelected && !hasData}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No course configurations found for this program and version.
          </Typography.Text>
          <PermissionGuard permission={Permission.CourseConfigsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCreate()}
              style={{ fontWeight: 600 }}
            >
              Add Course
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && bothSelected && hasData}>
          <Flex vertical gap={16}>
            <CurriculumGrid
              gridRows={gridRows}
              semesterTypes={semesterTypes}
              semesters={semesters}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
            <Flex justify="flex-end">
              <Pagination
                current={page}
                pageSize={itemsPerPage}
                total={totalItems}
                showSizeChanger
                showTotal={(total) => `${total} configurations`}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
              />
            </Flex>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <CourseConfigFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseForm}
        programId={selectedProgramId}
        versionId={selectedVersionId}
        prefillLevelId={prefillLevelId}
        prefillSemesterTypeId={prefillSemesterTypeId}
      />
      <CloneVersionModal
        open={branchTarget !== null}
        target={branchTarget}
        onClose={() => setBranchTarget(null)}
      />
      <DeleteCourseConfigModal
        open={deleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}

