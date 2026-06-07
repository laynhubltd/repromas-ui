import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SetupChecklistCard } from "./SetupChecklistCard";

const mockHandleContinueSetup = vi.fn();

vi.mock("../hooks/useSetupChecklist", () => ({
  useSetupChecklist: () => ({
    state: {
      title: "Set up your institution",
      subtitle: "Complete these steps to unlock the rest of the platform.",
      checklistSteps: [
        {
          id: "department",
          stepNumber: 1,
          title: "Faculty & Departments",
          description: "Create at least one department under a faculty.",
          done: false,
          active: true,
        },
      ],
      progressPercent: 0,
      currentStepId: "department",
      currentStepLabel: "Faculty & Departments",
      currentStepRoute: "/academic-structure",
      ctaLabel: "Continue setup",
      remainingStepCount: 5,
      isLoading: false,
    },
    actions: {
      handleContinueSetup: mockHandleContinueSetup,
      handleGoToStep: vi.fn(),
    },
    flags: {
      showSetupChecklist: true,
      showKpis: false,
      isPhase1Complete: false,
    },
  }),
}));

describe("SetupChecklistCard", () => {
  it("renders checklist title and active step", () => {
    render(<SetupChecklistCard />);
    expect(screen.getByText("Set up your institution")).toBeInTheDocument();
    expect(screen.getByText("Faculty & Departments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue setup" })).toBeInTheDocument();
  });

  it("calls continue handler when CTA is clicked", async () => {
    const user = userEvent.setup();
    render(<SetupChecklistCard />);
    await user.click(screen.getByRole("button", { name: "Continue setup" }));
    expect(mockHandleContinueSetup).toHaveBeenCalled();
  });
});
