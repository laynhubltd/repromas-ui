import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CourseConfigFormModal } from "./CourseConfigFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
});

const mockUseCourseConfigFormModal = vi.fn();

vi.mock("../../hooks/useCourseConfigModal", () => ({
  useCourseConfigFormModal: (...args: unknown[]) => mockUseCourseConfigFormModal(...args),
}));

vi.mock("@/components/ui-kit/data-entry/LevelSelect", () => ({
  LevelSelect: ({ value }: { value?: number }) => <div data-testid="level-select">{value}</div>,
}));

function TestContainer({ isEditMode = false, isScoreLocked = false }: { isEditMode?: boolean; isScoreLocked?: boolean }) {
  const [form] = Form.useForm();
  mockUseCourseConfigFormModal.mockReturnValue({
    state: {
      isLoading: false,
      isEditMode,
      isScoreLocked,
      courseSearch: "",
      selectedCourse: { id: 10, code: "MTH211", title: "Calculus II" },
      isCoursesLoading: false,
    },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
      handleCourseChange: vi.fn(),
      handleCourseSearch: vi.fn(),
    },
    form,
    courses: [{ id: 10, code: "MTH211", title: "Calculus II" }],
    courseOptions: [{ value: 10, label: "MTH211 Calculus II" }],
    levels: [
      { id: 1, name: "ND I", rankOrder: 1 },
      { id: 2, name: "ND II", rankOrder: 2 },
    ],
    semesterTypes: [
      { id: 1, name: "First Semester", sortOrder: 1 },
      { id: 2, name: "Second Semester", sortOrder: 2 },
    ],
    isSemesterTypesLoading: false,
    prerequisiteOptions: [{ value: 5, label: "MTH111 General Mathematics" }],
  });

  return (
    <CourseConfigFormModal
      open={true}
      target={isEditMode ? ({ id: 1, hasAnyScore: isScoreLocked } as any) : null}
      onClose={vi.fn()}
      programId={1}
      versionId={1}
      prefillLevelId={2}
    />
  );
}

describe("CourseConfigFormModal", () => {
  it("renders form fields correctly with ordinal semester options and title override", () => {
    render(<TestContainer />);

    expect(screen.getAllByText("Add Course").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Course")).toBeInTheDocument();
    expect(screen.getByText("Course Title Override (Optional)")).toBeInTheDocument();
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("Semester Type")).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText("Defaults to: Calculus II");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute("maxlength", "255");
    expect(titleInput).not.toBeDisabled();
  });

  it("renders warning alert and disables academic fields when score-locked in edit mode", () => {
    render(<TestContainer isEditMode={true} isScoreLocked={true} />);

    expect(screen.getByText("Score Records Exist")).toBeInTheDocument();
    expect(
      screen.getByText(/Academic parameters \(Level, Semester, Status, Credit Units, Prerequisites\) are locked/i),
    ).toBeInTheDocument();

    // Title override remains enabled
    const titleInput = screen.getByPlaceholderText("Defaults to: Calculus II");
    expect(titleInput).not.toBeDisabled();

    // Credit units input is disabled
    const creditUnitInput = screen.getByRole("spinbutton");
    expect(creditUnitInput).toBeDisabled();

    // Select dropdowns have disabled class / attribute
    const disabledComboboxes = screen.getAllByRole("combobox");
    disabledComboboxes.forEach((combobox) => {
      expect(combobox).toBeDisabled();
    });
  });
});
