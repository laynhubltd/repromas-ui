import { SettingOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Flex, Popover, Typography } from "antd";
import { useMemo } from "react";
import type { BroadsheetCourseColumn } from "../types/result-broadsheet";

export interface CourseVisibilityPickerProps {
  courses: BroadsheetCourseColumn[];
  visibleCourseCodes?: string[];
  onChange: (codes: string[] | undefined) => void;
  disabled?: boolean;
}

export function CourseVisibilityPicker({
  courses,
  visibleCourseCodes,
  onChange,
  disabled = false,
}: CourseVisibilityPickerProps) {
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
      onChange(undefined);
    } else {
      onChange(next);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onChange(undefined);
    } else {
      onChange([]);
    }
  };

  const content = (
    <div style={{ width: 280, maxHeight: 320, overflowY: "auto" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Text strong>Visible Courses</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {activeCodes.length} / {allCodes.length}
        </Typography.Text>
      </Flex>
      <Checkbox
        checked={isAllSelected}
        indeterminate={activeCodes.length > 0 && activeCodes.length < allCodes.length}
        onChange={(e) => handleToggleAll(e.target.checked)}
      >
        Select All
      </Checkbox>
      <Divider style={{ margin: "8px 0" }} />
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
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button icon={<SettingOutlined />} disabled={disabled || courses.length === 0}>
        Courses ({activeCodes.length}/{allCodes.length})
      </Button>
    </Popover>
  );
}
