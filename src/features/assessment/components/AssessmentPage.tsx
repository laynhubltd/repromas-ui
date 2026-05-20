// Feature: assessment
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Flex } from "antd";
import { useAssessmentFilter } from "../hooks/useAssessmentFilter";
import { useScoreSheet } from "../hooks/useScoreSheet";
import { useScoreSheetBulkOperations } from "../hooks/useScoreSheetBulkOperations";
import { FilterBar } from "./FilterBar";
import { ScoreSheetUploadModal } from "./modals/ScoreSheetUploadModal";
import { ScoreSheetUploadSummaryModal } from "./modals/ScoreSheetUploadSummaryModal";
import { ScoreSheetGuide } from "./ScoreSheetGuide";
import { ScoreSheetMeta } from "./ScoreSheetMeta";
import { ScoreSheetTable } from "./ScoreSheetTable";

export function AssessmentPage() {
  const token = useToken();

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { state: filterState, actions: filterActions } = useAssessmentFilter();
  const {
    selectedProgramId,
    selectedLevelId,
    selectedConfigId,
    programSearch,
    courseSearch,
    programOptions,
    levelOptions,
    courseConfigOptions,
    programLoading,
    levelLoading,
    courseConfigLoading,
    programError,
    levelError,
    courseConfigError,
    isCourseConfigDisabled,
  } = filterState;
  const {
    handleProgramSearch,
    handleProgramChange,
    handleLevelChange,
    handleCourseSearch,
    handleCourseConfigChange,
  } = filterActions;

  const { state: sheetState, actions: sheetActions } =
    useScoreSheet(selectedConfigId);
  const { meta, columns, rows, isLoading, error404, error500, genericError } =
    sheetState;
  const { refetch } = sheetActions;

  const selectedConfig =
    courseConfigOptions.find((c) => c.id === selectedConfigId) ?? null;

  const {
    state: bulkState,
    actions: bulkActions,
    flags: bulkFlags,
  } = useScoreSheetBulkOperations({
    courseConfigId: selectedConfigId,
    courseCode: selectedConfig?.course?.code ?? null,
    courseTitle: selectedConfig?.course?.title ?? null,
  });

  return (
    <PermissionGuard permission={Permission.StudentScoreSheetsList}>
      <Flex vertical gap={token.marginMD} style={{ width: "100%" }}>
        {/* Filter Bar */}
        <FilterBar
          programOptions={programOptions}
          programLoading={programLoading}
          programError={programError}
          selectedProgramId={selectedProgramId}
          programSearch={programSearch}
          onProgramSearch={handleProgramSearch}
          onProgramChange={handleProgramChange}
          levelOptions={levelOptions}
          levelLoading={levelLoading}
          levelError={levelError}
          selectedLevelId={selectedLevelId}
          onLevelChange={handleLevelChange}
          courseConfigOptions={courseConfigOptions}
          courseConfigLoading={courseConfigLoading}
          courseConfigError={courseConfigError}
          selectedConfigId={selectedConfigId}
          courseSearch={courseSearch}
          onCourseSearch={handleCourseSearch}
          onCourseConfigChange={handleCourseConfigChange}
          isCourseConfigDisabled={isCourseConfigDisabled}
          onDownload={bulkActions.handleDownload}
          onOpenUpload={bulkActions.handleOpenUpload}
          isDownloading={bulkState.isDownloading}
          isBulkDisabled={bulkFlags.isBulkDisabled}
        />

        {/* Guided empty state when no config is selected */}
        <ConditionalRenderer when={selectedConfigId === null}>
          <ScoreSheetGuide
            hasProgram={selectedProgramId !== null}
            hasLevel={selectedLevelId !== null}
          />
        </ConditionalRenderer>

        {/* Score sheet area */}
        <ConditionalRenderer when={selectedConfigId !== null}>
          <DataLoader
            loading={isLoading}
            loader={<SkeletonRows count={5} variant="inline" />}
          >
            {/* Error states */}
            {error404 && (
              <ErrorAlert
                variant="section"
                error={error404}
                onRetry={refetch}
              />
            )}
            {error500 && (
              <ErrorAlert
                variant="section"
                error={error500}
                onRetry={refetch}
              />
            )}
            {genericError && (
              <ErrorAlert
                variant="section"
                error={genericError}
                onRetry={refetch}
              />
            )}

            {/* Score sheet content */}
            {!error404 && !error500 && !genericError && meta && (
              <>
                <ScoreSheetMeta meta={meta} studentCount={rows.length} />
                <ScoreSheetTable columns={columns} rows={rows} />
              </>
            )}
          </DataLoader>
        </ConditionalRenderer>

        {/* Bulk Operations Modals */}
        <ConditionalRenderer when={bulkState.uploadModalOpen}>
          <ScoreSheetUploadModal
            open={bulkState.uploadModalOpen}
            onClose={bulkActions.handleCloseUpload}
            selectedFile={bulkState.selectedFile}
            isUploading={bulkState.isUploading}
            uploadError={bulkState.uploadError}
            hasFile={bulkFlags.hasFile}
            onFileChange={bulkActions.handleFileChange}
            onUpload={bulkActions.handleUpload}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={bulkState.summaryModalOpen}>
          <ScoreSheetUploadSummaryModal
            open={bulkState.summaryModalOpen}
            onClose={bulkActions.handleCloseSummary}
            summary={bulkState.summary}
            summaryState={bulkFlags.summaryState}
          />
        </ConditionalRenderer>
      </Flex>
    </PermissionGuard>
  );
}
