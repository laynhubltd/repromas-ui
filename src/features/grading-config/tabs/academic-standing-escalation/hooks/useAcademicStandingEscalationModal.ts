import { useGetSemesterTypesQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
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
  useCreateAcademicStandingEscalationStepMutation,
  useUpdateAcademicStandingEscalationStepMutation,
} from "../api/academicStandingEscalationApi";
import {
  AcademicStandingEscalationFormActionType,
  academicStandingEscalationFormReducer,
  initialAcademicStandingEscalationFormState,
} from "../state/academicStandingEscalationFormState";
import type {
  AcademicStandingEscalationStep,
  ActionTimingMode,
} from "../types/academic-standing-escalation";

export interface EscalationStepFormValues {
  stepNumber: number;
  label: string;
  actionTimingMode: ActionTimingMode;
  semesterTypeId?: number | null;
  studentTransitionStatusId: number;
  isTerminal: boolean;
}

export function useAcademicStandingEscalationModal(
  boundaryId: number,
  defaultStepNumber: number,
  target: AcademicStandingEscalationStep | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<EscalationStepFormValues>();
  const [formState, dispatch] = useReducer(
    academicStandingEscalationFormReducer,
    initialAcademicStandingEscalationFormState,
  );

  const [createStep, { isLoading: isCreating }] =
    useCreateAcademicStandingEscalationStepMutation();
  const [updateStep, { isLoading: isUpdating }] =
    useUpdateAcademicStandingEscalationStepMutation();
  const handleApiError = useApiError();

  const { data: statusesData, isLoading: isStatusesLoading } =
    useGetTransitionStatusesQuery({ itemsPerPage: 100 }, { skip: !open });

  const { data: semesterTypesData, isLoading: isSemesterTypesLoading } =
    useGetSemesterTypesQuery({ itemsPerPage: 100 }, { skip: !open });

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (target) {
        form.setFieldsValue({
          stepNumber: target.stepNumber,
          label: target.label,
          actionTimingMode: target.actionTimingMode,
          semesterTypeId: target.semesterTypeId,
          studentTransitionStatusId: target.studentTransitionStatusId,
          isTerminal: target.isTerminal,
        });
        dispatch({
          type: AcademicStandingEscalationFormActionType.SetActionTimingMode,
          mode: target.actionTimingMode,
        });
        dispatch({
          type: AcademicStandingEscalationFormActionType.SetSemesterTypeId,
          semesterTypeId: target.semesterTypeId,
        });
        dispatch({
          type: AcademicStandingEscalationFormActionType.SetIsTerminal,
          value: target.isTerminal,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          stepNumber: defaultStepNumber,
          actionTimingMode: "ANY_SEMESTER",
          semesterTypeId: null,
          isTerminal: false,
        });
        dispatch({ type: AcademicStandingEscalationFormActionType.Reset });
      }
    }
  }, [open, target, defaultStepNumber, form]);

  const handleActionTimingModeChange = (mode: ActionTimingMode) => {
    if (mode !== "SPECIFIC_SEMESTER") {
      form.setFieldsValue({ semesterTypeId: null });
    }
    dispatch({
      type: AcademicStandingEscalationFormActionType.SetActionTimingMode,
      mode,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const semesterTypeId =
        values.actionTimingMode === "SPECIFIC_SEMESTER"
          ? (values.semesterTypeId ?? null)
          : null;

      if (isEditMode && target) {
        await updateStep({
          id: target.id,
          label: values.label.trim(),
          actionTimingMode: values.actionTimingMode,
          semesterTypeId,
          studentTransitionStatusId: values.studentTransitionStatusId,
          isTerminal: values.isTerminal,
        }).unwrap();
      } else {
        await createStep({
          academicStandingBoundaryId: boundaryId,
          stepNumber: values.stepNumber,
          label: values.label.trim(),
          actionTimingMode: values.actionTimingMode,
          semesterTypeId,
          studentTransitionStatusId: values.studentTransitionStatusId,
          isTerminal: values.isTerminal,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Escalation step", isEditMode ? "updated" : "created"),
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
    dispatch({ type: AcademicStandingEscalationFormActionType.Reset });
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
      semesterTypes: semesterTypesData?.member ?? [],
      isSemesterTypesLoading,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleActionTimingModeChange,
    },
    form,
  };
}
