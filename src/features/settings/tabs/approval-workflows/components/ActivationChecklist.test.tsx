import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WorkflowActivationViolation } from "../types/workflow-config";
import { ActivationChecklist } from "./ActivationChecklist";

describe("ActivationChecklist", () => {
  const mockViolations: WorkflowActivationViolation[] = [
    {
      code: "NO_TERMINAL_STEP",
      message: "The workflow has no terminal step configured.",
    },
    {
      code: "UNREACHABLE_STEP",
      message: "Step 'Faculty Board' cannot be reached from the initial step.",
      stepId: 4,
    },
  ];

  it("renders activation violations as an informative checklist", () => {
    const onDismiss = vi.fn();

    render(
      <ActivationChecklist
        violations={mockViolations}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText(/Workflow Activation Blocked/i)).toBeInTheDocument();
    expect(
      screen.getByText("The workflow has no terminal step configured."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Step 'Faculty Board' cannot be reached from the initial step.",
      ),
    ).toBeInTheDocument();

    const dismissBtn = screen.getByRole("button", { name: /Dismiss/i });
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders nothing when violations list is empty", () => {
    const { container } = render(
      <ActivationChecklist violations={[]} onDismiss={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
