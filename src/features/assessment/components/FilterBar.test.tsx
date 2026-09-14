import { render, screen, fireEvent } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/app/api/baseApi";
import { authReducer } from "@/features/auth/state/auth-slice";
import { FilterBar } from "./FilterBar";
import type { CourseConfigurationGroupOption } from "@/features/courses/tabs/course-configurations/types/course-configuration";
import type { Program } from "@/features/program/tabs/programs/types/program";

beforeAll(() => {
  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  global.ResizeObserver = ResizeObserverMock as any;
  window.ResizeObserver = ResizeObserverMock as any;

  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    };
});

function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

// Mock LevelSelect
vi.mock("@/components/ui-kit/data-entry/LevelSelect", () => ({
  LevelSelect: ({ placeholder, onChange }: any) => (
    <div data-testid="level-select" onClick={() => onChange?.(1)}>
      {placeholder}
    </div>
  ),
}));

describe("FilterBar with Grouped Course Configuration Options", () => {
  const mockPrograms: Program[] = [
    {
      id: 10,
      name: "Computer Science",
      code: "COM",
      departmentId: 1,
      degreeTitle: "B.Sc",
      durationInYears: 4,
      maxResidencyYears: 6,
      createdAt: "",
      updatedAt: "",
    },
  ];

  const mockGroupedOptions: CourseConfigurationGroupOption[] = [
    {
      versionId: 14,
      label: "2022/2023 - 2026/2027",
      scope: "DEPARTMENT",
      isActiveForAdmission: true,
      options: [
        {
          value: 1782,
          label: "COM111 — Introduction to Computers (3 Units) [Core]",
          code: "COM111",
          title: "Introduction to Computers",
          creditUnit: 3,
          courseStatus: "CORE",
          semesterTypeId: 1,
          semesterTypeName: "First Semester",
          levelId: 1,
          levelName: "ND I",
          courseId: 2420,
        },
      ],
    },
  ];

  const defaultProps = {
    programOptions: mockPrograms,
    programLoading: false,
    programError: null,
    selectedProgramId: 10,
    programSearch: "",
    onProgramSearch: vi.fn(),
    onProgramChange: vi.fn(),
    selectedLevelId: 1,
    onLevelChange: vi.fn(),
    courseConfigGroupedOptions: mockGroupedOptions,
    courseConfigLoading: false,
    courseConfigError: null,
    selectedConfigId: null,
    courseSearch: "",
    onCourseSearch: vi.fn(),
    onCourseConfigChange: vi.fn(),
    isCourseConfigDisabled: false,
    onDownload: vi.fn(),
    onOpenUpload: vi.fn(),
    isDownloading: false,
    isBulkDisabled: false,
  };

  it("renders with grouped course configuration options correctly", () => {
    render(
      <Provider store={makeStore()}>
        <FilterBar {...defaultProps} />
      </Provider>,
    );

    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Search course by code or title…")).toBeInTheDocument();
  });

  it("calls onCourseSearch when user types into the course search field", () => {
    const onCourseSearch = vi.fn();
    const { container } = render(
      <Provider store={makeStore()}>
        <FilterBar {...defaultProps} onCourseSearch={onCourseSearch} />
      </Provider>,
    );

    const inputs = container.querySelectorAll("input.ant-select-input");
    const courseInput = inputs[1];
    expect(courseInput).toBeDefined();

    fireEvent.change(courseInput, { target: { value: "COM111" } });
    expect(onCourseSearch).toHaveBeenCalledWith("COM111");
  });
});
