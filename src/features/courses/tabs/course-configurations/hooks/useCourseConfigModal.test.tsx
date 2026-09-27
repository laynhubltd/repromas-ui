import { act, render, renderHook } from "@testing-library/react";
import { Form, Input, InputNumber, Select } from "antd";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCourseConfigFormModal } from "./useCourseConfigModal";
import type { CourseConfiguration } from "../types/course-configuration";

const mockCreateUnwrap = vi.fn();
const mockCreate = vi.fn(() => ({ unwrap: mockCreateUnwrap }));
const mockUpdateUnwrap = vi.fn();
const mockUpdate = vi.fn(() => ({ unwrap: mockUpdateUnwrap }));

vi.mock("../api/courseConfigurationsApi", () => ({
  useCreateCourseConfigurationMutation: () => [mockCreate, { isLoading: false }],
  useUpdateCourseConfigurationMutation: () => [mockUpdate, { isLoading: false }],
  useDeleteCourseConfigurationMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("@/features/settings/tabs/academic-calendar/api/academicCalendarApi", () => ({
  useGetSemesterTypesQuery: () => ({
    data: {
      member: [
        { id: 1, name: "First Semester", sortOrder: 1 },
        { id: 2, name: "Second Semester", sortOrder: 2 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("@/features/settings/tabs/level-config/api/levelApi", () => ({
  useGetLevelsQuery: () => ({
    data: {
      member: [
        { id: 1, name: "ND I", rankOrder: 1 },
        { id: 2, name: "ND II", rankOrder: 2 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock("../../courses/api/coursesApi", () => ({
  useGetCoursesQuery: () => ({
    data: {
      member: [
        { id: 10, code: "MTH111", title: "General Mathematics", creditUnits: 3, isActive: true },
      ],
    },
    isLoading: false,
    isFetching: false,
  }),
  useGetCourseQuery: () => ({ data: undefined }),
}));

vi.mock("@/shared/hooks/useApiError", () => ({
  useApiError: () => vi.fn(),
}));

vi.mock("@/shared/utils/feedback/notifyMutationSuccess", () => ({
  notifyMutationSuccess: vi.fn(),
  mutationSuccessMessage: vi.fn(() => "Success"),
}));

function FormTestHarness({
  target = null,
  open = true,
  onClose = vi.fn(),
  onHookReady,
}: {
  target?: CourseConfiguration | null;
  open?: boolean;
  onClose?: () => void;
  onHookReady: (result: ReturnType<typeof useCourseConfigFormModal>) => void;
}) {
  const hookResult = useCourseConfigFormModal(target, open, onClose);

  React.useEffect(() => {
    onHookReady(hookResult);
  }, [hookResult, onHookReady]);

  return (
    <Form form={hookResult.form}>
      <Form.Item name="courseId"><InputNumber /></Form.Item>
      <Form.Item name="levelId"><InputNumber /></Form.Item>
      <Form.Item name="semesterTypeId"><InputNumber /></Form.Item>
      <Form.Item name="courseStatus"><Input /></Form.Item>
      <Form.Item name="creditUnit"><InputNumber /></Form.Item>
      <Form.Item name="title"><Input /></Form.Item>
      <Form.Item name="prerequisiteIds"><Select mode="multiple" /></Form.Item>
    </Form>
  );
}

describe("useCourseConfigFormModal", () => {
  const baseTarget: CourseConfiguration = {
    id: 101,
    programId: 1,
    versionId: 2,
    courseId: 10,
    levelId: 1,
    semesterTypeId: 1,
    courseStatus: "CORE",
    creditUnit: 3,
    title: null,
    effectiveTitle: "General Mathematics",
    hasAnyScore: false,
    prerequisiteIds: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUnwrap.mockResolvedValue({});
    mockUpdateUnwrap.mockResolvedValue({});
  });

  describe("isScoreLocked calculation", () => {
    it("is false in create mode (target === null)", () => {
      const { result } = renderHook(() =>
        useCourseConfigFormModal(null, true, vi.fn()),
      );
      expect(result.current.state.isScoreLocked).toBe(false);
      expect(result.current.state.isEditMode).toBe(false);
    });

    it("is false in edit mode when hasAnyScore is false", () => {
      const { result } = renderHook(() =>
        useCourseConfigFormModal({ ...baseTarget, hasAnyScore: false }, true, vi.fn()),
      );
      expect(result.current.state.isScoreLocked).toBe(false);
      expect(result.current.state.isEditMode).toBe(true);
    });

    it("is true in edit mode when hasAnyScore is true", () => {
      const { result } = renderHook(() =>
        useCourseConfigFormModal({ ...baseTarget, hasAnyScore: true }, true, vi.fn()),
      );
      expect(result.current.state.isScoreLocked).toBe(true);
      expect(result.current.state.isEditMode).toBe(true);
    });
  });

  describe("title normalization and submission", () => {
    it("submits title: null when title is omitted or whitespace in create mode", async () => {
      const onClose = vi.fn();
      let hook!: ReturnType<typeof useCourseConfigFormModal>;

      render(
        <FormTestHarness
          target={null}
          open={true}
          onClose={onClose}
          onHookReady={(res) => {
            hook = res;
          }}
        />,
      );

      act(() => {
        hook.form.setFieldsValue({
          courseId: 10,
          levelId: 1,
          semesterTypeId: 1,
          courseStatus: "CORE",
          creditUnit: 3,
          title: "   ",
        });
      });

      await act(async () => {
        await hook.actions.handleSubmit(1, 2);
      });

      expect(mockCreate).toHaveBeenCalledWith({
        programId: 1,
        versionId: 2,
        courseId: 10,
        levelId: 1,
        semesterTypeId: 1,
        courseStatus: "CORE",
        creditUnit: 3,
        title: null,
        prerequisiteIds: [],
      });
      expect(onClose).toHaveBeenCalled();
    });

    it("submits trimmed title string when custom title is entered", async () => {
      const onClose = vi.fn();
      let hook!: ReturnType<typeof useCourseConfigFormModal>;

      render(
        <FormTestHarness
          target={null}
          open={true}
          onClose={onClose}
          onHookReady={(res) => {
            hook = res;
          }}
        />,
      );

      act(() => {
        hook.form.setFieldsValue({
          courseId: 10,
          levelId: 1,
          semesterTypeId: 1,
          courseStatus: "CORE",
          creditUnit: 3,
          title: "  Applied Engineering Maths  ",
        });
      });

      await act(async () => {
        await hook.actions.handleSubmit(1, 2);
      });

      expect(mockCreate).toHaveBeenCalledWith({
        programId: 1,
        versionId: 2,
        courseId: 10,
        levelId: 1,
        semesterTypeId: 1,
        courseStatus: "CORE",
        creditUnit: 3,
        title: "Applied Engineering Maths",
        prerequisiteIds: [],
      });
    });

    it("submits title: null on cleared title in edit mode", async () => {
      const onClose = vi.fn();
      const editTarget: CourseConfiguration = {
        ...baseTarget,
        title: "Previous Custom Title",
      };
      let hook!: ReturnType<typeof useCourseConfigFormModal>;

      render(
        <FormTestHarness
          target={editTarget}
          open={true}
          onClose={onClose}
          onHookReady={(res) => {
            hook = res;
          }}
        />,
      );

      act(() => {
        hook.form.setFieldsValue({
          courseId: 10,
          levelId: 1,
          semesterTypeId: 1,
          courseStatus: "CORE",
          creditUnit: 3,
          title: "",
        });
      });

      await act(async () => {
        await hook.actions.handleSubmit(1, 2);
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        id: 101,
        levelId: 1,
        semesterTypeId: 1,
        courseStatus: "CORE",
        creditUnit: 3,
        title: null,
        prerequisiteIds: [],
      });
    });
  });
});
