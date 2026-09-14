import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { baseApi } from "@/app/api/baseApi";
import type { WorkflowDefinitionDto } from "../../types/workflow-config";
import { WorkflowFormModal } from "./WorkflowFormModal";

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

describe("WorkflowFormModal", () => {
  it("renders in create mode when target is null", () => {
    render(
      <Provider store={makeStore()}>
        <WorkflowFormModal open={true} target={null} onClose={vi.fn()} />
      </Provider>,
    );

    expect(screen.getByText("Create Workflow Definition")).toBeInTheDocument();
    expect(screen.getByLabelText(/Workflow Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Workflow Code/i)).toBeInTheDocument();
  });

  it("renders in edit mode with target data prefilled", () => {
    const mockTarget: WorkflowDefinitionDto = {
      id: 5,
      name: "Undergraduate Score Review",
      code: "UG_SCORE_REVIEW",
      targetEntity: "SCORE_SHEET",
      description: "Custom faculty workflow",
      isActive: true,
      isDefault: false,
      stepsCount: 3,
      transitionsCount: 2,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    render(
      <Provider store={makeStore()}>
        <WorkflowFormModal open={true} target={mockTarget} onClose={vi.fn()} />
      </Provider>,
    );

    expect(screen.getByText("Edit Workflow Definition")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Undergraduate Score Review")).toBeInTheDocument();
    expect(screen.getByDisplayValue("UG_SCORE_REVIEW")).toBeInTheDocument();
    expect(screen.getByDisplayValue("UG_SCORE_REVIEW")).toBeDisabled();
  });
});
