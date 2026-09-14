import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { WorkflowStatusBar } from "@/features/approval-workflow";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Flex } from "antd";
import { useMemo } from "react";
import { useAssessmentFilter } from "../hooks/useAssessmentFilter";
import { useScoreSheet } from "../hooks/useScoreSheet";
import { useScoreSheetBulkOperations } from "../hooks/useScoreSheetBulkOperations";
import { FilterBar } from "./FilterBar";
import { ScoreSheetUploadModal } from "./modals/ScoreSheetUploadModal";
import { ScoreSheetUploadSummaryModal } from "./modals/ScoreSheetUploadSummaryModal";
import { ScoreSheetGuide } from "./ScoreSheetGuide";
import { ScoreSheetMeta } from "./ScoreSheetMeta";
import { ScoreSheetTable } from "./ScoreSheetTable";
import type { CourseConfigurationGroupOption } from "@/features/courses";

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
    courseConfigGroupedOptions,
    programLoading,
    courseConfigLoading,
    programError,
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

  const selectedConfigOption = useMemo(() => {
    if (selectedConfigId === null) return null;
    const safeGroups: CourseConfigurationGroupOption[] = Array.isArray(
      courseConfigGroupedOptions,
    )
      ? courseConfigGroupedOptions
      : ((courseConfigGroupedOptions as any)?.member ?? []);
    for (const group of safeGroups) {
      const found = (group.options ?? []).find(
        (opt) => opt.value === selectedConfigId,
      );
      if (found) return found;
    }
    return null;
  }, [courseConfigGroupedOptions, selectedConfigId]);

  const {
    state: bulkState,
    actions: bulkActions,
    flags: bulkFlags,
  } = useScoreSheetBulkOperations({
    courseConfigId: selectedConfigId,
    courseCode: selectedConfigOption?.code ?? meta?.courseCode ?? null,
    courseTitle: selectedConfigOption?.title ?? meta?.courseName ?? null,
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
          selectedLevelId={selectedLevelId}
          onLevelChange={handleLevelChange}
          courseConfigGroupedOptions={courseConfigGroupedOptions}
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
            {!error404 && !error500 && !genericError && meta && selectedConfigId !== null && (
              <>
                <ScoreSheetMeta meta={meta} studentCount={rows.length} />
                <WorkflowStatusBar
                  targetEntity="COURSE_SCORE_SHEET"
                  targetId={selectedConfigId}
                  targetTag={ApiTagTypes.StudentScoreSheetData}
                />
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
