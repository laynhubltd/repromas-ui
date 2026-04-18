import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { WarningOutlined } from "@ant-design/icons";
import { Alert, Checkbox, Flex, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useCoursePoolDisplay } from "../hooks/useCoursePoolDisplay";
import type { CoursePool } from "../types/course-registration";

export type CoursePoolDisplayProps = {
  coursePool: CoursePool | null;
  selectedCourseIds: number[];
  onCourseSelectionChange: (courseIds: number[]) => void;
  isLateWindow: boolean;
  /** configIds of mandatory courses that are missing from the selection. */
  missingMandatoryCourseIds?: number[];
  /**
   * When true, all checkboxes are disabled regardless of mandatory status.
   * Used to prevent selection changes while a submission is in progress.
   */
  disabled?: boolean;
  /**
   * When true, renders courses as stacked cards instead of table rows.
   * Use for xs (< 576px) screens.
   * Requirements: 1.5, 1.6
   */
  useMobileLayout?: boolean;
};

/**
 * Displays categorized course buckets with selection controls.
 *
 * View-only component — all business logic lives in useCoursePoolDisplay.
 *
 * Responsibilities:
 * - Render each course bucket (registered, carryovers, arrears, currentCore, electives)
 * - Registered courses are read-only (no checkbox)
 * - Selectable buckets show checkboxes; mandatory courses are checked and disabled
 * - Mandatory courses are visually highlighted with a "Mandatory" tag
 * - Show a late registration warning banner when isLateWindow is true
 * - Show course details per row: code, title, credit units, mandatory status
 *
 * Requirements: 4.2, 5.1, 5.2, 5.3, 11.1, 11.2, 11.4
 */
export function CoursePoolDisplay({
  coursePool,
  selectedCourseIds,
  onCourseSelectionChange,
  isLateWindow,
  missingMandatoryCourseIds = [],
  disabled = false,
  useMobileLayout = false,
}: CoursePoolDisplayProps) {
  const token = useToken();

  const { buckets, actions, helpers } = useCoursePoolDisplay(
    coursePool,
    selectedCourseIds,
    onCourseSelectionChange,
    isLateWindow,
  );

  /** Set for O(1) lookup of missing mandatory course IDs. */
  const missingSet = useMemo(
    () => new Set(missingMandatoryCourseIds),
    [missingMandatoryCourseIds],
  );

  if (!coursePool) return null;

  return (
    <div data-testid="course-pool-display">
      {/* ─── Late Registration Warning (Requirement 11.1, 11.2, 11.4) ──── */}
      <ConditionalRenderer when={isLateWindow}>
        <Alert
          type="warning"
          showIcon
          message="Late Registration Period"
          description="You are registering during the late registration period."
          data-testid="late-registration-warning"
          style={{ marginBottom: 16 }}
        />
      </ConditionalRenderer>

      {/* ─── Course Buckets ──────────────────────────────────────────────── */}
      {buckets.map((bucket) => (
        <div
          key={bucket.key}
          data-testid={bucket.testId}
          style={{ marginBottom: 20 }}
        >
          {/* Bucket header */}
          <Typography.Text
            strong
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: token.fontSizeSM,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: token.colorTextSecondary,
            }}
          >
            {bucket.label}
          </Typography.Text>

          {/* Course rows */}
          <div
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              overflow: "hidden",
              overflowX: useMobileLayout ? "visible" : "auto",
            }}
          >
            {bucket.courses.map((course, index) => {
              const isSelected = helpers.isCourseSelected(course.configId);
              const isLocked = helpers.isCourseLocked(course.configId);
              const isLastRow = index === bucket.courses.length - 1;
              const isMissing = missingSet.has(course.configId);

              if (useMobileLayout) {
                // ── Mobile card layout ──
                return (
                  <div
                    key={course.configId}
                    data-testid={
                      isMissing
                        ? `course-row-missing-${course.configId}`
                        : `course-row-${course.configId}`
                    }
                    onClick={
                      !bucket.isReadOnly && !isLocked && !disabled
                        ? () =>
                            actions.handleCourseToggle(
                              course.configId,
                              !isSelected,
                            )
                        : undefined
                    }
                    style={{
                      padding: "12px 14px",
                      background: isMissing
                        ? `${token.colorError}14`
                        : isSelected
                          ? `${token.colorPrimary}0d`
                          : token.colorBgContainer,
                      borderBottom: isLastRow
                        ? "none"
                        : `1px solid ${token.colorBorderSecondary}`,
                      border: isMissing
                        ? `1px solid ${token.colorError}`
                        : undefined,
                      cursor:
                        !bucket.isReadOnly && !isLocked && !disabled
                          ? "pointer"
                          : "default",
                      // Minimum touch target height for accessibility
                      minHeight: 64,
                    }}
                  >
                    {/* Row 1: code + mandatory tag + missing icon */}
                    <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
                      <Typography.Text
                        style={{
                          fontFamily: "monospace",
                          fontSize: token.fontSizeSM,
                          color: token.colorTextSecondary,
                        }}
                        data-testid={`course-code-${course.configId}`}
                      >
                        {course.courseCode}
                      </Typography.Text>
                      {course.isMandatory && (
                        <Tag
                          color="orange"
                          style={{ fontSize: token.fontSizeSM - 1, margin: 0 }}
                          data-testid={`course-mandatory-tag-${course.configId}`}
                        >
                          Mandatory
                        </Tag>
                      )}
                      {isMissing && (
                        <WarningOutlined
                          style={{ color: token.colorError }}
                          data-testid={`course-missing-icon-${course.configId}`}
                        />
                      )}
                    </Flex>
                    {/* Row 2: title */}
                    <Typography.Text
                      style={{
                        display: "block",
                        fontSize: token.fontSize,
                        fontWeight: course.isMandatory ? 600 : 400,
                        marginBottom: 6,
                      }}
                      data-testid={`course-title-${course.configId}`}
                    >
                      {course.courseTitle}
                    </Typography.Text>
                    {/* Row 3: credits + checkbox */}
                    <Flex justify="space-between" align="center">
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                        data-testid={`course-credits-${course.configId}`}
                      >
                        {course.creditUnits} cr
                      </Typography.Text>
                      {!bucket.isReadOnly && (
                        <Checkbox
                          checked={isSelected}
                          disabled={isLocked || disabled}
                          onChange={(e) =>
                            actions.handleCourseToggle(
                              course.configId,
                              e.target.checked,
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`course-checkbox-${course.configId}`}
                        />
                      )}
                    </Flex>
                  </div>
                );
              }

              // ── Desktop row layout ──
              return (
                <div
                  key={course.configId}
                  data-testid={
                    isMissing
                      ? `course-row-missing-${course.configId}`
                      : `course-row-${course.configId}`
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: isMissing
                      ? `${token.colorError}14`
                      : isSelected
                        ? `${token.colorPrimary}0d`
                        : token.colorBgContainer,
                    borderBottom: isLastRow
                      ? "none"
                      : `1px solid ${token.colorBorderSecondary}`,
                    border: isMissing
                      ? `1px solid ${token.colorError}`
                      : undefined,
                    transition: "background 0.15s ease",
                    minWidth: 480,
                  }}
                >
                  {/* Checkbox (selectable buckets only) */}
                  <ConditionalRenderer when={!bucket.isReadOnly}>
                    <Checkbox
                      checked={isSelected}
                      disabled={isLocked || disabled}
                      onChange={(e) =>
                        actions.handleCourseToggle(
                          course.configId,
                          e.target.checked,
                        )
                      }
                      data-testid={`course-checkbox-${course.configId}`}
                    />
                  </ConditionalRenderer>

                  {/* Course code */}
                  <Typography.Text
                    style={{
                      fontFamily: "monospace",
                      fontSize: token.fontSizeSM,
                      color: token.colorTextSecondary,
                      minWidth: 90,
                      whiteSpace: "nowrap",
                    }}
                    data-testid={`course-code-${course.configId}`}
                  >
                    {course.courseCode}
                  </Typography.Text>

                  {/* Course title */}
                  <Typography.Text
                    style={{
                      flex: 1,
                      fontSize: token.fontSize,
                      fontWeight: course.isMandatory ? 600 : 400,
                    }}
                    data-testid={`course-title-${course.configId}`}
                  >
                    {course.courseTitle}
                  </Typography.Text>

                  {/* Mandatory tag (Requirement 5.3 — visual highlight) */}
                  <ConditionalRenderer when={course.isMandatory}>
                    <Tag
                      color="orange"
                      style={{ fontSize: token.fontSizeSM - 1, margin: 0 }}
                      data-testid={`course-mandatory-tag-${course.configId}`}
                    >
                      Mandatory
                    </Tag>
                  </ConditionalRenderer>

                  {/* Missing mandatory warning icon (Requirement 7.4) */}
                  <ConditionalRenderer when={isMissing}>
                    <WarningOutlined
                      style={{ color: token.colorError, flexShrink: 0 }}
                      data-testid={`course-missing-icon-${course.configId}`}
                    />
                  </ConditionalRenderer>

                  {/* Credit units */}
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: token.fontSizeSM,
                      whiteSpace: "nowrap",
                      minWidth: 60,
                      textAlign: "right",
                    }}
                    data-testid={`course-credits-${course.configId}`}
                  >
                    {course.creditUnits} cr
                  </Typography.Text>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ─── Empty state ─────────────────────────────────────────────────── */}
      <ConditionalRenderer when={buckets.length === 0}>
        <div
          data-testid="course-pool-empty"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgLayout,
          }}
        >
          <Typography.Text type="secondary">
            No courses available in the course pool.
          </Typography.Text>
        </div>
      </ConditionalRenderer>
    </div>
  );
}
