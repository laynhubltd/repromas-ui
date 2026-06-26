import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import { useGetMeAdmissionCandidateQuery } from "@/features/candidate-profile/api/candidateProfileApi";
import { isFormVersionMismatch } from "@/features/dynamic-form/utils/isFormVersionMismatch";
import type { RenderSection } from "@/features/dynamic-form/types";
import { mapViolationToFieldErrors } from "@/features/dynamic-form/utils/mapViolationToFieldErrors";
import { sortSectionsByStepOrder } from "@/features/dynamic-form/utils/sortSectionsByStepOrder";
import {
  isStateGeographyFieldKey,
  lgaFieldKeysInSection,
} from "@/features/dynamic-form/utils/geographyFieldKeys";
import { validateSanitizedSectionPayload } from "@/features/dynamic-form/utils/validateJsonSchema";
import {
  sanitizeSectionDataForSchemaValidation,
  validateDynamicFormSection,
} from "@/features/dynamic-form/utils/validateSectionFields";
import {
  buildFullSubmitPayload,
  sectionValuesToSubmitPayload,
} from "@/features/dynamic-form/utils/widgetPayloadMappers";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetOlevelSubjectsQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { useDynamicFormLayout } from "@/features/dynamic-form/hooks/useDynamicFormLayout";
import { useGeographyFieldOptions } from "@/features/dynamic-form/hooks/useGeographyFieldOptions";
import {
  DYNAMIC_FORM_NO_ASSIGNMENT_MESSAGE,
  DYNAMIC_FORM_SUBMIT_SUCCESS,
  DYNAMIC_FORM_VERSION_MISMATCH_MESSAGE,
} from "@/shared/constants/dynamicFormOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { buildStudentApplyReturnTo } from "@/shared/utils/validateReturnUrl";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { appPaths } from "@/app/routing/app-path";
import {
  useCreateSubmissionMutation,
  useGetRenderPackageQuery,
  usePatchSubmissionMutation,
  useSubmitSubmissionMutation,
} from "../api/dynamicFormRuntimeApi";
import {
  clearSubmissionId,
  readLegacySessionStorageSubmissionId,
  selectSubmissionIdForCycle,
  setSubmissionId,
} from "../state/admissionApplicationSessionSlice";
import {
  AdmissionWizardActionType,
  admissionWizardReducer,
  initialAdmissionWizardState,
  isSectionDirty,
} from "../state/admissionWizardState";

export function useAdmissionApplicationWizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduxDispatch = useAppDispatch();
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const handleApiError = useApiError();
  const legacyMigrationAttemptedRef = useRef<number | null>(null);
  const packageHydratedRef = useRef(false);
  const stepRestoredRef = useRef(false);
  const [isPersistingBeforePay, setIsPersistingBeforePay] = useState(false);

  const [wizardState, dispatch] = useReducer(
    admissionWizardReducer,
    initialAdmissionWizardState,
  );

  const {
    data: candidate,
    isLoading: isCandidateLoading,
  } = useGetMeAdmissionCandidateQuery(undefined, { skip: !isCandidate });

  const cycleId = candidate?.cycleId ?? null;
  const storedSubmissionId = useAppSelector((state) =>
    selectSubmissionIdForCycle(state, cycleId),
  );

  useEffect(() => {
    if (cycleId == null) return;
    if (storedSubmissionId != null) return;
    if (legacyMigrationAttemptedRef.current === cycleId) return;

    legacyMigrationAttemptedRef.current = cycleId;
    const legacyId = readLegacySessionStorageSubmissionId(cycleId);
    if (legacyId != null) {
      reduxDispatch(setSubmissionId({ cycleId, submissionId: legacyId }));
    }
  }, [cycleId, storedSubmissionId, reduxDispatch]);

  const {
    data: renderPackage,
    isLoading: isPackageLoading,
    isFetching: isPackageRefetching,
    isError: isPackageError,
    error: packageError,
    refetch: refetchPackage,
  } = useGetRenderPackageQuery(
    {
      purpose: "ADMISSION_APPLICATION",
      assignmentScope: "ADMISSION_CYCLE",
      assignmentReferenceId: cycleId ?? undefined,
      submissionId: storedSubmissionId ?? undefined,
    },
    { skip: !isCandidate || !cycleId },
  );

  const { data: programsData } = useGetProgramsQuery(
    { itemsPerPage: 200, sort: "name:asc" },
    { skip: !isCandidate },
  );

  const programOptions = useMemo(
    () =>
      (programsData?.member ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [programsData],
  );

  const { data: subjectsData } = useGetOlevelSubjectsQuery(
    { itemsPerPage: 200, sort: "name:asc" },
    { skip: !isCandidate },
  );

  const subjectOptions = useMemo(
    () =>
      (subjectsData?.member ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [subjectsData],
  );

  const [createSubmission] = useCreateSubmissionMutation();
  const [patchSubmission, { isLoading: isPatching }] = usePatchSubmissionMutation();
  const [submitSubmission] = useSubmitSubmissionMutation();

  const sortedSections = useMemo(
    () => sortSectionsByStepOrder(renderPackage?.sections ?? []),
    [renderPackage?.sections],
  );

  useEffect(() => {
    packageHydratedRef.current = false;
    stepRestoredRef.current = false;
  }, [cycleId, storedSubmissionId]);

  useEffect(() => {
    if (!renderPackage || sortedSections.length === 0) return;

    const prefill = renderPackage.prefill ?? {};
    if (!packageHydratedRef.current) {
      packageHydratedRef.current = true;
      dispatch({
        type: AdmissionWizardActionType.Reset,
        sections: sortedSections,
        payload: {},
        prefill,
      });
      return;
    }

    dispatch({
      type: AdmissionWizardActionType.SyncRenderPackage,
      sections: sortedSections,
      payload: {},
      prefill,
    });
  }, [renderPackage, sortedSections]);

  useEffect(() => {
    if (wizardState.sortedSections.length === 0) return;

    const stepParam = searchParams.get("step");
    if (stepParam == null) return;

    const parsed = Number.parseInt(stepParam, 10);
    if (
      !Number.isFinite(parsed) ||
      parsed < 0 ||
      parsed >= wizardState.sortedSections.length
    ) {
      return;
    }

    if (!stepRestoredRef.current) {
      dispatch({
        type: AdmissionWizardActionType.SetCurrentStep,
        step: parsed,
      });
      stepRestoredRef.current = true;

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("step");
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    wizardState.sortedSections.length,
    searchParams,
    setSearchParams,
  ]);

  const currentSection = wizardState.sortedSections[wizardState.currentStep] ?? null;
  const currentValues = useMemo(
    () =>
      currentSection
        ? (wizardState.sectionValues[currentSection.id] ?? {})
        : {},
    [currentSection, wizardState.sectionValues],
  );

  const { stateOptions, lgaOptions, isLgasLoading } = useGeographyFieldOptions({
    sectionValues: currentValues,
    skip: !isCandidate,
  });

  const noAssignment = useMemo(() => {
    if (!isPackageError || !packageError) return false;
    const parsed = parseApiError(packageError);
    return parsed.status === 404;
  }, [isPackageError, packageError]);

  const ensureSubmission = useCallback(async (): Promise<number | null> => {
    if (storedSubmissionId != null) return storedSubmissionId;
    if (!cycleId) return null;
    try {
      const created = await createSubmission({
        purpose: "ADMISSION_APPLICATION",
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: cycleId,
        idempotencyKey: crypto.randomUUID(),
      }).unwrap();
      reduxDispatch(
        setSubmissionId({ cycleId, submissionId: created.id }),
      );
      return created.id;
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
      return null;
    }
  }, [storedSubmissionId, cycleId, createSubmission, reduxDispatch, handleApiError]);

  const saveCurrentSection = useCallback(
    async (values?: Record<string, unknown>): Promise<boolean> => {
      if (!currentSection || !renderPackage) return true;

      if (!isSectionDirty(wizardState, currentSection.id)) {
        return true;
      }

      const sectionValues = values ?? currentValues;
      const submissionId = await ensureSubmission();
      if (!submissionId) return false;

      try {
        await patchSubmission({
          id: submissionId,
          body: {
            payload: {
              [String(currentSection.id)]: sectionValuesToSubmitPayload(
                currentSection,
                sectionValues,
              ),
            },
          },
        }).unwrap();
        dispatch({
          type: AdmissionWizardActionType.SetLastSavedAt,
          at: new Date().toISOString(),
        });
        dispatch({
          type: AdmissionWizardActionType.MarkSectionClean,
          sectionId: currentSection.id,
        });
        return true;
      } catch (err: unknown) {
        const parsed = parseApiError(err);
        if (isFormVersionMismatch(parsed)) {
          dispatch({
            type: AdmissionWizardActionType.SetVersionMismatch,
            value: true,
          });
        } else {
          handleApiError(err, {
            context: { screen: RequestScreen.Action, method: "PATCH" },
          });
        }
        return false;
      }
    },
    [
      currentSection,
      currentValues,
      renderPackage,
      wizardState,
      ensureSubmission,
      patchSubmission,
      handleApiError,
    ],
  );

  const persistCurrentStepIfDirty = useCallback(async (): Promise<boolean> => {
    if (!currentSection) return true;
    if (!isSectionDirty(wizardState, currentSection.id)) return true;
    return saveCurrentSection();
  }, [currentSection, wizardState, saveCurrentSection]);

  const handleFieldChange = useCallback(
    (fieldKey: string, value: unknown) => {
      if (!currentSection) return;
      const isStateChange = isStateGeographyFieldKey(fieldKey);
      const nextValues = {
        ...currentValues,
        [fieldKey]: value,
      };
      if (isStateChange) {
        for (const lgaKey of lgaFieldKeysInSection(currentSection.fields)) {
          nextValues[lgaKey] = undefined;
        }
      }
      dispatch({
        type: AdmissionWizardActionType.SetSectionValues,
        sectionId: currentSection.id,
        values: nextValues,
      });
    },
    [currentSection, currentValues],
  );

  const validateSectionStep = useCallback(
    (
      section: RenderSection,
      values: Record<string, unknown>,
    ): Record<string, string> => {
      if (!renderPackage) return {};
      return validateDynamicFormSection(
        section,
        values,
        renderPackage.jsonSchema,
      );
    },
    [renderPackage],
  );

  const validateCurrentStep = useCallback((): boolean => {
    if (!currentSection || !renderPackage) return true;

    const errors = validateSectionStep(currentSection, currentValues);
    if (Object.keys(errors).length > 0) {
      dispatch({
        type: AdmissionWizardActionType.SetFieldErrors,
        errors,
      });
      return false;
    }

    dispatch({ type: AdmissionWizardActionType.SetFieldErrors, errors: {} });
    return true;
  }, [currentSection, currentValues, renderPackage, validateSectionStep]);

  const validateAllSections = useCallback((): boolean => {
    if (!renderPackage) return true;

    for (let step = 0; step < wizardState.sortedSections.length; step += 1) {
      const section = wizardState.sortedSections[step];
      const values = wizardState.sectionValues[section.id] ?? {};
      const errors = validateSectionStep(section, values);
      if (Object.keys(errors).length > 0) {
        dispatch({
          type: AdmissionWizardActionType.SetCurrentStep,
          step,
        });
        dispatch({
          type: AdmissionWizardActionType.SetFieldErrors,
          errors,
        });
        return false;
      }

      const sanitized = sanitizeSectionDataForSchemaValidation(section, values);
      const schemaResult = validateSanitizedSectionPayload(
        renderPackage.jsonSchema,
        section.id,
        sanitized,
      );
      if (!schemaResult.valid) {
        const schemaErrors: Record<string, string> = {};
        for (const err of schemaResult.errors) {
          const key = err.path.split(".").pop() ?? err.path;
          schemaErrors[key] = err.message;
        }
        dispatch({
          type: AdmissionWizardActionType.SetCurrentStep,
          step,
        });
        dispatch({
          type: AdmissionWizardActionType.SetFieldErrors,
          errors: schemaErrors,
        });
        return false;
      }
    }

    dispatch({ type: AdmissionWizardActionType.SetFieldErrors, errors: {} });
    return true;
  }, [
    renderPackage,
    wizardState.sortedSections,
    wizardState.sectionValues,
    validateSectionStep,
  ]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;
    const saved = await persistCurrentStepIfDirty();
    if (!saved) return;
    if (wizardState.currentStep < wizardState.sortedSections.length - 1) {
      dispatch({
        type: AdmissionWizardActionType.SetCurrentStep,
        step: wizardState.currentStep + 1,
      });
    }
  }, [
    validateCurrentStep,
    persistCurrentStepIfDirty,
    wizardState.currentStep,
    wizardState.sortedSections.length,
  ]);

  const handleBack = useCallback(() => {
    if (wizardState.currentStep > 0) {
      dispatch({
        type: AdmissionWizardActionType.SetCurrentStep,
        step: wizardState.currentStep - 1,
      });
    }
  }, [wizardState.currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateAllSections() || !renderPackage || cycleId == null) return;

    const saved = await persistCurrentStepIfDirty();
    if (!saved) return;

    const submissionId = await ensureSubmission();
    if (!submissionId) return;

    dispatch({ type: AdmissionWizardActionType.SetSubmitting, value: true });
    try {
      const fullPayload = buildFullSubmitPayload(
        wizardState.sortedSections,
        wizardState.sectionValues,
      );

      await submitSubmission({
        id: submissionId,
        idempotencyKey: crypto.randomUUID(),
        payload: { payload: fullPayload },
      }).unwrap();

      reduxDispatch(clearSubmissionId(cycleId));
      notifyMutationSuccess(DYNAMIC_FORM_SUBMIT_SUCCESS);
      navigate(`${appPaths.StudentApplicationAcknowledgement}?justSubmitted=1`);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (isFormVersionMismatch(parsed)) {
        dispatch({
          type: AdmissionWizardActionType.SetVersionMismatch,
          value: true,
        });
      } else if (parsed.status === 400 && "violations" in parsed.raw) {
        const violations = (
          parsed.raw as { violations: Array<{ propertyPath: string; message: string }> }
        ).violations;
        dispatch({
          type: AdmissionWizardActionType.SetFieldErrors,
          errors: mapViolationToFieldErrors(violations),
        });
      } else {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    } finally {
      dispatch({ type: AdmissionWizardActionType.SetSubmitting, value: false });
    }
  }, [
    validateAllSections,
    persistCurrentStepIfDirty,
    renderPackage,
    cycleId,
    ensureSubmission,
    wizardState.sortedSections,
    wizardState.sectionValues,
    submitSubmission,
    reduxDispatch,
    navigate,
    handleApiError,
  ]);

  const handleReloadPackage = useCallback(() => {
    dispatch({
      type: AdmissionWizardActionType.SetVersionMismatch,
      value: false,
    });
    refetchPackage();
  }, [refetchPackage]);

  const handleBillingPayNow = useCallback(
    async (payload: WorkflowPayNowPayload) => {
      if (isPersistingBeforePay) return;

      setIsPersistingBeforePay(true);
      try {
        const saved = await persistCurrentStepIfDirty();
        if (!saved) return;

        const params = new URLSearchParams({
          feeChargeId: String(payload.feeChargeId),
          returnTo: buildStudentApplyReturnTo(wizardState.currentStep),
        });
        navigate(`${appPaths.StudentInvoices}?${params.toString()}`);
      } finally {
        setIsPersistingBeforePay(false);
      }
    },
    [
      isPersistingBeforePay,
      persistCurrentStepIfDirty,
      wizardState.currentStep,
      navigate,
    ],
  );

  const isLastStep =
    wizardState.currentStep === wizardState.sortedSections.length - 1;
  const isLoading = isCandidateLoading || isPackageLoading;
  const layout = useDynamicFormLayout();

  return {
    state: {
      candidate,
      renderPackage,
      currentSection,
      currentValues,
      wizardState,
      programOptions,
      subjectOptions,
      stateOptions,
      lgaOptions,
      isLgasLoading,
      isLoading,
      isPatching,
      isPersistingBeforePay,
      isRefetchingOptions: isPackageRefetching,
      noAssignment,
      isLastStep,
      layout,
      versionMismatchMessage: DYNAMIC_FORM_VERSION_MISMATCH_MESSAGE,
      noAssignmentMessage: DYNAMIC_FORM_NO_ASSIGNMENT_MESSAGE,
    },
    actions: {
      handleFieldChange,
      handleNext,
      handleBack,
      handleSubmit,
      handleReloadPackage,
      handleBillingPayNow,
      saveCurrentSection,
    },
  };
}
