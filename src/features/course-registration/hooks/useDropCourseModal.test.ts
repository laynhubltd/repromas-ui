import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestScreen } from "@/shared/types/error-ui";
import { useDropCourseModal } from "./useDropCourseModal";
import type { CourseItem } from "../types/course-registration";

const mockDeleteRegistrationUnwrap = vi.fn();
const mockDeleteRegistration = vi.fn(() => ({
  unwrap: mockDeleteRegistrationUnwrap,
}));

vi.mock("../api/studentCourseRegistrationsApi", () => ({
  useDeleteStudentCourseRegistrationMutation: () => [
    mockDeleteRegistration,
    { isLoading: false },
  ],
}));

const mockNotifyMutationSuccess = vi.fn();
const mockMutationSuccessMessage = vi.fn(
  (entity: string, action: string) => `${entity} ${action} successfully.`,
);

vi.mock("@/shared/utils/feedback/notifyMutationSuccess", () => ({
  notifyMutationSuccess: (...args: unknown[]) => mockNotifyMutationSuccess(...args),
  mutationSuccessMessage: (entity: string, action: string) =>
    mockMutationSuccessMessage(entity, action),
}));

const mockHandleError = vi.fn();
vi.mock("@/shared/hooks/useApiError", () => ({
  useApiError: () => mockHandleError,
}));

describe("useDropCourseModal", () => {
  const mockTarget: CourseItem = {
    registrationId: 1554380,
    configId: 117182,
    courseId: 14797,
    courseCode: "COM111",
    courseTitle: "INTRODUCTION TO COMPUTERS",
    creditUnits: 3,
    isMandatory: false,
  };

  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct initial state", () => {
    const { result } = renderHook(() =>
      useDropCourseModal(mockTarget, 62179, 1, true, onCloseMock),
    );

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isMissingId).toBe(false);
  });

  it("should indicate isMissingId when target has no registrationId", () => {
    const { result } = renderHook(() =>
      useDropCourseModal(
        { ...mockTarget, registrationId: undefined },
        62179,
        1,
        true,
        onCloseMock,
      ),
    );

    expect(result.current.state.isMissingId).toBe(true);
  });

  it("should successfully trigger delete mutation, notify success, and close modal", async () => {
    mockDeleteRegistrationUnwrap.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useDropCourseModal(mockTarget, 62179, 1, true, onCloseMock),
    );

    await act(async () => {
      await result.current.actions.handleConfirm();
    });

    expect(mockDeleteRegistration).toHaveBeenCalledWith({
      registrationId: 1554380,
      studentId: 62179,
      semesterTypeId: 1,
    });
    expect(mockNotifyMutationSuccess).toHaveBeenCalledWith(
      "Course registration deleted successfully.",
    );
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should delegate errors to useApiError when mutation fails and not close modal", async () => {
    const errorResponse = {
      status: 422,
      data: {
        detail:
          "Cannot delete registration because scores or grades are already recorded.",
      },
    };
    mockDeleteRegistrationUnwrap.mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() =>
      useDropCourseModal(mockTarget, 62179, 1, true, onCloseMock),
    );

    await act(async () => {
      await result.current.actions.handleConfirm();
    });

    expect(mockHandleError).toHaveBeenCalledWith(
      errorResponse,
      expect.objectContaining({
        context: { screen: RequestScreen.Action, method: "DELETE" },
      }),
    );
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
