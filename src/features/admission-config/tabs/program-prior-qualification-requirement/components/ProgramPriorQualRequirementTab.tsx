import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { MANDATORY_FILTER_OPTIONS } from "@/shared/constants/programPriorQualRequirementOptions";
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
import { useProgramPriorQualRequirementTab } from "../hooks/useProgramPriorQualRequirementTab";
import { ProgramPriorQualRequirementCard } from "./ProgramPriorQualRequirementCard";
import { ProgramPriorQualRequirementDrawer } from "./ProgramPriorQualRequirementDrawer";
import { DeleteProgramPriorQualRequirementModal } from "./modals/DeleteProgramPriorQualRequirementModal";
import { ProgramPriorQualRequirementFormModal } from "./modals/ProgramPriorQualRequirementFormModal";

const CARD_PAGE_SIZE = 10;

export function ProgramPriorQualRequirementTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const { state, actions, flags } = useProgramPriorQualRequirementTab();

  const {
    groups,
    totalFiltered,
    totalRequirements,
    configuredProgramCount,
    missingProgramsCount,
    programs,
    qualificationTypes,
    levels,
    faculties,
    departments,
    isLoading,
    isError,
    sectionError,
    search,
    facultyFilter,
    departmentFilter,
    programFilter,
    mandatoryFilter,
    page,
    formTarget,
    formPresetProgramId,
    formOpen,
    deleteTarget,
    deleteOpen,
    viewTarget,
    activeFilterCount,
    getUsedTypeIdsForProgram,
  } = state;

  const {
    handleSearchChange,
    handleFacultyFilterChange,
    handleDepartmentFilterChange,
    handleProgramFilterChange,
    handleMandatoryFilterChange,
    handleClearFilters,
    handlePageChange,
    handleOpenCreate,
    handleOpenAddRequirement,
    handleOpenEditRequirement,
    handleCloseForm,
    handleOpenDeleteRequirement,
    handleCloseDelete,
    handleOpenViewRequirement,
    handleCloseView,
    refetch,
  } = actions;

  const { hasData, isSearchOrFilterActive, canEdit, canDelete } = flags;

  const facultyOptions = useMemo(
    () => faculties.map((faculty) => ({ value: faculty.id, label: faculty.name })),
    [faculties],
  );

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: department.id, label: department.name })),
    [departments],
  );

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
        <Form.Item label="Department" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any department"
            allowClear
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            style={{ width: "100%" }}
            options={departmentOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label="Program" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any program"
            allowClear
            value={programFilter}
            onChange={handleProgramFilterChange}
            style={{ width: "100%" }}
            options={programOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label="Rule type" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any"
            allowClear
            value={
              mandatoryFilter !== undefined ? String(mandatoryFilter) : undefined
            }
            onChange={(value) =>
              handleMandatoryFilterChange(
                value === undefined ? undefined : value === "true",
              )
            }
            style={{ width: "100%" }}
            options={MANDATORY_FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
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

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="Program Prior Qualification Rules"
        body="Define which direct-entry qualifications each program accepts. Use must-have rules for requirements every candidate needs, alternative sets when candidates can choose one pathway (e.g. IJMB or JUPEB), and nice-to-have for preferred but optional qualifications. Configure Qualification Types first."
      />

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
          title="Programs without prior-qual rules"
          body={`${missingProgramsCount} program${missingProgramsCount === 1 ? " has" : "s have"} no prior qualification requirements configured. DE eligibility may pass vacuously until rules are set.`}
        />
      </ConditionalRenderer>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by program, department, or qualification type…"
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

        <PermissionGuard
          permission={Permission.AdmissionProgramPriorQualificationRequirementsCreate}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Add Requirement
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load prior qualification requirements."}
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
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No prior qualification requirements yet. Seed Qualification Types, then add program
            rules.
          </Typography.Text>
          <PermissionGuard
            permission={Permission.AdmissionProgramPriorQualificationRequirementsCreate}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Add Requirement
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
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No requirements match your search or filters.
          </Typography.Text>
          <Button type="link" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={12}>
            {groups.map((group) => (
              <ProgramPriorQualRequirementCard
                key={group.programId}
                group={group}
                canEdit={canEdit}
                canDelete={canDelete}
                onAddRequirement={handleOpenAddRequirement}
                onViewRequirement={handleOpenViewRequirement}
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

      <ProgramPriorQualRequirementFormModal
        open={formOpen}
        target={formTarget}
        presetProgramId={formPresetProgramId}
        onClose={handleCloseForm}
        programs={programs}
        qualificationTypes={qualificationTypes}
        levels={levels}
        getUsedTypeIdsForProgram={getUsedTypeIdsForProgram}
      />
      <DeleteProgramPriorQualRequirementModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <ProgramPriorQualRequirementDrawer
        requirement={viewTarget}
        open={viewTarget !== null}
        onClose={handleCloseView}
        onEdit={(requirement) => {
          handleCloseView();
          handleOpenEditRequirement(requirement);
        }}
        onDelete={(requirement) => {
          handleCloseView();
          handleOpenDeleteRequirement(requirement);
        }}
      />
    </Flex>
  );
}
