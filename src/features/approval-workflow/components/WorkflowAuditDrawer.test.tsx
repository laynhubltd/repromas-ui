import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WorkflowAuditEntry } from "../types/approval-workflow";
import { WorkflowAuditDrawer } from "./WorkflowAuditDrawer";

const mockUseWorkflowAudit = vi.fn();

vi.mock("../hooks/useWorkflowAudit", () => ({
  useWorkflowAudit: (opts: unknown) => mockUseWorkflowAudit(opts),
}));

describe("WorkflowAuditDrawer", () => {
  it("renders audit timeline entries correctly", () => {
    const mockHistory: WorkflowAuditEntry[] = [
      {
        id: 1,
        fromState: "DEPARTMENT_REVIEW",
        toState: "DRAFT",
        actionName: "Returned to Lecturer",
        actorUserId: 42,
        actorUserName: "Dr. Bamidele Adeyemi",
        actingRoleName: "Head of Department",
        comment: "Please correct CA2 scores for student 003",
        createdAt: "2026-03-01T10:00:00Z",
      },
    ];

    mockUseWorkflowAudit.mockReturnValue({
      state: {
        history: mockHistory,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
      },
      actions: {
        refetch: vi.fn(),
      },
    });

    render(
      <WorkflowAuditDrawer
        open={true}
        targetEntity="SCORE_SHEET"
        targetId={101}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Workflow Audit History")).toBeInTheDocument();
    expect(screen.getByText("Returned to Lecturer")).toBeInTheDocument();
    expect(screen.getByText("Head of Department")).toBeInTheDocument();
    expect(screen.getByText("Dr. Bamidele Adeyemi")).toBeInTheDocument();
    expect(screen.getByText("DEPARTMENT_REVIEW")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(
      screen.getByText('"Please correct CA2 scores for student 003"'),
    ).toBeInTheDocument();
  });
});
