import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Pagination,
  Popover,
  Row,
  Select,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useProgramOlevelRuleTab } from "../hooks/useProgramOlevelRuleTab";
import { ProgramOlevelRuleBanner } from "./ProgramOlevelRuleBanner";
import { ProgramOlevelRuleCard } from "./ProgramOlevelRuleCard";
import { DeleteProgramOlevelRuleModal } from "./modals/DeleteProgramOlevelRuleModal";
import { ProgramOlevelRuleFormModal } from "./modals/ProgramOlevelRuleFormModal";

const CARD_PAGE_SIZE = 10;

export function ProgramOlevelRuleTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const { state, actions, flags } = useProgramOlevelRuleTab();
  const {
    groups,
    totalFiltered,
    totalRequirements,
    configuredProgramCount,
    missingProgramsCount,
    programs,
    faculties,
    departments,
    isLoading,
    isError,
    search,
    facultyFilter,
    departmentFilter,
    page,
    formTarget,
    formPresetProgramId,
    formOpen,
    deleteTarget,
    deleteOpen,
    activeFilterCount,
  } = state;
  const {
    handleSearchChange,
    handleFacultyFilterChange,
    handleDepartmentFilterChange,
    handleClearFilters,
    handlePageChange,
    handleOpenCreate,
    handleOpenAddSubject,
    handleOpenEditRequirement,
    handleCloseForm,
    handleOpenDeleteRequirement,
    handleCloseDelete,
    getSubjectIdsForProgram,
    refetch,
  } = actions;
  const { hasData, isSearchOrFilterActive } = flags;

  const facultyOptions = useMemo(
    () =>
      faculties.map((f) => ({
        value: f.id,
        label: f.name,
      })),
    [faculties],
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        value: d.id,
        label: d.name,
      })),
    [departments],
  );

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Faculty" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any faculty"
            allowClear
            value={facultyFilter}
            onChange={handleFacultyFilterChange}
            style={{ width: "100%" }}
            options={facultyOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label="Department" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any department"
            allowClear
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            style={{ width: "100%" }}
            options={departmentOptions}
            showSearch
            optionFilterProp="label"
            disabled={facultyFilter === undefined && departmentOptions.length === 0}
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

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ProgramOlevelRuleBanner />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Programs Configured"
            value={configuredProgramCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Requirement Rows"
            value={totalRequirements}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Programs Missing Rules"
            value={missingProgramsCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <ConditionalRenderer when={missingProgramsCount > 0 && !isSearchOrFilterActive}>
        <ExplainerCallout
          intent="warning"
          collapsible
          title="Programs without O'Level requirements"
          body={`${missingProgramsCount} program${missingProgramsCount === 1 ? " has" : "s have"} no compulsory O'Level subjects configured. Candidates may not be screened correctly until requirements are set.`}
        />
      </ConditionalRenderer>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by program, department, or subject…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />

          <Popover
            content={filterContent}
            title={
              <span>
                <FilterOutlined /> Filters
              </span>
            }
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
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

        <PermissionGuard permission={Permission.AdmissionProgramOlevelRulesCreate}>
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

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load program O'Level requirements."
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
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16, textAlign: "center" }}
          >
            No program O'Level requirements configured yet. Assign compulsory
            subjects to each admitting program.
          </Typography.Text>
          <PermissionGuard permission={Permission.AdmissionProgramOlevelRulesCreate}>
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
          when={!isError && !hasData && isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 8 }}
          >
            No results match your search or filters.
          </Typography.Text>
          <Button type="link" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={8}>
            {groups.map((group) => (
              <ProgramOlevelRuleCard
                key={group.programId}
                group={group}
                onAddSubject={handleOpenAddSubject}
                onEditRequirement={handleOpenEditRequirement}
                onDeleteRequirement={handleOpenDeleteRequirement}
              />
            ))}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <ConditionalRenderer when={!isError && totalFiltered > CARD_PAGE_SIZE}>
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={CARD_PAGE_SIZE}
            total={totalFiltered}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </Flex>
      </ConditionalRenderer>

      <ProgramOlevelRuleFormModal
        open={formOpen}
        target={formTarget}
        presetProgramId={formPresetProgramId}
        onClose={handleCloseForm}
        programs={programs}
        getSubjectIdsForProgram={getSubjectIdsForProgram}
      />
      <DeleteProgramOlevelRuleModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
