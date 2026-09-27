import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { useDeleteStudentCourseRegistrationMutation } from "../api/studentCourseRegistrationsApi";
import type { CourseItem } from "../types/course-registration";

/**
 * Hook for dropping an individual registered course for a student.
 *
 * Handles:
 * - Calling DELETE /api/student-course-registrations/{registrationId}
 * - Surfacing mutation success via notifyMutationSuccess
 * - Capturing errors (e.g. 422 CannotDeletePublishedCourseRegistrationException)
 *   via useApiError with RequestScreen.Action
 *
 * Rules:
 * - agent.md: All mutation catch blocks MUST use useApiError
 * - agent.md: MUST call notifyMutationSuccess after successful DELETE
 */
export function useDropCourseModal(
  target: CourseItem | null,
  studentId: number | null,
  semesterTypeId: number | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteRegistration, { isLoading }] =
    useDeleteStudentCourseRegistrationMutation();
  const handleApiError = useApiError();

  void open;

  const handleConfirm = async () => {
    if (!target?.registrationId || !studentId) return;
    try {
      await deleteRegistration({
        registrationId: target.registrationId,
        studentId,
        semesterTypeId: semesterTypeId ?? undefined,
      }).unwrap();

      notifyMutationSuccess(
        mutationSuccessMessage("Course registration", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isLoading, isMissingId: !target?.registrationId },
    actions: { handleConfirm, handleCancel },
  };
}
