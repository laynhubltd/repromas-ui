import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { StudentFormModal } from "./StudentFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseStudentFormModal = vi.fn();

vi.mock("../../hooks/useStudentModal", () => ({
  useStudentFormModal: (...args: unknown[]) => mockUseStudentFormModal(...args),
}));

vi.mock("@/components/ui-kit/data-entry/LevelSelect", () => ({
  LevelSelect: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="level-select">{placeholder}</div>
  ),
}));

vi.mock("@/components/ui-kit/data-entry/CurriculumSelect", () => ({
  CurriculumSelect: () => <div data-testid="curriculum-select">Curriculum</div>,
}));

function CreateModalContainer() {
  const [form] = Form.useForm();
  mockUseStudentFormModal.mockReturnValue({
    state: { isLoading: false, isEditMode: false },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
    },
    form,
    data: {
      programs: [{ id: 1, name: "Computer Science" }],
      curriculumVersions: [{ id: 1, name: "2024 Curriculum", scope: "GLOBAL", isActiveForAdmission: true }],
      academicSessions: [
        { id: 101, name: "2024/2025", isCurrent: true },
        { id: 100, name: "2023/2024", isCurrent: false },
      ],
      programName: "",
      isProgramsLoading: false,
      isCurriculumVersionsLoading: false,
      isAcademicSessionsLoading: false,
    },
  });

  return <StudentFormModal open={true} target={null} onClose={vi.fn()} />;
}

describe("StudentFormModal", () => {
  it("renders Create Student modal with Entry Session and without Status field", () => {
    render(<CreateModalContainer />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Create Student").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Matric number cannot be changed after creation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Entry Session")).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Entry Mode")).toBeInTheDocument();
    expect(screen.getByText("Program")).toBeInTheDocument();
    expect(screen.getByText("Entry Level")).toBeInTheDocument();
    expect(screen.getByText("Curriculum Version")).toBeInTheDocument();
    expect(screen.getByText("Current Level")).toBeInTheDocument();

    // Verify Status is NOT in the form
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });
});
