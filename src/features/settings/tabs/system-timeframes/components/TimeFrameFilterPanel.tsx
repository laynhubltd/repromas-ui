// Feature: settings-timeframe
import { FilterOutlined } from "@ant-design/icons";
import { Badge, Button, Flex, Popover, Select, Typography } from "antd";
import { useState } from "react";
import type { AcademicSession, Semester, SemesterType } from "../../academic-calendar/types/academic-calendar";
import type { EventType, Scope, TimeFrameFilters } from "../types/system-timeframe";

type TimeFrameFilterPanelProps = {
  filters: TimeFrameFilters;
  sessions: AcademicSession[];
  semesters: Semester[];
  semesterTypes: SemesterType[];
  onApply: (filters: TimeFrameFilters) => void;
  onClear: () => void;
};

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "APPLICATION", label: "Application" },
  { value: "ACCEPTANCE_FEE", label: "Acceptance Fee" },
  { value: "COURSE_REGISTRATION", label: "Course Registration" },
  { value: "ADD_DROP", label: "Add / Drop" },
  { value: "RESULT_UPLOAD", label: "Result Upload" },
];

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
  { value: "LEVEL", label: "Level" },
  { value: "STUDENT", label: "Student" },
];

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

function countActiveFilters(filters: TimeFrameFilters): number {
  return Object.values(filters).filter((v) => v !== undefined).length;
}

export function TimeFrameFilterPanel({
  filters,
  sessions,
  semesters,
  semesterTypes,
  onApply,
  onClear,
}: TimeFrameFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TimeFrameFilters>(filters);

  const activeCount = countActiveFilters(filters);

  const handleOpen = (visible: boolean) => {
    if (visible) {
      setDraft(filters);
    }
    setOpen(visible);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft({});
    onClear();
    setOpen(false);
  };

  const semesterLabel = (sem: Semester) => {
    const typeName = semesterTypes.find((st) => st.id === sem.semesterTypeId)?.name ?? `Type #${sem.semesterTypeId}`;
    return typeName;
  };

  const content = (
    <Flex vertical gap={12} style={{ width: 280 }}>
      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Event Type
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={draft.eventType}
          onChange={(val) => setDraft((d) => ({ ...d, eventType: val }))}
          options={EVENT_TYPE_OPTIONS}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Scope
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={draft.scope}
          onChange={(val) => setDraft((d) => ({ ...d, scope: val }))}
          options={SCOPE_OPTIONS}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Session
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={draft.sessionId}
          onChange={(val) => {
            setDraft((d) => ({ ...d, sessionId: val, semesterId: undefined }));
          }}
          options={sessions.map((s) => ({ value: s.id, label: s.name }))}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Semester
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          disabled={draft.sessionId === undefined}
          value={draft.semesterId}
          onChange={(val) => setDraft((d) => ({ ...d, semesterId: val }))}
          options={semesters.map((sem) => ({ value: sem.id, label: semesterLabel(sem) }))}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Active
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={draft.isActive === undefined ? undefined : String(draft.isActive)}
          onChange={(val) =>
            setDraft((d) => ({ ...d, isActive: val === undefined ? undefined : val === "true" }))
          }
          options={BOOLEAN_OPTIONS}
        />
      </div>

      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          Late Window
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={draft.isLateWindow === undefined ? undefined : String(draft.isLateWindow)}
          onChange={(val) =>
            setDraft((d) => ({ ...d, isLateWindow: val === undefined ? undefined : val === "true" }))
          }
          options={BOOLEAN_OPTIONS}
        />
      </div>

      <Flex gap={8} justify="flex-end">
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
        <Button size="small" type="primary" onClick={handleApply}>
          Apply
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Popover
      content={content}
      title="Filter Time Frames"
      trigger="click"
      open={open}
      onOpenChange={handleOpen}
      placement="bottomRight"
    >
      <Badge count={activeCount} size="small">
        <Button icon={<FilterOutlined />}>Filters</Button>
      </Badge>
    </Popover>
  );
}
