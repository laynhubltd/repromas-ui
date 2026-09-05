import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect, useReducer } from "react";
import {
  useCreateAcademicStandingBoundaryMutation,
  useUpdateAcademicStandingBoundaryMutation,
} from "../api/academicStandingBoundaryApi";
import {
  AcademicStandingBoundaryFormActionType,
  academicStandingBoundaryFormReducer,
  initialAcademicStandingBoundaryFormState,
} from "../state/academicStandingBoundaryFormState";
import type { AcademicStandingBoundary } from "../types/academic-standing-boundary";

export interface AcademicStandingBoundaryFormValues {
  name: string;
  minCgpa: number;
  maxCarryoverCount?: number | null;
  hasEscalationLadder: boolean;
  studentTransitionStatusId: number;
}

export function useAcademicStandingBoundaryModal(
  policyId: number,
  target: AcademicStandingBoundary | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<AcademicStandingBoundaryFormValues>();
  const [formState, dispatch] = useReducer(
    academicStandingBoundaryFormReducer,
    initialAcademicStandingBoundaryFormState,
  );

  const [createBoundary, { isLoading: isCreating }] =
    useCreateAcademicStandingBoundaryMutation();
  const [updateBoundary, { isLoading: isUpdating }] =
    useUpdateAcademicStandingBoundaryMutation();
  const handleApiError = useApiError();

  const { data: statusesData, isLoading: isStatusesLoading } =
    useGetTransitionStatusesQuery({ itemsPerPage: 100 }, { skip: !open });

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (target) {
        form.setFieldsValue({
          name: target.name,
          minCgpa: Number(target.minCgpa),
          maxCarryoverCount: target.maxCarryoverCount,
          hasEscalationLadder: target.hasEscalationLadder,
          studentTransitionStatusId: target.studentTransitionStatusId,
        });
        dispatch({
          type: AcademicStandingBoundaryFormActionType.SetHasEscalationLadder,
          value: target.hasEscalationLadder,
        });
        dispatch({
          type: AcademicStandingBoundaryFormActionType.SetMaxCarryoverCount,
          value: target.maxCarryoverCount,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          minCgpa: 0.0,
          hasEscalationLadder: false,
        });
        dispatch({ type: AcademicStandingBoundaryFormActionType.Reset });
      }
    }
  }, [open, target, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && target) {
        await updateBoundary({
          id: target.id,
          name: values.name.trim(),
          minCgpa: values.minCgpa,
          maxCarryoverCount: values.maxCarryoverCount ?? null,
          hasEscalationLadder: values.hasEscalationLadder,
          studentTransitionStatusId: values.studentTransitionStatusId,
        }).unwrap();
      } else {
        await createBoundary({
          academicStandingId: policyId,
          name: values.name.trim(),
          minCgpa: values.minCgpa,
          maxCarryoverCount: values.maxCarryoverCount ?? null,
          hasEscalationLadder: values.hasEscalationLadder,
          studentTransitionStatusId: values.studentTransitionStatusId,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage(
          "Academic Standing boundary",
          isEditMode ? "updated" : "created",
        ),
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
      if (isEditMode && decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch({ type: AcademicStandingBoundaryFormActionType.Reset });
    onClose();
  };

  return {
    state: {
      isLoading,
      isEditMode,
      formState,
      transitionStatuses: (statusesData?.member ?? []).filter(
        (s) => s.managedBy !== "ADMIN",
      ),
      isStatusesLoading,
    },
    actions: {
      handleSubmit,
      handleCancel,
    },
    form,
  };
}
