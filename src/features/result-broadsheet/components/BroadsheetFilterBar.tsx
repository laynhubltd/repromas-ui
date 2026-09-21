import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  BookOutlined,
  CheckCircleFilled,
  DownOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FilterOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Flex,
  Popover,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useToken } from "@/shared/hooks/useToken";
import type { BroadsheetCellMode } from "@/components/ui-kit";
import type { Program } from "@/features/program/tabs/programs/types/program";
import type {
  AcademicSession,
  SemesterType,
} from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import type { BroadsheetCourseColumn } from "../types/result-broadsheet";

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
  const token = useToken();

  // Derive active entities for the trigger summary
  const selectedSession = sessions.find((s) => s.id === sessionId);
  const selectedSemester = semesterTypes.find((st) => st.id === semesterTypeId);
  const selectedProgram = programs.find((p) => p.id === programId);
  const selectedLevel = levels.find((l) => l.id === levelId);
  const selectedVersion = curriculumVersions.find((cv) => cv.id === curriculumVersionId);

  const isScopeComplete = Boolean(
    sessionId && semesterTypeId && programId && levelId,
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState(!isScopeComplete);

  // Formatted Cohort Summary label for the trigger button
  const scopeSummaryText = isScopeComplete ? (
    <span style={{ fontWeight: 500 }}>
      {selectedProgram?.name} • {selectedLevel?.name} • {selectedSession?.name} ({selectedSemester?.name})
      {selectedVersion ? ` • ${selectedVersion.name}` : ""}
    </span>
  ) : (
    <span style={{ color: token.colorTextSecondary }}>
      Select Academic Cohort (Session, Semester, Program, Level)...
    </span>
  );

  // Visible courses computations for the Settings popover
  const allCodes = useMemo(
    () => courses.map((c) => c.courseCode ?? c.code ?? "").filter(Boolean),
    [courses],
  );
  const activeCodes = visibleCourseCodes ?? allCodes;
  const isAllSelected = activeCodes.length === allCodes.length;

  const handleToggleCode = (code: string, checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...activeCodes, code];
    } else {
      next = activeCodes.filter((c) => c !== code);
    }
    if (next.length === allCodes.length) {
      onVisibleCourseCodesChange(undefined);
    } else {
      onVisibleCourseCodesChange(next);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onVisibleCourseCodesChange(undefined);
    } else {
      onVisibleCourseCodesChange([]);
    }
  };

  const popoverContent = (
    <div style={{ width: 440, padding: "4px 2px" }}>
      {/* Popover Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
        <Flex align="center" gap={6}>
          <FilterOutlined style={{ color: token.colorPrimary }} />
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            Academic Cohort Scope
          </Typography.Text>
        </Flex>
        {isScopeComplete ? (
          <Tag color="success" icon={<CheckCircleFilled />}>
            Ready
          </Tag>
        ) : (
          <Badge status="warning" text="Selection Required" />
        )}
      </Flex>

      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 12 }}>
        Choose the academic cohort parameters to evaluate and render results.
      </Typography.Text>

      <Divider style={{ margin: "8px 0 12px 0" }} />

      {/* Popover Form Fields */}
      <Flex vertical gap={10}>
        {/* Row 1: Session & Semester */}
        <Flex gap={8}>
          <div style={{ flex: "1 1 50%" }}>
            <Typography.Text style={{ fontSize: token.fontSizeSM - 1, display: "block", marginBottom: 4, fontWeight: 500 }}>
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

          <div style={{ flex: "1 1 50%" }}>
            <Typography.Text style={{ fontSize: token.fontSizeSM - 1, display: "block", marginBottom: 4, fontWeight: 500 }}>
              Semester
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
        </Flex>

        {/* Row 2: Program */}
        <div>
          <Typography.Text style={{ fontSize: token.fontSizeSM - 1, display: "block", marginBottom: 4, fontWeight: 500 }}>
            Program
          </Typography.Text>
          <Select
            placeholder="Search & Select Program"
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

        {/* Row 3: Level & Optional Curriculum Version */}
        <Flex gap={8}>
          <div style={{ flex: curriculumVersions.length > 0 ? "1 1 45%" : "1 1 100%" }}>
            <Typography.Text style={{ fontSize: token.fontSizeSM - 1, display: "block", marginBottom: 4, fontWeight: 500 }}>
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

          {curriculumVersions.length > 0 && (
            <div style={{ flex: "1 1 55%" }}>
              <Typography.Text style={{ fontSize: token.fontSizeSM - 1, display: "block", marginBottom: 4, fontWeight: 500 }}>
                Curriculum Version (Optional)
              </Typography.Text>
              <Select
                placeholder="Default Version"
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
      </Flex>

      <Divider style={{ margin: "14px 0 10px 0" }} />

      {/* Popover Footer */}
      <Flex justify="space-between" align="center">
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM - 1 }}>
          {isScopeComplete ? "Ready to view broadsheet" : "All 4 parameters required"}
        </Typography.Text>
        <Button size="small" type="primary" onClick={() => setIsPopoverOpen(false)}>
          Done
        </Button>
      </Flex>
    </div>
  );

  // Popover for View & Table Settings (Display Mode + Course Visibility)
  const viewSettingsContent = (
    <div style={{ width: 300, padding: "2px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Text strong style={{ fontSize: token.fontSize }}>
          View & Table Settings
        </Typography.Text>
      </Flex>

      {/* Display Mode */}
      {onCellModeChange && (
        <div style={{ marginBottom: 10 }}>
          <Typography.Text
            style={{
              fontSize: token.fontSizeSM - 1,
              display: "block",
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            Cell Metrics Display
          </Typography.Text>
          <Select<BroadsheetCellMode>
            value={cellMode}
            onChange={onCellModeChange}
            style={{ width: "100%" }}
            options={[
              { value: "score-gp-np", label: "Full Ledger (SC/GR/GP/NP)" },
              { value: "score-grade-gp", label: "Standard (SC/GR/GP)" },
              { value: "score-grade", label: "Compact (SC/Grade)" },
              { value: "score-only", label: "Scores Only (SC)" },
            ]}
          />
        </div>
      )}

      {/* Course Columns Visibility */}
      {courses.length > 0 && (
        <>
          <Divider style={{ margin: "10px 0" }} />
          <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
            <Typography.Text
              style={{
                fontSize: token.fontSizeSM - 1,
                fontWeight: 500,
              }}
            >
              Visible Courses
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {activeCodes.length} / {allCodes.length}
            </Typography.Text>
          </Flex>

          <Checkbox
            checked={isAllSelected}
            indeterminate={
              activeCodes.length > 0 && activeCodes.length < allCodes.length
            }
            onChange={(e) => handleToggleAll(e.target.checked)}
            style={{ marginBottom: 6 }}
          >
            Select All
          </Checkbox>

          <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
            <Flex vertical gap={6}>
              {courses.map((course) => {
                const code = course.courseCode ?? course.code ?? "";
                const creditUnits = course.creditUnits ?? course.creditUnit ?? 0;
                const checked = activeCodes.includes(code);
                return (
                  <Checkbox
                    key={code}
                    checked={checked}
                    onChange={(e) => handleToggleCode(code, e.target.checked)}
                  >
                    <span>{code}</span>{" "}
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      ({creditUnits}u)
                    </Typography.Text>
                  </Checkbox>
                );
              })}
            </Flex>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card size="small" styles={{ body: { padding: "6px 10px" } }}>
      <Flex
        wrap="nowrap"
        gap={8}
        align="center"
        justify="space-between"
        style={{ width: "100%", minWidth: 0 }}
      >
        {/* Left: Unified Scope Trigger Button with Popover */}
        <Popover
          content={popoverContent}
          trigger="click"
          placement="bottomLeft"
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <Button
            icon={<BookOutlined style={{ color: isScopeComplete ? token.colorPrimary : token.colorWarning }} />}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              maxWidth: "100%",
              minWidth: 260,
              textAlign: "left",
              padding: "4px 10px",
              borderColor: isScopeComplete ? token.colorBorder : token.colorWarningBorder,
              background: isScopeComplete ? token.colorBgContainer : token.colorWarningBg,
            }}
          >
            <span
              style={{
                flex: "1 1 auto",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: token.fontSizeSM,
              }}
            >
              {scopeSummaryText}
            </span>
            <DownOutlined style={{ fontSize: 10, color: token.colorTextSecondary, marginLeft: 4 }} />
          </Button>
        </Popover>

        {/* Right: Settings Popover, Refresh, and Export Controls */}
        <Flex
          wrap="nowrap"
          gap={6}
          align="center"
          style={{ flex: "0 0 auto" }}
        >
          {/* View Settings Popover: Setting Icon only trigger */}
          <Popover
            content={viewSettingsContent}
            trigger="click"
            placement="bottomRight"
          >
            <Tooltip title="View & Table Settings">
              <Button
                icon={<SettingOutlined />}
                disabled={!programId || !levelId}
                aria-label="View and Table Settings"
              />
            </Tooltip>
          </Popover>

          <Tooltip title="Refresh Broadsheet Data">
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={onRefresh}
              disabled={!programId || !levelId}
              aria-label="Refresh Broadsheet Data"
            />
          </Tooltip>

          <PermissionGuard permission={Permission.ResultBroadsheetExport}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "pdf",
                    label: "Official Broadsheet (PDF)",
                    icon: <FilePdfOutlined />,
                    onClick: onExportPdf,
                  },
                ],
              }}
              placement="bottomRight"
              disabled={!programId || !levelId || courses.length === 0}
            >
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isExporting}
                disabled={!programId || !levelId || courses.length === 0}
              >
                Export <DownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
              </Button>
            </Dropdown>
          </PermissionGuard>
        </Flex>
      </Flex>
    </Card>
  );
}
