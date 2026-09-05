import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Alert, Card, Empty, Flex, Tabs, Typography } from "antd";
import { useState } from "react";
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

export function ResultBroadsheetPage() {
  const [activeTabKey, setActiveTabKey] = useState<string>("matrix");

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
          isLoading={reportState.isFetching}
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
      <Flex vertical gap={20} style={{ padding: "16px 24px" }}>
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
          <Card styles={{ body: { padding: "12px 16px" } }}>
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              items={tabItems}
            />
          </Card>
        )}
      </Flex>
    </PermissionGuard>
  );
}
