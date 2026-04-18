// Feature: system-config
import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Alert, Col, Flex, Row, Typography } from "antd";
import { useSystemConfigTab } from "../hooks/useSystemConfigTab";
import { DeleteSystemConfigModal } from "./modals/DeleteSystemConfigModal";
import { SystemConfigFormModal } from "./modals/SystemConfigFormModal";
import { SystemConfigTable } from "./SystemConfigTable";

export function SystemConfigTab() {
  const token = useToken();
  const { state, actions, flags } = useSystemConfigTab();
  const {
    filteredConfigs,
    programs,
    programsLoading,
    isLoading,
    isError,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    totalConfigs,
    programsConfigured,
    missingPrograms,
    configKeyFilter,
    scopeFilter,
    activeFilterCount,
  } = state;
  const {
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfigKeyFilterChange,
    handleScopeFilterChange,
    handleClearFilters,
    refetch,
  } = actions;
  const { isFiltering, showWarning } = flags;

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Explainer callout */}
      <ExplainerCallout
        intent="new"
        title="System Configurations"
        body="System configurations control course registration behavior. CREDIT_LOAD_LIMITS must be configured for each program before students can register for courses."
        dismissible
        collapsible
      />

      {/* Metric cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Configs"
            value={totalConfigs}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="Programs Configured"
            value={programsConfigured}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Missing CREDIT_LOAD_LIMITS warning banner */}
      <ConditionalRenderer when={showWarning}>
        <Alert
          type="warning"
          showIcon
          message="One or more programs are missing CREDIT_LOAD_LIMITS. Students in those programs cannot register for courses."
          description={
            <Flex vertical gap={4} style={{ marginTop: token.marginXXS }}>
              {missingPrograms.map((p) => (
                <Typography.Text key={p.referenceId} style={{ fontSize: token.fontSizeSM }}>
                  • {p.programName}
                </Typography.Text>
              ))}
            </Flex>
          }
        />
      </ConditionalRenderer>

      {/* Table area */}
      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load system configurations"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError}>
          <SystemConfigTable
            configs={filteredConfigs}
            programs={programs}
            configKeyFilter={configKeyFilter}
            scopeFilter={scopeFilter}
            activeFilterCount={activeFilterCount}
            isFiltering={isFiltering}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onOpenCreate={handleOpenCreate}
            onConfigKeyFilterChange={handleConfigKeyFilterChange}
            onScopeFilterChange={handleScopeFilterChange}
            onClearFilters={handleClearFilters}
          />
        </ConditionalRenderer>
      </DataLoader>

      {/* Modals */}
      <SystemConfigFormModal
        open={formModalOpen}
        target={formTarget}
        programs={programs}
        programsLoading={programsLoading}
        onClose={handleCloseForm}
      />
      <DeleteSystemConfigModal
        open={deleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
