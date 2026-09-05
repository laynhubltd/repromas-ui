import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AcademicStandingBoundaryFormModal } from "./AcademicStandingBoundaryFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseModal = vi.fn();

vi.mock("../hooks/useAcademicStandingBoundaryModal", () => ({
  useAcademicStandingBoundaryModal: (...args: unknown[]) => mockUseModal(...args),
}));

function BoundaryModalTestWrapper() {
  const [form] = Form.useForm();
  mockUseModal.mockReturnValue({
    state: {
      isLoading: false,
      isEditMode: false,
      formState: { hasEscalationLadder: false },
      transitionStatuses: [
        {
          id: 1,
          name: "Good Standing",
          semanticKind: "GOOD_STANDING",
          managedBy: "BOTH",
          isTerminal: false,
        },
        {
          id: 2,
          name: "Academic Probation",
          semanticKind: "PROBATION",
          managedBy: "ENGINE",
          isTerminal: false,
        },
      ],
      isStatusesLoading: false,
    },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
      handleHasEscalationLadderChange: vi.fn(),
    },
    form,
  });

  return (
    <AcademicStandingBoundaryFormModal
      policyId={1}
      policyMaxCgpa={5.0}
      open={true}
      target={null}
      onClose={vi.fn()}
    />
  );
}

describe("AcademicStandingBoundaryFormModal", () => {
  it("renders boundary form modal with target status picker", () => {
    render(<BoundaryModalTestWrapper />);

    expect(
      screen.getByRole("button", { name: "Add Tier Boundary" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Target Status/i)).toBeInTheDocument();
  });
});
