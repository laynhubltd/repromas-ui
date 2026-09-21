import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { baseApi } from "@/app/api/baseApi";
import type { AvailableTransitionsResponse } from "../types/approval-workflow";
import { WorkflowStatusBar } from "./WorkflowStatusBar";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

const mockUseWorkflowTransitions = vi.fn();

vi.mock("../hooks/useWorkflowTransitions", () => ({
  useWorkflowTransitions: (opts: unknown) => mockUseWorkflowTransitions(opts),
}));

describe("WorkflowStatusBar", () => {
  const mockSteps = [
    {
      id: 1,
      stateCode: "DRAFT",
      label: "Draft",
      sortOrder: 1,
      name: "Draft",
      sequenceOrder: 1,
      isInitial: true,
      isTerminal: false,
      isEditable: true,
    },
    {
      id: 2,
      stateCode: "DEPARTMENT_REVIEW",
      label: "Department Review",
      sortOrder: 2,
      name: "Department Review",
      sequenceOrder: 2,
      isInitial: false,
      isTerminal: false,
      isEditable: false,
    },
    {
      id: 3,
      stateCode: "DEAN_APPROVAL",
      label: "Dean Approval",
      sortOrder: 3,
      name: "Dean Approval",
      sequenceOrder: 3,
      isInitial: false,
      isTerminal: true,
      isEditable: false,
    },
  ];

  it("renders steps ladder and transition action buttons accurately", () => {
    const mockData: AvailableTransitionsResponse = {
      currentStep: mockSteps[0],
      steps: mockSteps,
      transitions: [
        {
          transitionId: 101,
          id: 101,
          actionName: "Submit to HOD",
          name: "Submit to HOD",
          actionLabel: "Submit to HOD",
          fromState: "DRAFT",
          toState: "DEPARTMENT_REVIEW",
          direction: "FORWARD",
          requiresComment: false,
        },
      ],
      isLocked: false,
      isTerminal: false,
      canAct: true,
    };

    const handleInitiateTransition = vi.fn();

    mockUseWorkflowTransitions.mockReturnValue({
      state: {
        availableTransitions: mockData,
        currentStep: mockData.currentStep,
        steps: mockData.steps,
        transitions: mockData.transitions,
        isLocked: false,
        isTerminal: false,
        canAct: true,
        isLoading: false,
        isFetching: false,
        isExecuting: false,
        isCommentModalOpen: false,
        selectedTransition: null,
        comment: "",
        isPropagating: false,
        isAuditDrawerOpen: false,
      },
      actions: {
        handleInitiateTransition,
        handleCommentChange: vi.fn(),
        handleConfirmCommentModal: vi.fn(),
        handleCancelCommentModal: vi.fn(),
        handleOpenAuditDrawer: vi.fn(),
        handleCloseAuditDrawer: vi.fn(),
        refetch: vi.fn(),
      },
    });

    render(
      <Provider store={makeStore()}>
        <WorkflowStatusBar
          targetEntity="SCORE_SHEET"
          targetId={99}
        />
      </Provider>,
    );

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Department Review")).toBeInTheDocument();
    expect(screen.getByText("Dean Approval")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Submit to HOD/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);

    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    expect(handleInitiateTransition).toHaveBeenCalledWith(mockData.transitions[0]);
  });

  it("renders terminal tag when workflow is terminal", () => {
    const mockData: AvailableTransitionsResponse = {
      currentStep: mockSteps[2],
      steps: mockSteps,
      transitions: [],
      isLocked: true,
      isTerminal: true,
    };

    mockUseWorkflowTransitions.mockReturnValue({
      state: {
        availableTransitions: mockData,
        currentStep: mockData.currentStep,
        steps: mockData.steps,
        transitions: [],
        isLocked: true,
        isTerminal: true,
        isLoading: false,
        isFetching: false,
        isExecuting: false,
        isCommentModalOpen: false,
        selectedTransition: null,
        comment: "",
        isPropagating: false,
        isAuditDrawerOpen: false,
      },
      actions: {
        handleInitiateTransition: vi.fn(),
        handleCommentChange: vi.fn(),
        handleConfirmCommentModal: vi.fn(),
        handleCancelCommentModal: vi.fn(),
        handleOpenAuditDrawer: vi.fn(),
        handleCloseAuditDrawer: vi.fn(),
        refetch: vi.fn(),
      },
    });

    render(
      <Provider store={makeStore()}>
        <WorkflowStatusBar
          targetEntity="SCORE_SHEET"
          targetId={99}
        />
      </Provider>,
    );

    expect(screen.getByText("Approved & Published")).toBeInTheDocument();
  });

  it("renders 'Under Review (View Only)' tag when user cannot act (canAct: false)", () => {
    const mockData: AvailableTransitionsResponse = {
      currentStep: mockSteps[1],
      steps: mockSteps,
      transitions: [],
      isLocked: true,
      isTerminal: false,
      canAct: false,
    };

    mockUseWorkflowTransitions.mockReturnValue({
      state: {
        availableTransitions: mockData,
        currentStep: mockData.currentStep,
        steps: mockData.steps,
        transitions: [],
        isLocked: true,
        isTerminal: false,
        canAct: false,
        isLoading: false,
        isFetching: false,
        isExecuting: false,
        isCommentModalOpen: false,
        selectedTransition: null,
        comment: "",
        isPropagating: false,
        isAuditDrawerOpen: false,
      },
      actions: {
        handleInitiateTransition: vi.fn(),
        handleCommentChange: vi.fn(),
        handleConfirmCommentModal: vi.fn(),
        handleCancelCommentModal: vi.fn(),
        handleOpenAuditDrawer: vi.fn(),
        handleCloseAuditDrawer: vi.fn(),
        refetch: vi.fn(),
      },
    });

    render(
      <Provider store={makeStore()}>
        <WorkflowStatusBar
          targetEntity="SCORE_SHEET"
          targetId={99}
        />
      </Provider>,
    );

    expect(screen.getByText("Under Review (View Only)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit/i })).not.toBeInTheDocument();
  });
});
