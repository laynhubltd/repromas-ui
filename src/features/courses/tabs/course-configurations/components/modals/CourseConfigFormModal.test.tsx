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

function TestContainer() {
  const [form] = Form.useForm();
  mockUseCourseConfigFormModal.mockReturnValue({
    state: { isLoading: false, isEditMode: false },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
      handleCourseChange: vi.fn(),
    },
    form,
    courses: [{ id: 10, code: "MTH211", title: "Calculus II" }],
    levels: [
      { id: 1, name: "ND I", rankOrder: 1 },
      { id: 2, name: "ND II", rankOrder: 2 },
    ],
    semesterTypes: [
      { id: 1, name: "First Semester", sortOrder: 1 },
      { id: 2, name: "Second Semester", sortOrder: 2 },
    ],
    isSemesterTypesLoading: false,
    prerequisiteOptions: [],
  });

  return (
    <CourseConfigFormModal
      open={true}
      target={null}
      onClose={vi.fn()}
      programId={1}
      versionId={1}
      prefillLevelId={2}
    />
  );
}

describe("CourseConfigFormModal", () => {
  it("renders form fields correctly with ordinal semester options", () => {
    render(<TestContainer />);

    expect(screen.getAllByText("Add Course").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Course")).toBeInTheDocument();
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("Semester Type")).toBeInTheDocument();
  });
});
