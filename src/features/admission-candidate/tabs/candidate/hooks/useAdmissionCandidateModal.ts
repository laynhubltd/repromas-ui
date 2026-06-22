import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import {
  useGetLgasByStateQuery,
  useGetStateWithLgasQuery,
  useGetStatesQuery,
} from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useGetOlevelSubjectsQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  ADMISSION_CANDIDATE_CREATE_UI_COPY,
  ADMISSION_CANDIDATE_DETAIL_INCLUDE,
  CYCLE_STATUS_LABELS,
  OFFER_DECISION_OPTIONS,
  SEAT_BUCKET_OPTIONS,
} from "@/shared/constants/admissionCandidateOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form, Modal, notification } from "antd";
import { useCallback, useMemo, useReducer } from "react";
import {
  useCreateAdmissionCandidateMutation,
  useGetAdmissionCandidateQuery,
  useMatriculateAdmissionCandidateMutation,
  useOfferAdmissionCandidateMutation,
  usePatchAdmissionCandidateMetadataMutation,
} from "../api/admissionCandidateApi";
import {
  AdmissionCandidateFormActionType,
  admissionCandidateFormReducer,
  initialAdmissionCandidateFormState,
} from "../state/admissionCandidateFormState";
import type {
  AdmissionCandidate,
  CandidateIntakeMode,
  CreateAdmissionCandidateResponse,
  OfferCandidateRequest,
  OfferDecision,
  SeatBucket,
} from "../types/admission-candidate";
import {
  buildCreateCandidatePayload,
  validateJambScorePairing,
  type CreateCandidateFormValues,
} from "../utils/buildCreateCandidatePayload";

function isAntdFormValidationError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "errorFields" in err &&
    Array.isArray((err as { errorFields: unknown }).errorFields)
  );
}

// ─── Create Candidate ─────────────────────────────────────────────────────────

type UseAdmissionCandidateFormModalOptions = {
  open: boolean;
  defaultCycleId: number | undefined;
  canIngest: boolean;
  onClose: () => void;
  onCreated?: (result: CreateAdmissionCandidateResponse) => void;
};

export function useAdmissionCandidateFormModal({
  open,
  defaultCycleId,
  canIngest,
  onClose,
  onCreated,
}: UseAdmissionCandidateFormModalOptions) {
  const [form] = Form.useForm<CreateCandidateFormValues>();
  const [modalState, dispatch] = useReducer(
    admissionCandidateFormReducer,
    initialAdmissionCandidateFormState,
  );
  const [createCandidate, { isLoading: isCreating }] =
    useCreateAdmissionCandidateMutation();
  const handleApiError = useApiError();

  const watchedCycleId = Form.useWatch("cycleId", form);
  const selectedStateId = modalState.selectedStateId;

  const { data: cyclesData } = useGetAdmissionCyclesQuery(
    { itemsPerPage: 100, sort: "createdAt:desc" },
    { skip: !open },
  );
  const { data: statesData } = useGetStatesQuery(
    { itemsPerPage: 200 },
    { skip: !open },
  );
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { itemsPerPage: 200, sort: "name:asc", include: "department" },
      { skip: !open },
    );
  const { data: subjectsData } = useGetOlevelSubjectsQuery(
    { itemsPerPage: 200, sort: "name:asc" },
    { skip: !open },
  );
  const { data: stateWithLgas, isFetching: isStateLgasLoading } =
    useGetStateWithLgasQuery(selectedStateId!, {
      skip: !open || selectedStateId == null,
    });

  const embeddedLgaCount = stateWithLgas?.lgas?.length ?? 0;
  const { data: lgasListData, isFetching: isListLgasLoading } =
    useGetLgasByStateQuery(
      { stateId: selectedStateId!, itemsPerPage: 200 },
      {
        skip:
          !open ||
          selectedStateId == null ||
          isStateLgasLoading ||
          embeddedLgaCount > 0,
      },
    );

  const cycles = cyclesData?.member ?? [];
  const states = statesData?.member ?? [];

  const lgas = useMemo(() => {
    const embedded = stateWithLgas?.lgas ?? [];
    if (embedded.length > 0) return embedded;
    return lgasListData?.member ?? [];
  }, [stateWithLgas?.lgas, lgasListData?.member]);

  const isLgasLoading =
    selectedStateId != null && (isStateLgasLoading || isListLgasLoading);

  const programOptions = useMemo(
    () =>
      (programsData?.member ?? []).map((program) => ({
        value: program.id,
        label: program.department?.name
          ? `${program.name} (${program.department.name})`
          : program.name,
      })),
    [programsData?.member],
  );

  const subjectOptions = useMemo(
    () =>
      (subjectsData?.member ?? []).map((subject) => ({
        value: subject.id,
        label: subject.name,
      })),
    [subjectsData?.member],
  );

  const selectedCycle = useMemo(
    () => cycles.find((c) => c.id === (watchedCycleId ?? defaultCycleId)),
    [cycles, watchedCycleId, defaultCycleId],
  );

  const cycleStatusLabel = selectedCycle?.status
    ? (CYCLE_STATUS_LABELS[selectedCycle.status] ??
      selectedCycle.status.replace(/_/g, " ").toLowerCase())
    : null;

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: AdmissionCandidateFormActionType.Reset });
  }, [form]);

  const initForm = useCallback(() => {
    form.setFieldsValue({
      cycleId: defaultCycleId,
      jambScores: [],
    });
    dispatch({ type: AdmissionCandidateFormActionType.Reset });
  }, [defaultCycleId, form]);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleIntakeModeChange = useCallback(
    (mode: CandidateIntakeMode) => {
      dispatch({
        type: AdmissionCandidateFormActionType.SetIntakeMode,
        mode,
      });
      if (mode === "manual") {
        form.setFieldsValue({ jambRegNo: undefined, jambScores: [] });
      }
    },
    [form],
  );

  const submitCreate = useCallback(async () => {
    const values = await form.validateFields();

    if (modalState.intakeMode === "jamb") {
      const pairingError = validateJambScorePairing(values.jambScores);
      if (pairingError) {
        notification.warning({ message: pairingError });
        return;
      }
    }

    const payload = buildCreateCandidatePayload(values, modalState.intakeMode);
    const result = await createCandidate(payload).unwrap();

    const hasWarnings = (result.warnings?.length ?? 0) > 0;
    notifyMutationSuccess(
      hasWarnings
        ? ADMISSION_CANDIDATE_CREATE_UI_COPY.successWithWarnings
        : mutationSuccessMessage("Candidate", "created"),
    );

    dispatch({
      type: AdmissionCandidateFormActionType.SetCreateResult,
      result,
    });
    dispatch({
      type: AdmissionCandidateFormActionType.SetStep,
      step: "result",
    });
  }, [createCandidate, form, modalState.intakeMode]);

  const runSubmit = useCallback(async () => {
    try {
      await submitCreate();
    } catch (err: unknown) {
      if (isAntdFormValidationError(err)) return;
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  }, [submitCreate, handleApiError, form]);

  const handleSubmit = async () => {
    if (!canIngest) {
      notification.warning({
        message: ADMISSION_CANDIDATE_CREATE_UI_COPY.intakeClosedBanner,
      });
      return;
    }
    if (modalState.intakeMode === "manual") {
      Modal.confirm({
        title: ADMISSION_CANDIDATE_CREATE_UI_COPY.manualConfirmTitle,
        content: ADMISSION_CANDIDATE_CREATE_UI_COPY.manualConfirmBody,
        okText: ADMISSION_CANDIDATE_CREATE_UI_COPY.manualConfirmOk,
        onOk: runSubmit,
      });
      return;
    }
    await runSubmit();
  };

  const resolveProgramLabel = useCallback(
    (programId: number | undefined) => {
      if (programId == null) return "—";
      return (
        programOptions.find((o) => o.value === programId)?.label ??
        `Program #${programId}`
      );
    },
    [programOptions],
  );

  const handleViewCandidate = useCallback(() => {
    const result = modalState.createResult;
    if (!result) return;
    onCreated?.(result);
    reset();
    onClose();
  }, [modalState.createResult, onCreated, onClose, reset]);

  const handleDone = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleStateChange = useCallback(
    (stateId: number | undefined) => {
      dispatch({
        type: AdmissionCandidateFormActionType.SetSelectedStateId,
        stateId: stateId ?? null,
      });
      form.setFieldValue("lgaId", undefined);
    },
    [form],
  );

  return {
    state: {
      step: modalState.step,
      intakeMode: modalState.intakeMode,
      createResult: modalState.createResult,
      isLoading: isCreating,
      cycles,
      states,
      lgas,
      isLgasLoading,
      selectedStateId,
      programOptions,
      isProgramsLoading,
      subjectOptions,
      canIngest,
      selectedCycle,
      cycleStatusLabel,
    },
    actions: {
      handleSubmit,
      handleCancel,
      initForm,
      handleIntakeModeChange,
      handleViewCandidate,
      handleDone,
      handleStateChange,
      resolveProgramLabel,
    },
    flags: {
      isJambMode: modalState.intakeMode === "jamb",
      isManualMode: modalState.intakeMode === "manual",
      hasWarnings: (modalState.createResult?.warnings?.length ?? 0) > 0,
      showBillingHint: modalState.createResult?.application != null,
      isResultStep: modalState.step === "result",
    },
    form,
  };
}

// ─── Metadata Patch ───────────────────────────────────────────────────────────

type MetadataFormValues = {
  metadataJson: string;
};

export function useAdmissionCandidateMetadataModal(
  candidateId: number | null,
  open: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<MetadataFormValues>();
  const [patchMetadata, { isLoading }] =
    usePatchAdmissionCandidateMetadataMutation();
  const handleApiError = useApiError();

  const { data: candidate } = useGetAdmissionCandidateQuery(
    { id: candidateId!, include: ADMISSION_CANDIDATE_DETAIL_INCLUDE },
    { skip: candidateId === null || !open },
  );

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const initForm = useCallback(() => {
    if (open && candidate) {
      form.setFieldsValue({
        metadataJson: candidate.metadata
          ? JSON.stringify(candidate.metadata, null, 2)
          : "",
      });
    }
  }, [open, candidate, form]);

  const handleSubmit = async () => {
    if (candidateId === null) return;
    try {
      const values = await form.validateFields();
      const metadata =
        values.metadataJson.trim() === ""
          ? null
          : (JSON.parse(values.metadataJson) as Record<string, unknown>);

      await patchMetadata({ id: candidateId, metadata }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Metadata", "updated"));
      reset();
      onClose();
    } catch (err: unknown) {
      if (isAntdFormValidationError(err)) return;
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PATCH" },
        form,
      });
    }
  };

  return {
    state: { isLoading, candidate },
    actions: { handleSubmit, handleCancel, initForm },
    form,
  };
}

// ─── Offer ────────────────────────────────────────────────────────────────────

type OfferFormValues = {
  finalDecision: OfferDecision;
  offeredProgramId?: number;
  seatBucket?: SeatBucket;
  overrideReason: string;
};

export function useOfferAdmissionCandidateModal(
  candidate: AdmissionCandidate | null,
  open: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<OfferFormValues>();
  const [offerCandidate, { isLoading }] = useOfferAdmissionCandidateMutation();
  const handleApiError = useApiError();

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { itemsPerPage: 200, sort: "name:asc", include: "department" },
      { skip: !open },
    );

  const programOptions = useMemo(
    () =>
      (programsData?.member ?? []).map((program) => ({
        value: program.id,
        label: program.department?.name
          ? `${program.name} (${program.department.name})`
          : program.name,
      })),
    [programsData?.member],
  );

  const finalDecision = Form.useWatch("finalDecision", form);
  const isChangeOfCourse = finalDecision === "OFFER_CHANGE_OF_COURSE";

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const initForm = useCallback(() => {
    form.setFieldsValue({
      finalDecision: undefined,
      offeredProgramId: undefined,
      seatBucket: undefined,
      overrideReason: "",
    });
  }, [form]);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const buildOfferBody = (values: OfferFormValues): OfferCandidateRequest => ({
    finalDecision: values.finalDecision,
    offeredProgramId:
      values.finalDecision === "OFFER_CHANGE_OF_COURSE"
        ? (values.offeredProgramId ?? null)
        : null,
    seatBucket:
      values.finalDecision === "OFFER_CHANGE_OF_COURSE"
        ? (values.seatBucket ?? null)
        : null,
    decisionSource: "MANUAL_OVERRIDE",
    overrideReason: values.overrideReason.trim() || null,
  });

  const handleConfirm = async () => {
    if (!candidate) return;
    try {
      const values = await form.validateFields();
      const body = buildOfferBody(values);
      await offerCandidate({ id: candidate.id, body }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Offer", "created"));
      reset();
      onClose();
    } catch (err: unknown) {
      if (isAntdFormValidationError(err)) return;
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  return {
    state: {
      isLoading,
      candidate,
      isProgramsLoading,
      programOptions,
      isChangeOfCourse,
      decisionOptions: OFFER_DECISION_OPTIONS,
      seatBucketOptions: SEAT_BUCKET_OPTIONS,
    },
    actions: { handleConfirm, handleCancel, initForm },
    form,
  };
}

// ─── Matriculate ──────────────────────────────────────────────────────────────

export function useMatriculateAdmissionCandidateModal(
  candidate: AdmissionCandidate | null,
  _open: boolean,
  onClose: () => void,
) {
  const [matriculateCandidate, { isLoading }] =
    useMatriculateAdmissionCandidateMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!candidate) return;
    try {
      await matriculateCandidate({ id: candidate.id }).unwrap();
      notifyMutationSuccess("Candidate matriculated successfully.");
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  return {
    state: { isLoading, candidate },
    actions: { handleConfirm, handleCancel: onClose },
  };
}
