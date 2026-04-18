import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { BookOutlined, ReloadOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Flex, Tag, Typography } from "antd";
import type { StudentHeaderInfo } from "../hooks/useCourseRegistrationPage";
import { useRegistrationInterface } from "../hooks/useRegistrationInterface";
import { CoursePoolDisplay } from "./CoursePoolDisplay";
import { CreditLimitsDisplay } from "./CreditLimitsDisplay";
import { SemesterTypeSelector } from "./SemesterTypeSelector";

export type RegistrationInterfaceProps = {
  studentId: number | null;
  semesterTypeId: number | null;
  onSemesterTypeChange: (semesterTypeId: number) => void;
  /**
   * Student name and program info for display in the interface header.
   * Provided for student users (from auth + student record fetch).
   * When provided, the header shows the student's name and program.
   * Requirements: 13.5, 14.6
   */
  studentInfo?: StudentHeaderInfo | null;
  /**
   * When true, course pool renders as mobile card layout.
   * Requirements: 1.5, 1.6
   */
  useMobileLayout?: boolean;
};

/**
 * Main registration interface for course selection and submission.
 *
 * Handles:
 * - Placeholder state when no student is selected (Requirement 3.1)
 * - Loading state while course data is fetched (Requirement 3.3)
 * - Eligibility error display with recovery guidance (Requirement 3.4, 7.2, 7.3)
 * - Course registration form when data loads successfully (Requirement 3.5)
 * - Semester type selection (Requirement 8.5)
 * - Comprehensive error display with recovery guidance (Requirements 7.1–7.5)
 * - Conflict error display for concurrent submissions (Requirement 7.1)
 * - Stale data notification after automatic refetch (Requirement 7.1)
 * - Student name and program info in header for student users (Requirements 13.5, 14.6)
 *
 * This is a view-only component — all business logic lives in
 * useRegistrationInterface.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.5, 13.5, 14.6
 */
export function RegistrationInterface({
  studentId,
  semesterTypeId,
  onSemesterTypeChange,
  studentInfo,
  useMobileLayout = false,
}: RegistrationInterfaceProps) {
  const token = useToken();

  const { state, actions, flags } = useRegistrationInterface(
    studentId,
    semesterTypeId,
  );

  console.log({ student: state.studentContext });

  // Combine client-side and server-side missing mandatory course IDs for
  // highlighting in the course pool display (Requirement 7.4)
  const allMissingMandatoryIds = [
    ...new Set([
      ...state.validationErrors.missingMandatoryCourseIds,
      ...state.validationErrors.serverMissingConfigIds,
    ]),
  ];

  return (
    <Card
      data-testid="registration-interface"
      style={{ height: "100%" }}
      styles={{ body: { padding: 16 } }}
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <Flex
        justify="space-between"
        align="center"
        gap={12}
        style={{ marginBottom: 16 }}
        wrap="wrap"
      >
        <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG }}
            data-testid="registration-interface-title"
          >
            Course Registration
          </Typography.Text>

          {/* Student name and program info — shown for student users (Requirements 13.5, 14.6) */}
          {studentInfo && (
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
              data-testid="student-header-info"
            >
              <Flex align="center" gap={4}>
                <UserOutlined
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorTextSecondary,
                  }}
                />
                <Typography.Text
                  style={{ fontSize: token.fontSizeSM }}
                  data-testid="student-header-name"
                >
                  {studentInfo.fullName}
                </Typography.Text>
              </Flex>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
                data-testid="student-header-matric"
              >
                {studentInfo.matricNumber}
              </Typography.Text>
              {studentInfo.programName && (
                <Tag
                  color="blue"
                  style={{ fontSize: token.fontSizeSM, margin: 0 }}
                  data-testid="student-header-program"
                >
                  {studentInfo.programName}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>

        {/* Semester type selector — always visible so admin can pick before
            selecting a student (Requirement 8.5) */}
        <div style={{ flexShrink: 0 }}>
          <SemesterTypeSelector
            semesterTypeId={semesterTypeId}
            onSemesterTypeChange={onSemesterTypeChange}
          />
        </div>
      </Flex>

      {/* ─── Placeholder — no student selected (Requirement 3.1) ─────────── */}
      <ConditionalRenderer
        when={studentId === null}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          background: token.colorBgLayout,
        })}
      >
        <BookOutlined
          style={{
            fontSize: 32,
            color: token.colorTextTertiary,
            marginBottom: 12,
          }}
        />
        <Typography.Text
          type="secondary"
          style={{ display: "block" }}
          data-testid="registration-placeholder"
        >
          Select a student to view and manage their course registration.
        </Typography.Text>
      </ConditionalRenderer>

      {/* ─── Content — student selected ──────────────────────────────────── */}
      <ConditionalRenderer when={studentId !== null}>
        {/* No semester type selected yet */}
        <ConditionalRenderer
          when={semesterTypeId === null}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgLayout,
          })}
        >
          <Typography.Text
            type="secondary"
            data-testid="registration-select-semester"
          >
            Please select a semester type above to load course registration
            data.
          </Typography.Text>
        </ConditionalRenderer>

        {/* Semester type selected — load course data */}
        <ConditionalRenderer when={semesterTypeId !== null}>
          {/* Loading state (Requirement 3.3) */}
          <DataLoader loading={state.isLoading}>
            {/* ── Conflict error (409) — concurrent submission (Requirement 7.1) ── */}
            <ConditionalRenderer
              when={flags.isConflictError && !state.isLoading}
            >
              <Alert
                type="warning"
                showIcon
                message="Registration Already Submitted"
                description={
                  <Flex vertical gap={4}>
                    <span data-testid="conflict-error-message">
                      {state.error}
                    </span>
                    {state.errorRecoveryGuidance && (
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                        data-testid="conflict-error-guidance"
                      >
                        {state.errorRecoveryGuidance}
                      </Typography.Text>
                    )}
                  </Flex>
                }
                action={
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={actions.handleRetry}
                    data-testid="conflict-refresh-button"
                  >
                    Refresh
                  </Button>
                }
                data-testid="registration-conflict-error"
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>

            {/* ── Stale data notification — pool was auto-refetched (Requirement 7.1) ── */}
            <ConditionalRenderer
              when={
                flags.isStaleDataError &&
                !flags.isConflictError &&
                !state.isLoading
              }
            >
              <Alert
                type="info"
                showIcon
                message="Course Data Refreshed"
                description="The course pool has been refreshed to show the latest available courses. Please review your selection."
                data-testid="registration-stale-data-notice"
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>

            {/* ── General error state (non-eligibility, non-conflict) ── */}
            <ConditionalRenderer
              when={
                !!state.error &&
                !state.isLoading &&
                !flags.isConflictError &&
                !state.errorState.isEligibilityError
              }
            >
              <ErrorAlert
                variant="section"
                error={state.error}
                onRetry={
                  flags.hasFailedSubmit ? undefined : actions.handleRetry
                }
                action={
                  flags.hasFailedSubmit ? (
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={actions.handleRetrySubmit}
                      data-testid="retry-submit-button"
                    >
                      Retry Submission
                    </Button>
                  ) : undefined
                }
              />
              {/* Recovery guidance below the error alert (Requirements 7.2–7.5) */}
              <ConditionalRenderer when={!!state.errorRecoveryGuidance}>
                <Typography.Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: token.fontSizeSM,
                    marginTop: 6,
                    paddingLeft: 4,
                  }}
                  data-testid="error-recovery-guidance"
                >
                  {state.errorRecoveryGuidance}
                </Typography.Text>
              </ConditionalRenderer>
            </ConditionalRenderer>

            {/* ── Ineligibility message (Requirement 3.4, 7.2, 7.3) ── */}
            <ConditionalRenderer
              when={state.errorState.isEligibilityError && !state.isLoading}
            >
              <Alert
                type="warning"
                showIcon
                message="Student Not Eligible"
                description={
                  <Flex vertical gap={4}>
                    <span data-testid="eligibility-error-message">
                      {state.error ??
                        "This student is not eligible for course registration at this time."}
                    </span>
                    {state.errorRecoveryGuidance && (
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                        data-testid="eligibility-recovery-guidance"
                      >
                        {state.errorRecoveryGuidance}
                      </Typography.Text>
                    )}
                  </Flex>
                }
                data-testid="registration-eligibility-error"
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>

            {/* ── Late registration warning (Requirement 11.1, 11.2) ── */}
            <ConditionalRenderer
              when={
                flags.hasData && (state.studentContext?.isLateWindow ?? false)
              }
            >
              <Alert
                type="warning"
                showIcon
                message="Late Registration Period"
                description="You are registering during the late registration period."
                data-testid="registration-late-window-warning"
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>

            {/* ── Course data loaded (Requirement 3.5) ── */}
            <ConditionalRenderer when={flags.hasData && flags.isEligible}>
              {/* Student context summary */}
              <ConditionalRenderer when={!!state.studentContext}>
                <Flex
                  gap={16}
                  wrap="wrap"
                  style={{
                    marginBottom: 16,
                    padding: "10px 12px",
                    background: token.colorBgLayout,
                    borderRadius: token.borderRadius,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                  data-testid="student-context-summary"
                >
                  <Flex vertical gap={2}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      Level
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: token.fontSize }}>
                      {state.studentContext?.currentLevel ?? "—"}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical gap={2}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      Registered Credits
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: token.fontSize }}>
                      {state.studentContext?.totalUnitsRegistered ?? 0}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical gap={2}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      Selected Credits
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontSize: token.fontSize,
                        color: token.colorPrimary,
                        fontWeight: 600,
                      }}
                      data-testid="selected-credits-display"
                    >
                      {state.selectedCredits}
                    </Typography.Text>
                  </Flex>
                  <ConditionalRenderer when={!!state.creditLimits}>
                    <Flex vertical gap={2}>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                      >
                        Credit Limit
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: token.fontSize }}>
                        {state.creditLimits?.min ?? 0} –{" "}
                        {state.creditLimits?.max === -1
                          ? "No upper limit"
                          : (state.creditLimits?.max ?? "—")}
                      </Typography.Text>
                    </Flex>
                  </ConditionalRenderer>
                </Flex>
              </ConditionalRenderer>

              {/* Credit limits display (Requirements 5.4, 5.5, 5.6, 6.2, 6.3) */}
              <ConditionalRenderer when={!!state.creditLimits}>
                <div style={{ marginBottom: 16 }}>
                  <CreditLimitsDisplay
                    creditLimits={state.creditLimits!}
                    selectedCredits={state.selectedCredits}
                    registeredCredits={
                      state.studentContext?.totalUnitsRegistered ?? 0
                    }
                  />
                </div>
              </ConditionalRenderer>

              {/* FORCE_CARRYOVER_FIRST violation alert (Requirement 7.4) */}
              <ConditionalRenderer
                when={
                  state.submitAttempted &&
                  state.validationErrors.forceCarryoverFirstViolation !== null
                }
              >
                <Alert
                  type="error"
                  showIcon
                  message="Carryover Courses Required"
                  description={
                    state.validationErrors.forceCarryoverFirstViolation
                  }
                  data-testid="force-carryover-first-error"
                  style={{ marginBottom: 16 }}
                />
              </ConditionalRenderer>

              {/* Credit limit violation alert (Requirements 6.2, 6.3) */}
              <ConditionalRenderer
                when={
                  state.submitAttempted &&
                  state.validationErrors.creditLimitViolation !== null
                }
              >
                <Alert
                  type="error"
                  showIcon
                  message="Credit Limit Violation"
                  description={state.validationErrors.creditLimitViolation}
                  data-testid="credit-limit-violation-error"
                  style={{ marginBottom: 16 }}
                />
              </ConditionalRenderer>

              {/* Server-side missing mandatory courses alert (Requirement 7.4) */}
              <ConditionalRenderer
                when={
                  state.validationErrors.serverMissingConfigIds.length > 0 &&
                  state.validationErrors.missingMandatoryCourseIds.length === 0
                }
              >
                <Alert
                  type="error"
                  showIcon
                  message="Mandatory Courses Missing"
                  description="The server rejected your submission because some mandatory courses were not included. The missing courses are highlighted below."
                  data-testid="server-missing-courses-error"
                  style={{ marginBottom: 16 }}
                />
              </ConditionalRenderer>

              {/* Course pool display (Requirements 4.2, 5.1–5.3, 7.4) */}
              <div style={{ marginBottom: 16 }}>
                <CoursePoolDisplay
                  coursePool={state.coursePool}
                  selectedCourseIds={state.selectedCourseIds}
                  onCourseSelectionChange={actions.handleCourseSelectionChange}
                  isLateWindow={state.studentContext?.isLateWindow ?? false}
                  missingMandatoryCourseIds={allMissingMandatoryIds}
                  disabled={state.isSubmitting}
                  useMobileLayout={useMobileLayout}
                />
              </div>

              {/* Submit button */}
              <Flex justify="flex-end">
                <Button
                  type="primary"
                  disabled={!flags.canSubmit}
                  loading={state.isSubmitting}
                  onClick={actions.handleSubmitRegistration}
                  data-testid="submit-registration-button"
                >
                  Submit Registration
                </Button>
              </Flex>
            </ConditionalRenderer>
          </DataLoader>
        </ConditionalRenderer>
      </ConditionalRenderer>
    </Card>
  );
}
