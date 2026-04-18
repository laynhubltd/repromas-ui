import { Col, Collapse, Row, Typography } from "antd";
import { useState } from "react";
import { useCourseRegistrationPage } from "../hooks/useCourseRegistrationPage";
import { RegistrationInterface } from "./RegistrationInterface";
import { StudentSelectionPanel } from "./StudentSelectionPanel";

/**
 * Main page component for the Course Registration feature.
 *
 * Determines the layout based on user scope:
 * - Admin/Staff: Two-column layout (student selection + registration interface)
 * - Student: Single-column layout (registration interface only)
 *
 * Responsive behaviour:
 * - Desktop (≥ 768px): side-by-side columns for admin/staff
 * - Mobile/Tablet (< 768px): columns stack vertically for admin/staff
 *
 * This is a view-only component — all logic lives in useCourseRegistrationPage.
 */
export function CourseRegistrationPage() {
  const { state, actions, flags, layout } = useCourseRegistrationPage();
  const [studentPanelOpen, setStudentPanelOpen] = useState(true);

  if (!flags.isLayoutReady) {
    return null;
  }

  // Show unauthorized message if user lacks the required permission
  if (!state.hasPermission) {
    return (
      <div
        data-testid="course-registration-unauthorized"
        style={{ padding: 24, textAlign: "center" }}
      >
        <Typography.Title level={3}>Unauthorized</Typography.Title>
        <Typography.Text type="secondary">
          You do not have permission to access Course Registration.
        </Typography.Text>
      </div>
    );
  }

  // Show error if the authenticated student has an incomplete or invalid profile
  if (state.isStudent && !flags.hasValidStudentProfile) {
    return (
      <div
        data-testid="course-registration-profile-error"
        style={{ padding: 24, textAlign: "center" }}
      >
        <Typography.Title level={3}>Profile Error</Typography.Title>
        <Typography.Text type="secondary">
          {state.studentProfileError}
        </Typography.Text>
      </div>
    );
  }

  // ─── Student Layout (single-column) ───────────────────────────────────────
  // Students see only the registration interface — no student selection panel.

  if (state.isStudent) {
    return (
      <div
        data-testid="course-registration-page"
        data-layout="single-column"
        style={{ width: "100%" }}
      >
        <RegistrationInterface
          studentId={state.studentId}
          semesterTypeId={state.semesterTypeId}
          onSemesterTypeChange={actions.handleSemesterTypeChange}
          studentInfo={state.studentHeaderInfo}
          useMobileLayout={layout.useCourseCards}
        />
      </div>
    );
  }

  // ─── Admin/Staff Layout (two-column, responsive) ──────────────────────────
  // Left panel: student selection. Right panel: registration interface.
  // On mobile the columns stack vertically (shouldStack = true).

  return (
    <div
      data-testid="course-registration-page"
      data-layout="two-column"
      style={{ width: "100%" }}
    >
      <Row
        gutter={[16, 16]}
        align="stretch"
        data-testid="course-registration-layout-row"
      >
        {/* Left panel — student selection */}
        <Col
          xs={24}
          md={layout.shouldStack ? 24 : 8}
          data-testid="student-panel-col"
        >
          {layout.studentPanelCollapsible ? (
            <Collapse
              activeKey={studentPanelOpen ? ["student-panel"] : []}
              onChange={(keys) =>
                setStudentPanelOpen(
                  Array.isArray(keys)
                    ? keys.includes("student-panel")
                    : keys === "student-panel",
                )
              }
              data-testid="student-panel-collapse"
              items={[
                {
                  key: "student-panel",
                  label: state.selectedStudentId
                    ? "Student Selected — tap to change"
                    : "Select a Student",
                  children: (
                    <StudentSelectionPanel
                      selectedStudentId={state.selectedStudentId}
                      onStudentSelect={(id) => {
                        actions.handleStudentSelect(id);
                        setStudentPanelOpen(false);
                      }}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <StudentSelectionPanel
              selectedStudentId={state.selectedStudentId}
              onStudentSelect={actions.handleStudentSelect}
            />
          )}
        </Col>

        {/* Right panel — registration interface */}
        <Col
          xs={24}
          md={layout.shouldStack ? 24 : 16}
          data-testid="registration-interface-col"
        >
          <RegistrationInterface
            studentId={state.selectedStudentId}
            semesterTypeId={state.semesterTypeId}
            onSemesterTypeChange={actions.handleSemesterTypeChange}
            useMobileLayout={layout.useCourseCards}
          />
        </Col>
      </Row>
    </div>
  );
}
