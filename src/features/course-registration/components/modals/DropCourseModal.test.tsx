import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropCourseModal } from "./DropCourseModal";
import type { CourseItem } from "../../types/course-registration";

const mockHandleConfirm = vi.fn();
const mockHandleCancel = vi.fn();

vi.mock("../../hooks/useDropCourseModal", () => ({
  useDropCourseModal: vi.fn(),
}));

import { useDropCourseModal } from "../../hooks/useDropCourseModal";
const mockedHook = vi.mocked(useDropCourseModal);

describe("DropCourseModal", () => {
  const mockTarget: CourseItem = {
    registrationId: 1554380,
    configId: 117182,
    courseId: 14797,
    courseCode: "COM111",
    courseTitle: "INTRODUCTION TO COMPUTERS",
    creditUnits: 3,
    isMandatory: false,
  };

  it("renders course details and confirmation message", () => {
    mockedHook.mockReturnValue({
      state: {
        isLoading: false,
        isMissingId: false,
      },
      actions: {
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
      },
    });

    render(
      <DropCourseModal
        open={true}
        target={mockTarget}
        studentId={62179}
        semesterTypeId={1}
        studentName="John Doe"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Drop Course Registration")).toBeInTheDocument();
    expect(screen.getByText("COM111 — INTRODUCTION TO COMPUTERS")).toBeInTheDocument();
    expect(screen.getByText(/3 Units/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("calls handleConfirm when Drop Course button is clicked", () => {
    mockedHook.mockReturnValue({
      state: {
        isLoading: false,
        isMissingId: false,
      },
      actions: {
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
      },
    });

    render(
      <DropCourseModal
        open={true}
        target={mockTarget}
        studentId={62179}
        semesterTypeId={1}
        onClose={vi.fn()}
      />,
    );

    const dropButton = screen.getByTestId("confirm-drop-course-button");
    fireEvent.click(dropButton);
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables drop button when isMissingId is true", () => {
    mockedHook.mockReturnValue({
      state: {
        isLoading: false,
        isMissingId: true,
      },
      actions: {
        handleConfirm: mockHandleConfirm,
        handleCancel: mockHandleCancel,
      },
    });

    render(
      <DropCourseModal
        open={true}
        target={{ ...mockTarget, registrationId: undefined }}
        studentId={62179}
        semesterTypeId={1}
        onClose={vi.fn()}
      />,
    );

    const dropButton = screen.getByTestId("confirm-drop-course-button");
    expect(dropButton).toBeDisabled();
  });
});
