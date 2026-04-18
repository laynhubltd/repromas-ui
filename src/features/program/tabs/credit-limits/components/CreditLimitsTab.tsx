// Feature: program-credit-limits
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
    Popover,
    Row,
    Select,
    Typography,
} from "antd";
import { useState } from "react";
import { useCreditLimitsTab } from "../hooks/useCreditLimitsTab";
import { CreditLimitsTable } from "./CreditLimitsTable";
import { CreditLimitFormModal } from "./modals/CreditLimitFormModal";
import { DeleteCreditLimitModal } from "./modals/DeleteCreditLimitModal";

export function CreditLimitsTab() {
  const token = useToken();
  const { state, actions, flags } = useCreditLimitsTab();
  const {
    limits,
    programs,
    levels,
    sessions,
    semesterTypes,
    statuses,
    isLoading,
    isError,
    totalLimits,
    programsConfigured,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    activeFilterCount,
    pagination,
    programsLoading,
    levelsLoading,
    sessionsLoading,
    semesterTypesLoading,
    statusesLoading,
  } = state;
  const {
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleFilterChange,
    handleClearFilters,
    refetch,
  } = actions;
  const { hasLimits, isFiltering } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const cardState = isLoading ? "loading" : "default";

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Program" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any program"
            allowClear
            onChange={(val: number | undefined) =>
              handleFilterChange("programId", val)
            }
            style={{ width: "100%" }}
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>
        <Form.Item label="Level" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any level"
            allowClear
            onChange={(val: number | undefined) =>
              handleFilterChange("levelId", val)
            }
            style={{ width: "100%" }}
            options={levels.map((l) => ({ value: l.id, label: l.name }))}
          />
        </Form.Item>
        <Form.Item label="Session" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any session"
            allowClear
            onChange={(val: number | undefined) =>
              handleFilterChange("sessionId", val)
            }
            style={{ width: "100%" }}
            options={sessions.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>
        <Form.Item label="Semester Type" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any semester type"
            allowClear
            onChange={(val: number | undefined) =>
              handleFilterChange("semesterTypeId", val)
            }
            style={{ width: "100%" }}
            options={semesterTypes.map((st) => ({
              value: st.id,
              label: st.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="Student Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any status"
            allowClear
            onChange={(val: number | undefined) =>
              handleFilterChange("statusId", val)
            }
            style={{ width: "100%" }}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
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
        title="Credit Load Limits"
        body="Credit load limits define the minimum and maximum credit units a student may register per semester. Rules are matched by context (program, level, session, semester type, student status) — the rule with the highest priority weight wins. Without a matching rule, students will receive an error during course registration."
        dismissible
        collapsible
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Limits"
            value={totalLimits}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Programs Configured"
            value={isLoading ? "—" : programsConfigured}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" wrap="wrap">
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

        <PermissionGuard permission={Permission.RegistrationCreditLimitsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Credit Limit
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
            error="Failed to load credit limit configurations"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasLimits && !isFiltering}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16 }}
          >
            No credit limit rules found. Create your first credit limit to allow
            students to register for courses.
          </Typography.Text>
          <PermissionGuard
            permission={Permission.RegistrationCreditLimitsCreate}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Credit Limit
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && isFiltering && limits.length === 0}
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
            No credit limit rules match your current filters.
          </Typography.Text>
          <Button type="link" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && (hasLimits || isFiltering) && limits.length > 0}
        >
          <CreditLimitsTable
            limits={limits}
            programs={programs}
            levels={levels}
            sessions={sessions}
            semesterTypes={semesterTypes}
            statuses={statuses}
            pagination={pagination}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </ConditionalRenderer>
      </DataLoader>

      <CreditLimitFormModal
        open={formModalOpen}
        target={formTarget}
        programs={programs}
        levels={levels}
        sessions={sessions}
        semesterTypes={semesterTypes}
        statuses={statuses}
        programsLoading={programsLoading}
        levelsLoading={levelsLoading}
        sessionsLoading={sessionsLoading}
        semesterTypesLoading={semesterTypesLoading}
        statusesLoading={statusesLoading}
        onClose={handleCloseForm}
      />
      <DeleteCreditLimitModal
        open={deleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
