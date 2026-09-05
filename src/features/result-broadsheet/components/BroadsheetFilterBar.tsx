import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { FilePdfOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Select, Space, Typography } from "antd";
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
  onRefresh,
  onExportPdf,
}: BroadsheetFilterBarProps) {
  return (
    <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
      <Flex wrap="wrap" gap={12} justify="space-between" align="center">
        {/* Dropdown Filters */}
        <Flex wrap="wrap" gap={12} align="center" flex={1}>
          {/* Session */}
          <div style={{ minWidth: 140 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
              Academic Session
            </Typography.Text>
            <Select
              placeholder="Select Session"
              value={sessionId}
              onChange={onSessionChange}
              loading={isLoadingOptions}
              style={{ width: "100%" }}
              options={sessions.map((s) => ({
                value: s.id,
                label: `${s.name}${s.isCurrent ? " (Current)" : ""}`,
              }))}
            />
          </div>

          {/* Semester Type */}
          <div style={{ minWidth: 140 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
              Semester Type
            </Typography.Text>
            <Select
              placeholder="Select Semester"
              value={semesterTypeId}
              onChange={onSemesterTypeChange}
              loading={isLoadingOptions}
              style={{ width: "100%" }}
              options={semesterTypes.map((st) => ({
                value: st.id,
                label: st.name,
              }))}
            />
          </div>

          {/* Program */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
              Program
            </Typography.Text>
            <Select
              placeholder="Select Program"
              value={programId}
              onChange={onProgramChange}
              loading={isLoadingOptions}
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              options={programs.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </div>

          {/* Level */}
          <div style={{ minWidth: 130 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
              Level
            </Typography.Text>
            <Select
              placeholder="Select Level"
              value={levelId}
              onChange={onLevelChange}
              loading={isLoadingOptions}
              style={{ width: "100%" }}
              options={levels.map((l) => ({
                value: l.id,
                label: l.name,
              }))}
            />
          </div>

          {/* Optional Curriculum Version */}
          {curriculumVersions.length > 0 && (
            <div style={{ minWidth: 160 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
                Curriculum Version
              </Typography.Text>
              <Select
                placeholder="All Versions"
                allowClear
                value={curriculumVersionId}
                onChange={onCurriculumVersionChange}
                loading={isLoadingOptions}
                style={{ width: "100%" }}
                options={curriculumVersions.map((cv) => ({
                  value: cv.id,
                  label: cv.name,
                }))}
              />
            </div>
          )}
        </Flex>

        {/* Action Controls */}
        <Space size="middle" wrap>
          <CourseVisibilityPicker
            courses={courses}
            visibleCourseCodes={visibleCourseCodes}
            onChange={onVisibleCourseCodesChange}
            disabled={courses.length === 0}
          />

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
    </Card>
  );
}
