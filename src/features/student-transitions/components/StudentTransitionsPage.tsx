import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Empty, Flex } from "antd";
import { useState } from "react";
import {
  useGetStudentResultsByLevelQuery,
  useListAvailableTransitionStatusesQuery,
} from "../api/studentTransitionEvaluationApi";
import { useApplyTransitionsFlow } from "../hooks/useApplyTransitionsFlow";
import { useTransitionEvaluationFilter } from "../hooks/useTransitionEvaluationFilter";
import { useTransitionOverrides } from "../hooks/useTransitionOverrides";
import type { StudentResultItemDTO } from "../types/student-transition-evaluation";
import { SingleStudentTransitionDrawer } from "./SingleStudentTransitionDrawer";
import { TransitionBatchToolbar } from "./TransitionBatchToolbar";
import { TransitionEvaluationTable } from "./TransitionEvaluationTable";
import { TransitionExplainerCallout } from "./TransitionExplainerCallout";
import { TransitionMetricsRow } from "./TransitionMetricsRow";
import { TransitionPreviewModal } from "./TransitionPreviewModal";

export function StudentTransitionsPage() {
  const token = useToken();

  // 1. Filter Hook
  const { state: filterState, actions: filterActions } = useTransitionEvaluationFilter();
  const {
    selectedSessionId,
    selectedSemesterTypeId,
    selectedProgramId,
    selectedLevelId,
    matchedSemesterId,
    isTerminal,
    page,
    itemsPerPage,
    cohortKey,
    isFilterComplete,
    sessionOptions,
    semesterTypeOptions,
    programOptions,
    levelOptions,
    isLoadingOptions,
  } = filterState;

  // 2. Overrides Hook
  const {
    overridesMap,
    stagedCount,
    setOverride,
    removeOverride,
    clearAllOverrides,
    getPayloadOverrides,
  } = useTransitionOverrides(cohortKey);

  // 3. Statuses Dictionary Query
  const { data: statusesData } = useListAvailableTransitionStatusesQuery();
  const availableStatuses = statusesData?.member ?? [];

  // 4. Broadsheet Evaluation Query
  const {
    data: resultsData,
    isLoading: isLoadingResults,
    isFetching: isFetchingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useGetStudentResultsByLevelQuery(
    {
      programId: selectedProgramId!,
      levelId: selectedLevelId!,
      semesterTypeId: selectedSemesterTypeId!,
      sessionId: selectedSessionId!,
      pagination: true,
      page,
      itemsPerPage,
      terminal: isTerminal,
    },
    { skip: !isFilterComplete }
  );

  const students = resultsData?.member ?? [];
  const totalItems = resultsData?.totalItems ?? 0;

  // 5. Execution Flow Hook
  const { state: flowState, actions: flowActions } = useApplyTransitionsFlow({
    programId: selectedProgramId,
    levelId: selectedLevelId,
    sessionId: selectedSessionId,
    semesterId: matchedSemesterId,
    semesterTypeId: selectedSemesterTypeId,
    overrides: getPayloadOverrides(),
    onSuccessCommit: () => {
      clearAllOverrides();
      refetchResults();
    },
  });

  // 6. Single Student Drawer State
  const [inspectedStudent, setInspectedStudent] = useState<StudentResultItemDTO | null>(null);

  // Reference maps for drawer
  const sessionMap = Object.fromEntries(sessionOptions.map((s) => [s.id, s.name]));
  const levelMap = Object.fromEntries(levelOptions.map((l) => [l.id, l.name]));

  // Metrics derivation
  const actionableCount = students.filter((s) => s.summary.isActionable).length;
  const deferredCount = students.filter((s) => !s.summary.isActionable).length;

  return (
    <PermissionGuard permission={Permission.StudentEnrollmentTransitionsList}>
      <Flex vertical gap={token.marginMD} style={{ width: "100%" }}>
        {/* Banner Explainer */}
        <TransitionExplainerCallout />

        {/* Metrics Row */}
        <TransitionMetricsRow
          totalEvaluated={totalItems}
          actionableCount={actionableCount}
          deferredCount={deferredCount}
          stagedOverrides={overridesMap}
          isLoading={isLoadingResults || isFetchingResults}
          onClearOverrides={clearAllOverrides}
          onRemoveOverride={removeOverride}
        />

        {/* Filter & Batch Action Toolbar */}
        <TransitionBatchToolbar
          sessionOptions={sessionOptions}
          semesterTypeOptions={semesterTypeOptions}
          programOptions={programOptions}
          levelOptions={levelOptions}
          selectedSessionId={selectedSessionId}
          selectedSemesterTypeId={selectedSemesterTypeId}
          selectedProgramId={selectedProgramId}
          selectedLevelId={selectedLevelId}
          isTerminal={isTerminal}
          isSimulating={flowState.isSimulating}
          isFilterComplete={isFilterComplete}
          stagedOverridesCount={stagedCount}
          onSessionChange={filterActions.handleSessionChange}
          onSemesterTypeChange={filterActions.handleSemesterTypeChange}
          onProgramChange={filterActions.handleProgramChange}
          onLevelChange={filterActions.handleLevelChange}
          onTerminalToggle={filterActions.handleTerminalToggle}
          onOpenSimulation={flowActions.runDryRunSimulation}
        />

        {/* Guided Empty State when cohort is not yet selected */}
        <ConditionalRenderer when={!isFilterComplete}>
          <div
            style={{
              padding: token.paddingLG * 2,
              textAlign: "center",
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              border: `1px dashed ${token.colorBorderSecondary}`,
            }}
          >
            <Empty
              description="Please select an Academic Session, Semester Type, Program, and Nominal Level above to evaluate student transitions."
            />
          </div>
        </ConditionalRenderer>

        {/* Results Data Loader */}
        <ConditionalRenderer when={isFilterComplete}>
          <DataLoader
            loading={isLoadingResults}
            loader={<SkeletonRows count={5} variant="card" />}
          >
            {resultsError && (
              <ErrorAlert
                variant="section"
                error="Failed to load evaluated student standing results for the selected cohort."
                onRetry={refetchResults}
              />
            )}

            {!resultsError && (
              <TransitionEvaluationTable
                students={students}
                totalItems={totalItems}
                page={page}
                itemsPerPage={itemsPerPage}
                isLoading={isFetchingResults}
                availableStatuses={availableStatuses}
                overridesMap={overridesMap}
                onPageChange={(p, ps) => {
                  filterActions.setPage(p);
                  filterActions.setItemsPerPage(ps);
                }}
                onSetOverride={setOverride}
                onRemoveOverride={removeOverride}
                onInspectStudent={(s) => setInspectedStudent(s)}
              />
            )}
          </DataLoader>
        </ConditionalRenderer>

        {/* Dry-Run Simulation Preview & Commit Modal */}
        <TransitionPreviewModal
          open={flowState.previewModalOpen}
          simulationResult={flowState.simulationResult}
          isApplying={flowState.isApplying}
          onClose={flowActions.closePreviewModal}
          onCommit={flowActions.commitTransitions}
        />

        {/* Single Student Transition Ledger Drawer */}
        <SingleStudentTransitionDrawer
          open={inspectedStudent !== null}
          student={inspectedStudent}
          availableStatuses={availableStatuses}
          sessionMap={sessionMap}
          levelMap={levelMap}
          onClose={() => setInspectedStudent(null)}
        />
      </Flex>
    </PermissionGuard>
  );
}

export default StudentTransitionsPage;
