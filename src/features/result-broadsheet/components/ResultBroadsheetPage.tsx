import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Alert, Card, Empty, Flex, Tabs, Typography } from "antd";
import { type BroadsheetCellMode } from "@/components/ui-kit";
import { useCallback, useState } from "react";
import { useBroadsheetFilters } from "../hooks/useBroadsheetFilters";
import { usePdfExport } from "../hooks/usePdfExport";
import { useBroadsheetReport } from "../hooks/useBroadsheetReport";
import { BroadsheetExplainer } from "./BroadsheetExplainer";
import { BroadsheetFilterBar } from "./BroadsheetFilterBar";
import { BroadsheetMatrixTable } from "./BroadsheetMatrixTable";
import { BroadsheetMetricsRow } from "./BroadsheetMetricsRow";
import { CohortStatisticsCards } from "./CohortStatisticsCards";
import { GradeDistributionMatrix } from "./GradeDistributionMatrix";
import { GraduatesTable } from "./GraduatesTable";
import { SpecialHighlightsTable } from "./SpecialHighlightsTable";

const CELL_MODE_STORAGE_KEY = "repromas_broadsheet_cell_mode";

function getInitialCellMode(): BroadsheetCellMode {
  try {
    const saved = localStorage.getItem(CELL_MODE_STORAGE_KEY);
    if (
      saved === "score-gp-np" ||
      saved === "score-grade-gp" ||
      saved === "score-grade" ||
      saved === "score-only"
    ) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable in some browser settings
  }
  return "score-gp-np";
}

export function ResultBroadsheetPage() {
  const [activeTabKey, setActiveTabKey] = useState<string>("matrix");
  const [cellMode, setCellMode] = useState<BroadsheetCellMode>(getInitialCellMode);

  const handleCellModeChange = useCallback((mode: BroadsheetCellMode) => {
    setCellMode(mode);
    try {
      localStorage.setItem(CELL_MODE_STORAGE_KEY, mode);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const {
    state: filterState,
    data: filterData,
    actions: filterActions,
  } = useBroadsheetFilters();

  const {
    state: reportState,
    actions: reportActions,
  } = useBroadsheetReport(filterState.filterParams);

  const { isExporting, handleExportPdf } = usePdfExport(
    filterState.filterParams,
    reportState.meta,
  );

  const tabItems = [
    {
      key: "matrix",
      label: "Broadsheet Matrix",
      children: (
        <BroadsheetMatrixTable
          courses={reportState.courses}
          rows={reportState.rows}
          visibleCourseCodes={filterState.visibleCourseCodes}
          cellMode={cellMode}
          isLoading={reportState.isFetching}
          watermarkText={reportState.meta?.institutionName}
        />
      ),
    },
    {
      key: "summary",
      label: "Summary & Highlights",
      children: (
        <Flex vertical gap={16}>
          {reportState.summaryPage?.gradeDistribution && (
            <GradeDistributionMatrix
              gradeLetters={reportState.summaryPage.gradeLetters}
              gradeDistribution={reportState.summaryPage.gradeDistribution}
              courses={reportState.courses}
              isLoading={reportState.isFetching}
            />
          )}
          <CohortStatisticsCards statistics={reportState.statistics} />
          {reportState.summaryPage?.specialHighlights &&
            reportState.summaryPage.specialHighlights.length > 0 && (
              <SpecialHighlightsTable
                specialHighlights={reportState.summaryPage.specialHighlights}
                rows={reportState.rows}
                isLoading={reportState.isFetching}
              />
            )}
        </Flex>
      ),
    },
    ...(reportState.hasGraduates
      ? [
          {
            key: "graduates",
            label: `Graduates (${reportState.graduatedStudents.length})`,
            children: (
              <GraduatesTable
                graduatedStudents={reportState.graduatedStudents}
                classificationFootnote={reportState.classificationFootnote}
                isLoading={reportState.isFetching}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <PermissionGuard
      permission={Permission.ResultBroadsheetRead}
      fallback={
        <Alert
          type="error"
          message="Access Denied"
          description="You do not have permission to view result broadsheets."
          showIcon
        />
      }
    >
      <Flex
        vertical
        gap={16}
        style={{
          padding: "16px 12px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* Explainer Callout */}
        <BroadsheetExplainer />

        {/* Metrics Overview Row */}
        <BroadsheetMetricsRow
          statistics={reportState.statistics}
          isLoading={reportState.isLoading}
        />

        {/* Filter Toolbar */}
        <BroadsheetFilterBar
          sessionId={filterState.sessionId}
          semesterTypeId={filterState.semesterTypeId}
          programId={filterState.programId}
          levelId={filterState.levelId}
          curriculumVersionId={filterState.curriculumVersionId}
          visibleCourseCodes={filterState.visibleCourseCodes}
          cellMode={cellMode}
          courses={reportState.courses}
          sessions={filterData.sessions}
          semesterTypes={filterData.semesterTypes}
          programs={filterData.programs}
          levels={filterData.levels}
          curriculumVersions={filterData.curriculumVersions}
          isLoadingOptions={filterData.isLoadingOptions}
          isFetching={reportState.isFetching}
          isExporting={isExporting}
          onSessionChange={filterActions.setSessionId}
          onSemesterTypeChange={filterActions.setSemesterTypeId}
          onProgramChange={filterActions.setProgramId}
          onLevelChange={filterActions.setLevelId}
          onCurriculumVersionChange={filterActions.setCurriculumVersionId}
          onVisibleCourseCodesChange={filterActions.setVisibleCourseCodes}
          onCellModeChange={handleCellModeChange}
          onRefresh={reportActions.refetch}
          onExportPdf={handleExportPdf}
        />

        {/* Content Body */}
        {!filterState.isFilterComplete ? (
          <Card>
            <Empty
              description={
                <Typography.Text type="secondary">
                  Please select an Academic Session, Semester, Program, and Level to view the cohort broadsheet.
                </Typography.Text>
              }
            />
          </Card>
        ) : reportState.isLoading ? (
          <Card>
            <SkeletonRows count={8} />
          </Card>
        ) : reportState.isError ? (
          <ErrorAlert
            variant="section"
            error={
              typeof reportState.error === "object" &&
              reportState.error !== null &&
              "data" in reportState.error &&
              typeof (reportState.error as { data?: { message?: string } }).data?.message === "string"
                ? (reportState.error as { data?: { message?: string } }).data?.message ?? "Failed to load result broadsheet."
                : "Unable to retrieve cohort results."
            }
            onRetry={() => {
              void reportActions.refetch();
            }}
          />
        ) : !reportState.hasData ? (
          <Card>
            <Empty
              description={
                <Typography.Text type="secondary">
                  No evaluated results found for this cohort diet.
                </Typography.Text>
              }
            />
          </Card>
        ) : (
          <Card
            styles={{ body: { padding: "12px 14px" } }}
            style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
          >
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              items={tabItems}
              style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
            />
          </Card>
        )}
      </Flex>
    </PermissionGuard>
  );
}
