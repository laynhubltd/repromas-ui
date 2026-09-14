// Feature: assessment
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { CourseConfigurationGroupOption } from "@/features/courses/tabs/course-configurations/types/course-configuration";
import type { Program } from "@/features/program/tabs/programs/types/program";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, Flex, Select, Spin } from "antd";

export type FilterBarProps = {
  // Program selector
  programOptions: Program[];
  programLoading: boolean;
  programError: string | null;
  selectedProgramId: number | null;
  programSearch: string;
  onProgramSearch: (value: string) => void;
  onProgramChange: (id: number | null) => void;
  // Level selector
  selectedLevelId: number | null;
  onLevelChange: (id: number | null) => void;
  // Course config selector
  courseConfigGroupedOptions: CourseConfigurationGroupOption[];
  courseConfigLoading: boolean;
  courseConfigError: string | null;
  selectedConfigId: number | null;
  courseSearch: string;
  onCourseSearch: (value: string) => void;
  onCourseConfigChange: (id: number | null) => void;
  isCourseConfigDisabled: boolean;
  // Bulk operations
  onDownload: () => void;
  onOpenUpload: () => void;
  isDownloading: boolean;
  isBulkDisabled: boolean;
};

export function FilterBar({
  programOptions,
  programLoading,
  programError,
  selectedProgramId,
  programSearch,
  onProgramSearch,
  onProgramChange,
  selectedLevelId,
  onLevelChange,
  courseConfigGroupedOptions,
  courseConfigLoading,
  courseConfigError,
  selectedConfigId,
  courseSearch,
  onCourseSearch,
  onCourseConfigChange,
  isCourseConfigDisabled,
  onDownload,
  onOpenUpload,
  isDownloading,
  isBulkDisabled,
}: FilterBarProps) {
  const token = useToken();

  const bulkMenuItems: MenuProps["items"] = [
    {
      key: "download",
      label: "Download Score Sheet",
      icon: <DownloadOutlined />,
      onClick: onDownload,
    },
    {
      key: "upload",
      label: "Upload Score Sheet",
      icon: <UploadOutlined />,
      onClick: onOpenUpload,
    },
  ];

  const safeGroupedOptions: CourseConfigurationGroupOption[] = Array.isArray(
    courseConfigGroupedOptions,
  )
    ? courseConfigGroupedOptions
    : ((courseConfigGroupedOptions as any)?.member ?? []);

  return (
    <>
      <Flex gap={token.marginSM} justify="space-between" wrap="wrap">
        <Flex gap={token.marginSM} wrap="wrap">
          {/* Program Selector */}
          <Select
            showSearch
            placeholder="Search program…"
            filterOption={false}
            loading={programLoading}
            value={selectedProgramId ?? undefined}
            searchValue={programSearch}
            onSearch={onProgramSearch}
            onChange={(val: number | undefined) => onProgramChange(val ?? null)}
            allowClear
            onClear={() => onProgramChange(null)}
            style={{
              minWidth: 240,
              flex: 1,
              borderColor: programError ? token.colorError : undefined,
            }}
            status={programError ? "error" : undefined}
            options={programOptions.map((p) => ({
              value: p.id,
              label: `${p.name}`,
            }))}
          />

          {/* Level Selector */}
          <LevelSelect
            placeholder="Select level"
            value={selectedLevelId ?? undefined}
            onChange={(val: number | undefined) => onLevelChange(val ?? null)}
            allowClear
            onClear={() => onLevelChange(null)}
            style={{
              minWidth: 180,
              flex: 1,
            }}
          />

          {/* Course Config Selector (Grouped Options by Curriculum Version) */}
          <Select
            showSearch
            placeholder={
              isCourseConfigDisabled
                ? "Select program & level first"
                : "Search course by code or title…"
            }
            filterOption={false}
            loading={courseConfigLoading}
            value={selectedConfigId ?? undefined}
            searchValue={courseSearch}
            onSearch={onCourseSearch}
            onChange={(val: number | undefined) =>
              onCourseConfigChange(val ?? null)
            }
            allowClear
            onClear={() => {
              onCourseSearch("");
              onCourseConfigChange(null);
            }}
            disabled={isCourseConfigDisabled}
            notFoundContent={
              courseConfigLoading ? <Spin size="small" /> : "No courses found"
            }
            style={{
              minWidth: 280,
              flex: 2,
              borderColor: courseConfigError ? token.colorError : undefined,
            }}
            status={courseConfigError ? "error" : undefined}
            options={safeGroupedOptions.map((group) => ({
              label: `${group.label ?? ""}${group.isActiveForAdmission ? " (Active)" : ""}`,
              options: (group.options ?? []).map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
            }))}
          />
        </Flex>

        {/* Right-side actions */}
        <Flex gap={token.marginSM} align="center">
          <PermissionGuard permission={Permission.StudentScoreSheetsCreate}>
            <Dropdown menu={{ items: bulkMenuItems }} trigger={["click"]}>
              <Button
                icon={<CloudUploadOutlined />}
                loading={isDownloading}
                disabled={isBulkDisabled}
                type="primary"
              >
                Bulk Upload
              </Button>
            </Dropdown>
          </PermissionGuard>
        </Flex>
      </Flex>

      {/* Error alerts */}
      <ConditionalErrorAlerts
        programError={programError}
        courseConfigError={courseConfigError}
        token={token}
      />
    </>
  );
}

// ─── Internal helper ──────────────────────────────────────────────────────────

type ConditionalErrorAlertsProps = {
  programError: string | null;
  courseConfigError: string | null;
  token: ReturnType<typeof useToken>;
};

function ConditionalErrorAlerts({
  programError,
  courseConfigError,
  token,
}: ConditionalErrorAlertsProps) {
  const hasError = programError || courseConfigError;
  if (!hasError) return null;

  return (
    <div style={{ marginTop: token.marginSM }}>
      {programError && <ErrorAlert error={programError} />}
      {courseConfigError && <ErrorAlert error={courseConfigError} />}
    </div>
  );
}
