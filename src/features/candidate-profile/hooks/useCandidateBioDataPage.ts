import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo } from "react";
import {
  useGetMeAdmissionCandidateQuery,
  usePatchMeAdmissionCandidateMutation,
  usePatchMeProfileMutation,
} from "../api/candidateProfileApi";

type BioDataFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Dayjs | null;
};

export function useCandidateBioDataPage() {
  const { hasStudentPortalScope } = useAccessControl();
  const handleApiError = useApiError();
  const [form] = Form.useForm<BioDataFormValues>();

  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);

  const {
    data: candidate,
    isLoading,
    isError,
    refetch,
  } = useGetMeAdmissionCandidateQuery(undefined, { skip: !isCandidate });

  const [patchCandidate, { isLoading: isSavingCandidate }] =
    usePatchMeAdmissionCandidateMutation();
  const [patchProfile, { isLoading: isSavingProfile }] =
    usePatchMeProfileMutation();

  const isJambLocked =
    candidate?.cycle?.admissionIdentityMode === "JAMB" ||
    (candidate?.jambRegNo !== null && candidate?.jambRegNo !== "");

  const initialValues = useMemo((): BioDataFormValues | undefined => {
    if (!candidate) return undefined;
    return {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email ?? "",
      phone: candidate.phone ?? undefined,
      dateOfBirth: candidate.dateOfBirth
        ? dayjs(candidate.dateOfBirth)
        : undefined,
    };
  }, [candidate]);

  const handleSubmit = async () => {
    if (!candidate) return;

    try {
      const values = await form.validateFields();

      await patchCandidate({
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
      }).unwrap();

      if (!isJambLocked) {
        await patchProfile({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phoneNumber: values.phone?.trim() || null,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
        }).unwrap();
      }

      notifyMutationSuccess(mutationSuccessMessage("Bio data", "updated"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Form, method: "PATCH" },
        form,
      });
    }
  };

  return {
    state: {
      candidate,
      isLoading,
      isError,
      isCandidate,
      isJambLocked,
      isSaving: isSavingCandidate || isSavingProfile,
      initialValues,
    },
    actions: {
      handleSubmit,
      refetch,
    },
    form,
  };
}
