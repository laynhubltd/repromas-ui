// Feature: grading-config — Evaluation Status modal hooks
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateScoreEvaluationStatusMutation,
  useDeleteScoreEvaluationStatusMutation,
  useUpdateScoreEvaluationStatusMutation,
} from "../api/evaluationStatusApi";
import {
  EvaluationStatusFormActionType,
  evaluationStatusFormReducer,
  initialEvaluationStatusFormState,
} from "../state/evaluationStatusFormState";
import type { ScoreEvaluationStatus } from "../types/evaluation-status";

// ─── Types ────────────────────────────────────────────────────────────────────

type EvaluationStatusFormValues = {
  name: string;
  code: string;
  isStandardGraded: boolean;
  computesInGpa: boolean;
  earnsCredit: boolean;
  requiresRetake: boolean;
  isDefault: boolean;
  indicatesAbsence: boolean;
  isStandardPass: boolean;
  isStandardFail: boolean;
};

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useEvaluationStatusFormModal(
  target: ScoreEvaluationStatus | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<EvaluationStatusFormValues>();
  const [state, dispatch] = useReducer(
    evaluationStatusFormReducer,
    initialEvaluationStatusFormState,
  );
  const { isDefault, requiresRetake, earnsCredit, isStandardGraded, isStandardPass, isStandardFail } = state;

  const [createScoreEvaluationStatus, { isLoading: isCreating }] =
    useCreateScoreEvaluationStatusMutation();
  const [updateScoreEvaluationStatus, { isLoading: isUpdating }] =
    useUpdateScoreEvaluationStatusMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        code: target.code,
        isStandardGraded: target.isStandardGraded,
        computesInGpa: target.computesInGpa,
        earnsCredit: target.earnsCredit,
        requiresRetake: target.requiresRetake,
        isDefault: target.isDefault,
        indicatesAbsence: target.indicatesAbsence ?? false,
        isStandardPass: target.isStandardPass ?? false,
        isStandardFail: target.isStandardFail ?? false,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetIsDefault,
        value: target.isDefault,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetRequiresRetake,
        value: target.requiresRetake,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetEarnsCredit,
        value: target.earnsCredit,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetIsStandardGraded,
        value: target.isStandardGraded,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetIsStandardPass,
        value: target.isStandardPass ?? false,
      });
      dispatch({
        type: EvaluationStatusFormActionType.SetIsStandardFail,
        value: target.isStandardFail ?? false,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        isStandardGraded: true,
        computesInGpa: true,
        earnsCredit: true,
        requiresRetake: false,
        isDefault: false,
        indicatesAbsence: false,
        isStandardPass: false,
        isStandardFail: false,
      });
      dispatch({ type: EvaluationStatusFormActionType.Reset });
    }
  }, [open, target]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: EvaluationStatusFormActionType.Reset });
  }, [form]);

  // Auto-uppercase code field
  const handleCodeChange = useCallback(
    (value: string) => {
      form.setFieldValue("code", value.toUpperCase());
    },
    [form],
  );

  // isStandardGraded toggle handler
  const handleIsStandardGradedChange = useCallback(
    (value: boolean) => {
      dispatch({ type: EvaluationStatusFormActionType.SetIsStandardGraded, value });
      form.setFieldValue("isStandardGraded", value);
      if (!value) {
        form.setFieldValue("isStandardPass", false);
        form.setFieldValue("isStandardFail", false);
      }
    },
    [form],
  );

  // isStandardPass toggle handler
  const handleIsStandardPassChange = useCallback(
    (value: boolean) => {
      dispatch({ type: EvaluationStatusFormActionType.SetIsStandardPass, value });
      form.setFieldValue("isStandardPass", value);
      if (value) {
        form.setFieldValue("isStandardFail", false);
      }
    },
    [form],
  );

  // isStandardFail toggle handler
  const handleIsStandardFailChange = useCallback(
    (value: boolean) => {
      dispatch({ type: EvaluationStatusFormActionType.SetIsStandardFail, value });
      form.setFieldValue("isStandardFail", value);
      if (value) {
        form.setFieldValue("isStandardPass", false);
      }
    },
    [form],
  );

  // isDefault toggle handler
  const handleIsDefaultChange = useCallback(
    (value: boolean) => {
      dispatch({ type: EvaluationStatusFormActionType.SetIsDefault, value });
      form.setFieldValue("isDefault", value);
    },
    [form],
  );

  // requiresRetake toggle handler
  const handleRequiresRetakeChange = useCallback(
    (value: boolean) => {
      dispatch({
        type: EvaluationStatusFormActionType.SetRequiresRetake,
        value,
      });
      form.setFieldValue("requiresRetake", value);
    },
    [form],
  );

  // earnsCredit toggle handler
  const handleEarnsCreditChange = useCallback(
    (value: boolean) => {
      dispatch({ type: EvaluationStatusFormActionType.SetEarnsCredit, value });
      form.setFieldValue("earnsCredit", value);
    },
    [form],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: EvaluationStatusFormActionType.SetFormError,
        message: null,
      });

      if (isEditMode) {
        await updateScoreEvaluationStatus({
          id: target.id,
          name: values.name,
          code: values.code,
          isStandardGraded: values.isStandardGraded,
          computesInGpa: values.computesInGpa,
          earnsCredit: values.earnsCredit,
          requiresRetake: values.requiresRetake,
          isDefault: values.isDefault,
          indicatesAbsence: values.indicatesAbsence,
          isStandardPass: values.isStandardPass,
          isStandardFail: values.isStandardFail,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Evaluation status", "updated"),
        );
      } else {
        await createScoreEvaluationStatus({
          name: values.name,
          code: values.code,
          isStandardGraded: values.isStandardGraded,
          computesInGpa: values.computesInGpa,
          earnsCredit: values.earnsCredit,
          requiresRetake: values.requiresRetake,
          isDefault: values.isDefault,
          indicatesAbsence: values.indicatesAbsence,
          isStandardPass: values.isStandardPass,
          isStandardFail: values.isStandardFail,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Evaluation status", "created"),
        );
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      isDefault,
      requiresRetake,
      earnsCredit,
      isStandardGraded,
      isStandardPass,
      isStandardFail,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleIsDefaultChange,
      handleRequiresRetakeChange,
      handleEarnsCreditChange,
      handleIsStandardGradedChange,
      handleIsStandardPassChange,
      handleIsStandardFailChange,
      handleCodeChange,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteEvaluationStatusModal(
  target: ScoreEvaluationStatus | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteScoreEvaluationStatus, { isLoading: isDeleting }] =
    useDeleteScoreEvaluationStatusMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deleteScoreEvaluationStatus(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Evaluation status", "deleted"),
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
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
