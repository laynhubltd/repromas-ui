import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { FilePdfOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Flex, Select, Space } from "antd";
import type { BroadsheetCellMode } from "@/components/ui-kit";
import type { Program } from "@/features/program/tabs/programs/types/program";
import type {
  AcademicSession,
  SemesterType,
} from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { BroadsheetCourseColumn } from "../types/result-broadsheet";
import { CourseVisibilityPicker } from "./CourseVisibilityPicker";

export interface BroadsheetFilterBarProps {
  sessionId?: number;
  semesterTypeId?: number;
  programId?: number;
  levelId?: number;
  curriculumVersionId?: number;
  visibleCourseCodes?: string[];
  cellMode?: BroadsheetCellMode;
  courses: BroadsheetCourseColumn[];
  sessions: AcademicSession[];
  semesterTypes: SemesterType[];
  programs: Program[];
  levels: Level[];
  curriculumVersions: CurriculumVersion[];
  isLoadingOptions?: boolean;
  isFetching?: boolean;
  isExporting?: boolean;
  onSessionChange: (id: number | undefined) => void;
  onSemesterTypeChange: (id: number | undefined) => void;
  onProgramChange: (id: number | undefined) => void;
  onLevelChange: (id: number | undefined) => void;
  onCurriculumVersionChange: (id: number | undefined) => void;
  onVisibleCourseCodesChange: (codes: string[] | undefined) => void;
  onCellModeChange?: (mode: BroadsheetCellMode) => void;
  onRefresh: () => void;
  onExportPdf: () => void;
}

export function BroadsheetFilterBar({
  sessionId,
  semesterTypeId,
  programId,
  levelId,
  curriculumVersionId,
  visibleCourseCodes,
  cellMode = "score-gp-np",
  courses,
  sessions,
  semesterTypes,
  programs,
  levels,
  curriculumVersions,
  isLoadingOptions = false,
  isFetching = false,
  isExporting = false,
  onSessionChange,
  onSemesterTypeChange,
  onProgramChange,
  onLevelChange,
  onCurriculumVersionChange,
  onVisibleCourseCodesChange,
  onCellModeChange,
  onRefresh,
  onExportPdf,
}: BroadsheetFilterBarProps) {
  return (
    <Card size="small" styles={{ body: { padding: "10px 14px" } }}>
      <Flex vertical gap={8} style={{ width: "100%", minWidth: 0 }}>
        {/* Row 1: Academic Cohort Scope Filters */}
        <Flex
          wrap="wrap"
          gap={8}
          align="center"
          style={{ width: "100%", minWidth: 0 }}
        >
          {/* Academic Session */}
          <Select
            placeholder="Academic Session"
            value={sessionId}
            onChange={onSessionChange}
            loading={isLoadingOptions}
            style={{ flex: "1 1 140px", minWidth: 130 }}
            options={sessions.map((s) => ({
              value: s.id,
              label: `${s.name}${s.isCurrent ? " (Current)" : ""}`,
            }))}
          />

          {/* Semester Type */}
          <Select
            placeholder="Semester Type"
            value={semesterTypeId}
            onChange={onSemesterTypeChange}
            loading={isLoadingOptions}
            style={{ flex: "1 1 130px", minWidth: 120 }}
            options={semesterTypes.map((st) => ({
              value: st.id,
              label: st.name,
            }))}
          />

          {/* Program */}
          <Select
            placeholder="Select Program"
            value={programId}
            onChange={onProgramChange}
            loading={isLoadingOptions}
            showSearch
            optionFilterProp="label"
            style={{ flex: "2 1 200px", minWidth: 180 }}
            options={programs.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />

          {/* Level */}
          <Select
            placeholder="Level"
            value={levelId}
            onChange={onLevelChange}
            loading={isLoadingOptions}
            style={{ flex: "1 1 100px", minWidth: 95 }}
            options={levels.map((l) => ({
              value: l.id,
              label: l.name,
            }))}
          />

          {/* Optional Curriculum Version */}
          {curriculumVersions.length > 0 && (
            <Select
              placeholder="Curriculum Version"
              allowClear
              value={curriculumVersionId}
              onChange={onCurriculumVersionChange}
              loading={isLoadingOptions}
              style={{ flex: "1 1 140px", minWidth: 130 }}
              options={curriculumVersions.map((cv) => ({
                value: cv.id,
                label: cv.name,
              }))}
            />
          )}
        </Flex>

        {/* Subtle Horizontal Divider */}
        <Divider style={{ margin: "2px 0" }} />

        {/* Row 2: View Controls (Left) & Primary Actions (Right) */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={8}
          style={{ width: "100%", minWidth: 0 }}
        >
          {/* Left: Display Options */}
          <Space size="small" wrap>
            {onCellModeChange && (
              <Select<BroadsheetCellMode>
                value={cellMode}
                onChange={onCellModeChange}
                style={{ width: 175 }}
                options={[
                  { value: "score-gp-np", label: "Full Ledger (SC/GR/GP/NP)" },
                  { value: "score-grade-gp", label: "Standard (SC/GR/GP)" },
                  { value: "score-grade", label: "Compact (SC/Grade)" },
                  { value: "score-only", label: "Scores Only (SC)" },
                ]}
              />
            )}

            <CourseVisibilityPicker
              courses={courses}
              visibleCourseCodes={visibleCourseCodes}
              onChange={onVisibleCourseCodesChange}
              disabled={courses.length === 0}
            />
          </Space>

          {/* Right: Actions */}
          <Space size="small" wrap>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={onRefresh}
              disabled={!programId || !levelId}
            >
              Refresh
            </Button>

            <PermissionGuard permission={Permission.ResultBroadsheetExport}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={onExportPdf}
                loading={isExporting}
                disabled={!programId || !levelId || courses.length === 0}
              >
                Export PDF
              </Button>
            </PermissionGuard>
          </Space>
        </Flex>
      </Flex>
    </Card>
  );
}
