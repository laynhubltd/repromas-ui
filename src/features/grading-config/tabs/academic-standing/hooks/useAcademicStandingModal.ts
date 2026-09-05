import { useGetTransitionStatusesQuery } from "@/features/settings/tabs/student-transition-status/api/studentTransitionStatusApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useEffect, useReducer } from "react";
import {
  useCreateAcademicStandingMutation,
  useUpdateAcademicStandingMutation,
} from "../api/academicStandingApi";
import {
  AcademicStandingFormActionType,
  academicStandingFormReducer,
  initialAcademicStandingFormState,
} from "../state/academicStandingFormState";
import type {
  AcademicStanding,
  AcademicStandingScope,
  EvaluationPeriod,
} from "../types/academic-standing";

export interface AcademicStandingFormValues {
  name: string;
  maxCgpa: number;
  scope: AcademicStandingScope;
  referenceId?: number | null;
  levelId?: number | null;
  curriculumVersionId?: number | null;
  evaluationPeriod: EvaluationPeriod;
  resetOnRecovery: boolean;
  maxProbationsPerCareer?: number | null;
  lapsedRegistrationStatusId?: number | null;
}

export function useAcademicStandingModal(
  target: AcademicStanding | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<AcademicStandingFormValues>();
  const [formState, dispatch] = useReducer(
    academicStandingFormReducer,
    initialAcademicStandingFormState,
  );

  const [createStanding, { isLoading: isCreating }] = useCreateAcademicStandingMutation();
  const [updateStanding, { isLoading: isUpdating }] = useUpdateAcademicStandingMutation();
  const handleApiError = useApiError();

  const isLoading = isCreating || isUpdating;

  // Dropdown reference queries
  const { data: facultiesData, isLoading: facultiesLoading } = useGetFacultiesQuery(
    { itemsPerPage: 100 },
    { skip: !open || formState.scope !== "FACULTY" },
  );

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery(
    { itemsPerPage: 100 },
    { skip: !open || formState.scope !== "DEPARTMENT" },
  );

  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery(
    { itemsPerPage: 100 },
    { skip: !open || formState.scope !== "PROGRAM" },
  );

  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery(
    { itemsPerPage: 100, sort: "rankOrder:asc" },
    { skip: !open },
  );

  const { data: curriculumData, isLoading: curriculumLoading } = useGetCurriculumVersionsQuery(
    { itemsPerPage: 100 },
    { skip: !open },
  );

  const { data: transitionStatusesData, isLoading: statusesLoading } = useGetTransitionStatusesQuery(
    { itemsPerPage: 100, "boolean[isTerminal]": false },
    { skip: !open },
  );

  const nonTerminalStatuses = (transitionStatusesData?.member ?? []).filter(
    (s) => !s.isTerminal && s.managedBy !== "ADMIN",
  );

  useEffect(() => {
    if (open) {
      if (target) {
        form.setFieldsValue({
          name: target.name,
          maxCgpa: Number(target.maxCgpa),
          scope: target.scope,
          referenceId: target.referenceId,
          levelId: target.levelId,
          curriculumVersionId: target.curriculumVersionId,
          evaluationPeriod: target.evaluationPeriod,
          resetOnRecovery: target.resetOnRecovery,
          maxProbationsPerCareer: target.maxProbationsPerCareer,
          lapsedRegistrationStatusId: target.lapsedRegistrationStatusId ?? null,
        });
        dispatch({
          type: AcademicStandingFormActionType.SetScope,
          scope: target.scope,
        });
        dispatch({
          type: AcademicStandingFormActionType.SetReferenceId,
          referenceId: target.referenceId,
        });
        dispatch({
          type: AcademicStandingFormActionType.SetEvaluationPeriod,
          period: target.evaluationPeriod,
        });
        dispatch({
          type: AcademicStandingFormActionType.SetResetOnRecovery,
          value: target.resetOnRecovery,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          maxCgpa: 5.0,
          scope: "GLOBAL",
          evaluationPeriod: "EACH_SEMESTER",
          resetOnRecovery: true,
        });
        dispatch({ type: AcademicStandingFormActionType.Reset });
      }
    }
  }, [open, target, form]);

  const handleScopeChange = (scope: AcademicStandingScope) => {
    form.setFieldsValue({ referenceId: null });
    dispatch({ type: AcademicStandingFormActionType.SetScope, scope });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && target) {
        await updateStanding({
          id: target.id,
          name: values.name.trim(),
          maxCgpa: values.maxCgpa,
          levelId: values.levelId ?? null,
          curriculumVersionId: values.curriculumVersionId ?? null,
          evaluationPeriod: values.evaluationPeriod,
          resetOnRecovery: values.resetOnRecovery,
          maxProbationsPerCareer: values.maxProbationsPerCareer ?? null,
          lapsedRegistrationStatusId: values.lapsedRegistrationStatusId ?? null,
        }).unwrap();
      } else {
        await createStanding({
          name: values.name.trim(),
          maxCgpa: values.maxCgpa,
          scope: values.scope,
          referenceId: values.scope === "GLOBAL" ? null : (values.referenceId ?? null),
          levelId: values.levelId ?? null,
          curriculumVersionId: values.curriculumVersionId ?? null,
          evaluationPeriod: values.evaluationPeriod,
          resetOnRecovery: values.resetOnRecovery,
          maxProbationsPerCareer: values.maxProbationsPerCareer ?? null,
          lapsedRegistrationStatusId: values.lapsedRegistrationStatusId ?? null,
        }).unwrap();
      }

      notifyMutationSuccess(
        mutationSuccessMessage("Academic Standing policy", isEditMode ? "updated" : "created"),
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
    dispatch({ type: AcademicStandingFormActionType.Reset });
    onClose();
  };

  return {
    state: {
      isLoading,
      isEditMode,
      formState,
      faculties: facultiesData?.member ?? [],
      departments: departmentsData?.member ?? [],
      programs: programsData?.member ?? [],
      levels: levelsData?.member ?? [],
      curriculumVersions: curriculumData?.member ?? [],
      nonTerminalStatuses,
      isDataLoading:
        facultiesLoading ||
        departmentsLoading ||
        programsLoading ||
        levelsLoading ||
        curriculumLoading ||
        statusesLoading,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleScopeChange,
    },
    form,
  };
}
