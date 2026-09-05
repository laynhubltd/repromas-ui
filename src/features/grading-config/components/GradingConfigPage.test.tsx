import { fireEvent, render, screen } from "@testing-library/react";
import { Grid } from "antd";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GradingConfigPage } from "./GradingConfigPage";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  vi.spyOn(Grid, "useBreakpoint").mockReturnValue({
    xs: false,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  });
});

vi.mock("../tabs/grading-system", () => ({
  GradingSystemTab: () => <div data-testid="grading-system-tab">Grading Systems Content</div>,
}));

vi.mock("../tabs/grading-system-boundary", () => ({
  GradingSystemBoundaryTab: () => (
    <div data-testid="grading-system-boundary-tab">Grade Boundaries Content</div>
  ),
}));

vi.mock("../tabs/evaluation-status", () => ({
  EvaluationStatusTab: () => (
    <div data-testid="evaluation-status-tab">Evaluation Status Content</div>
  ),
}));

vi.mock("../tabs/academic-standing", () => ({
  AcademicStandingTab: () => (
    <div data-testid="academic-standing-tab">Academic Standing Policies Content</div>
  ),
}));

vi.mock("../tabs/academic-standing-boundary", () => ({
  AcademicStandingBoundaryTab: () => (
    <div data-testid="academic-standing-boundary-tab">CGPA Boundaries Content</div>
  ),
}));

vi.mock("../tabs/academic-standing-escalation", () => ({
  AcademicStandingEscalationTab: () => (
    <div data-testid="academic-standing-escalation-tab">Escalation Ladders Content</div>
  ),
}));

describe("GradingConfigPage", () => {
  it("renders top-level groups and defaults to Grading Systems", () => {
    render(
      <MemoryRouter>
        <GradingConfigPage />
      </MemoryRouter>,
    );

    // Top-layer group segments
    expect(screen.getByText("Grading System")).toBeInTheDocument();
    expect(screen.getByText("Academic Standing")).toBeInTheDocument();

    // Default tab content
    expect(screen.getByTestId("grading-system-tab")).toBeInTheDocument();
    expect(screen.getByText("Grading Systems")).toBeInTheDocument();
    expect(screen.getByText("Grade Boundaries")).toBeInTheDocument();
    expect(screen.getByText("Evaluation Status")).toBeInTheDocument();
  });

  it("switches to Academic Standing top-level group and shows the 3 sub-tabs", () => {
    render(
      <MemoryRouter>
        <GradingConfigPage />
      </MemoryRouter>,
    );

    const standingSegment = screen.getByText("Academic Standing");
    fireEvent.click(standingSegment);

    expect(screen.getByText("Standing Policies")).toBeInTheDocument();
    expect(screen.getByText("CGPA Boundaries")).toBeInTheDocument();
    expect(screen.getByText("Escalation Ladders")).toBeInTheDocument();
    expect(screen.getByTestId("academic-standing-tab")).toBeInTheDocument();
  });
});
