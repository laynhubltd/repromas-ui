import { useGetOlevelSubjectsQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { OLEVEL_SUBJECT_SORT_DEFAULT } from "@/shared/constants/olevelSubjectOptions";
import {
  DEFAULT_CUTOFFS,
  DEFAULT_OLEVEL_CREDIT_GATE,
  DEFAULT_QUOTA_PERCENTAGES,
  OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE,
  PROGRAM_ADMISSION_CONFIG_INCLUDE,
  PROGRAM_ADMISSION_CONFIG_PICKER_ITEMS_PER_PAGE,
  PROGRAM_ADMISSION_CONFIG_SORT,
} from "@/shared/constants/programAdmissionConfigOptions";
import { Form } from "antd";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useCreateProgramAdmissionConfigMutation,
  useDeleteProgramAdmissionConfigMutation,
  useGetProgramAdmissionConfigsQuery,
  useUpdateProgramAdmissionConfigMutation,
} from "../api/programAdmissionConfigApi";
import {
  initialProgramAdmissionConfigFormState,
  programAdmissionConfigFormReducer,
  ProgramAdmissionConfigFormActionType,
} from "../state/programAdmissionConfigFormState";
import type {
  ProgramAdmissionConfig,
  ProgramAdmissionConfigFormValues,
} from "../types/program-admission-config";
import { buildProgramAdmissionConfigPayload } from "../utils/buildProgramAdmissionConfigPayload";
import { extractConfiguredProgramIds } from "../utils/configuredProgramIds";
import {
  pickCanonicalEnglishSubjectId,
  pickCanonicalMathematicsSubjectId,
} from "../utils/detectCanonicalOlevelSubjects";
import {
  validateCutoffOrdering,
  validateQuotaTotals,
} from "../utils/validators";

type ProgramOption = {
  id: number;
  name: string;
  department?: { name: string } | null;
};

function formatProgramLabel(program: ProgramOption): string {
  return program.department?.name
    ? `${program.name} (${program.department.name})`
    : program.name;
}

function createDefaultFormValues(): ProgramAdmissionConfigFormValues {
  return {
    programId: undefined as unknown as number,
    totalCapacity: 100,
    meritPercentage: DEFAULT_QUOTA_PERCENTAGES.merit,
    catchmentPercentage: DEFAULT_QUOTA_PERCENTAGES.catchment,
    eldsPercentage: DEFAULT_QUOTA_PERCENTAGES.elds,
    meritCutoff: DEFAULT_CUTOFFS.merit,
    catchmentCutoff: DEFAULT_CUTOFFS.catchment,
    eldsCutoff: DEFAULT_CUTOFFS.elds,
    minimumJambScore: null,
    ...DEFAULT_OLEVEL_CREDIT_GATE,
    englishSubjectId: null,
    mathematicsSubjectId: null,
  };
}

function formValuesFromConfig(
  target: ProgramAdmissionConfig,
): ProgramAdmissionConfigFormValues {
  return {
    programId: target.programId,
    totalCapacity: target.totalCapacity,
    meritPercentage: target.meritPercentage,
    catchmentPercentage: target.catchmentPercentage,
    eldsPercentage: target.eldsPercentage,
    meritCutoff: Number(target.meritCutoff),
    catchmentCutoff: Number(target.catchmentCutoff),
    eldsCutoff: Number(target.eldsCutoff),
    minimumJambScore: target.minimumJambScore,
    minimumOlevelCredits: target.minimumOlevelCredits,
    maxOlevelSittings: target.maxOlevelSittings,
    requireOlevelEnglish: target.requireOlevelEnglish,
    requireOlevelMathematics: target.requireOlevelMathematics,
    englishSubjectId: target.englishSubjectId,
    mathematicsSubjectId: target.mathematicsSubjectId,
  };
}

export function useProgramAdmissionConfigFormModal(
  target: ProgramAdmissionConfig | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ProgramAdmissionConfigFormValues>();
  const [modalState, dispatch] = useReducer(
    programAdmissionConfigFormReducer,
    initialProgramAdmissionConfigFormState,
  );

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    {
      itemsPerPage: 100,
      sort: "name:asc",
      include: "department",
    },
    { skip: !open },
  );

  const { data: pickerData, isLoading: isConfigsLoading } =
    useGetProgramAdmissionConfigsQuery(
      {
        page: 1,
        itemsPerPage: PROGRAM_ADMISSION_CONFIG_PICKER_ITEMS_PER_PAGE,
        include: PROGRAM_ADMISSION_CONFIG_INCLUDE,
        sort: PROGRAM_ADMISSION_CONFIG_SORT,
      },
      { skip: !open },
    );

  const programs = programsData?.member ?? [];
  const configs = pickerData?.member ?? [];

  const [createConfig, { isLoading: isCreating }] =
    useCreateProgramAdmissionConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateProgramAdmissionConfigMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  const initializeForm = useCallback(
    (editTarget: ProgramAdmissionConfig | null) => {
      if (editTarget) {
        form.setFieldsValue(formValuesFromConfig(editTarget));
        return;
      }
      form.setFieldsValue(createDefaultFormValues());
    },
    [form],
  );

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: ProgramAdmissionConfigFormActionType.Reset });
  }, [form]);

  const totalSeatsUsed = useMemo(
    () =>
      (target?.meritSeatsUsed ?? 0) +
      (target?.catchmentSeatsUsed ?? 0) +
      (target?.eldsSeatsUsed ?? 0),
    [target],
  );

  const programLocked = isEditMode && totalSeatsUsed > 0;

  const programOptions = useMemo(() => {
    const existingProgramIds = extractConfiguredProgramIds(configs);
    const editProgramId = isEditMode ? target?.programId : undefined;

    return programs
      .filter((program) => {
        if (editProgramId !== undefined && editProgramId === program.id) return true;
        return !existingProgramIds.has(program.id);
      })
      .map((program) => ({
        value: program.id,
        label: formatProgramLabel(program),
      }));
  }, [programs, configs, isEditMode, target?.programId]);

  const programsLoading = isProgramsLoading || isConfigsLoading;
  const noProgramsAvailable =
    open && !isEditMode && !programsLoading && programOptions.length === 0;

  const applyFederalPreset = useCallback(() => {
    form.setFieldsValue({
      meritPercentage: DEFAULT_QUOTA_PERCENTAGES.merit,
      catchmentPercentage: DEFAULT_QUOTA_PERCENTAGES.catchment,
      eldsPercentage: DEFAULT_QUOTA_PERCENTAGES.elds,
    });
  }, [form]);

  const requireOlevelEnglish = Form.useWatch("requireOlevelEnglish", form);
  const requireOlevelMathematics = Form.useWatch("requireOlevelMathematics", form);
  const englishSubjectId = Form.useWatch("englishSubjectId", form);
  const mathematicsSubjectId = Form.useWatch("mathematicsSubjectId", form);

  const { data: englishPickData } = useGetOlevelSubjectsQuery(
    {
      itemsPerPage: OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE,
      sort: OLEVEL_SUBJECT_SORT_DEFAULT,
      "search[name]": "english",
    },
    {
      skip: !open || !requireOlevelEnglish || englishSubjectId != null,
    },
  );

  const { data: mathPickData } = useGetOlevelSubjectsQuery(
    {
      itemsPerPage: OLEVEL_SUBJECT_PICKER_ITEMS_PER_PAGE,
      sort: OLEVEL_SUBJECT_SORT_DEFAULT,
      "search[name]": "math",
    },
    {
      skip: !open || !requireOlevelMathematics || mathematicsSubjectId != null,
    },
  );

  useEffect(() => {
    if (!open || !requireOlevelEnglish || englishSubjectId != null) return;
    const picked = pickCanonicalEnglishSubjectId(englishPickData?.member ?? []);
    if (picked != null) {
      form.setFieldValue("englishSubjectId", picked);
    }
  }, [open, requireOlevelEnglish, englishSubjectId, englishPickData, form]);

  useEffect(() => {
    if (!open || !requireOlevelMathematics || mathematicsSubjectId != null) return;
    const picked = pickCanonicalMathematicsSubjectId(mathPickData?.member ?? []);
    if (picked != null) {
      form.setFieldValue("mathematicsSubjectId", picked);
    }
  }, [open, requireOlevelMathematics, mathematicsSubjectId, mathPickData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: ProgramAdmissionConfigFormActionType.SetFormError,
        message: null,
      });

      const quotaError = validateQuotaTotals(values);
      if (quotaError) {
        dispatch({
          type: ProgramAdmissionConfigFormActionType.SetFormError,
          message: quotaError,
        });
        return;
      }

      const cutoffError = validateCutoffOrdering(values);
      if (cutoffError) {
        dispatch({
          type: ProgramAdmissionConfigFormActionType.SetFormError,
          message: cutoffError,
        });
        return;
      }

      const payload = buildProgramAdmissionConfigPayload(values);

      if (isEditMode && target) {
        await updateConfig({ id: target.id, ...payload }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Admission cut-offs and quota", "updated"),
        );
      } else {
        await createConfig(payload).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Admission cut-offs and quota", "created"),
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
      formError: modalState.formError,
      isSubmitting,
      programLocked,
      totalSeatsUsed,
      programOptions,
      programsLoading,
      noProgramsAvailable,
    },
    actions: {
      handleSubmit,
      handleCancel,
      applyFederalPreset,
      initializeForm,
    },
    form,
  };
}

export function useDeleteProgramAdmissionConfigModal(
  target: ProgramAdmissionConfig | null,
  onClose: () => void,
) {
  const [deleteConfig, { isLoading: isDeleting }] =
    useDeleteProgramAdmissionConfigMutation();
  const handleApiError = useApiError();

  const totalSeatsUsed =
    (target?.meritSeatsUsed ?? 0) +
    (target?.catchmentSeatsUsed ?? 0) +
    (target?.eldsSeatsUsed ?? 0);
  const blockedByAllocations = totalSeatsUsed > 0;

  const handleConfirm = async () => {
    if (!target || blockedByAllocations) return;
    try {
      await deleteConfig(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Admission cut-offs and quota", "deleted"),
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
    state: { isDeleting, blockedByAllocations, totalSeatsUsed },
    actions: { handleConfirm, handleCancel },
  };
}
