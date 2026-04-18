// Feature: course-management
import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetSemesterTypesQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Flex, Form, Pagination, Popover, Row, Select, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useCourseConfigurationsTab } from "../hooks/useCourseConfigurationsTab";
import { CurriculumGrid } from "./CurriculumGrid";
import { CourseConfigFormModal } from "./modals/CourseConfigFormModal";
import { DeleteCourseConfigModal } from "./modals/DeleteCourseConfigModal";

export function CourseConfigurationsTab() {
  const token = useToken();
  const { state, actions, flags } = useCourseConfigurationsTab();
  const {
    configs,
    totalItems,
    isLoading,
    isError,
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

  const { data: versionsData, isLoading: isVersionsLoading } = useGetCurriculumVersionsQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !isProgramSelected },
  );
  const versions = versionsData?.member ?? [];

  const { data: levelsData } = useGetLevelsQuery(
    { sort: "rankOrder:asc", itemsPerPage: 100 },
    { skip: !filterOpen && filterLevelId === undefined },
  );
  const levels = levelsData?.member ?? [];

  const { data: semesterTypesData } = useGetSemesterTypesQuery(
    { sort: "sortOrder:asc", itemsPerPage: 100 },
    { skip: !filterOpen && filterSemesterTypeId === undefined },
  );
  const semesterTypesForFilter = semesterTypesData?.member ?? [];

  // Derive unique semester types from loaded configs for the grid columns
  const semesterTypes = useMemo<SemesterType[]>(() => {
    const map = new Map<number, SemesterType>();
    for (const config of configs) {
      if (config.semesterType && !map.has(config.semesterTypeId)) {
        map.set(config.semesterTypeId, config.semesterType);
      }
    }
    return Array.from(map.values());
  }, [configs]);

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Level" style={{ marginBottom: 8 }}>
          <Select
            placeholder="Any level"
            allowClear
            showSearch
            optionFilterProp="label"
            value={filterLevelId}
            onChange={(val: number | undefined) => handleLevelFilterChange(val)}
            style={{ width: "100%" }}
            options={levels.map((l) => ({ value: l.id, label: l.name }))}
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
            options={semesterTypesForFilter.map((s) => ({ value: s.id, label: s.name }))}
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
            style={{ minWidth: 220 }}
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Select
            placeholder="Select curriculum version"
            allowClear
            showSearch
            optionFilterProp="label"
            value={selectedVersionId}
            onChange={(val: number | undefined) => handleVersionChange(val)}
            loading={isVersionsLoading}
            disabled={!isProgramSelected}
            style={{ minWidth: 220 }}
            options={versions.map((v) => ({ value: v.id, label: v.name }))}
          />
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
            error="Failed to load course configurations"
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
      <DeleteCourseConfigModal
        open={deleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
