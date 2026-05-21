import { useGetStatesQuery } from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import type { Dayjs } from "dayjs";
import { useCallback, useReducer } from "react";
import {
  useCreateAdmissionCandidateMutation,
  useGetAdmissionCandidateQuery,
  useMatriculateAdmissionCandidateMutation,
  useOfferAdmissionCandidateMutation,
  usePatchAdmissionCandidateMetadataMutation,
} from "../api/admissionCandidateApi";
import {
  admissionCandidateFormReducer,
  AdmissionCandidateFormActionType,
  initialAdmissionCandidateFormState,
} from "../state/admissionCandidateFormState";
import type { AdmissionCandidate } from "../types/admission-candidate";
import { ADMISSION_CANDIDATE_DETAIL_INCLUDE } from "@/shared/constants/admissionCandidateOptions";

// ─── Create Candidate ─────────────────────────────────────────────────────────

type CreateFormValues = {
  cycleId: number;
  jambRegNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Dayjs | null;
  gender?: string;
  stateId: number;
  lgaId?: number;
  email?: string;
  phone?: string;
  metadataJson?: string;
};

export function useAdmissionCandidateFormModal(
  open: boolean,
  defaultCycleId: number | undefined,
  canIngest: boolean,
  onClose: () => void,
) {
  const [form] = Form.useForm<CreateFormValues>();
  const [formState, dispatch] = useReducer(
    admissionCandidateFormReducer,
    initialAdmissionCandidateFormState,
  );
  const [createCandidate, { isLoading: isCreating }] =
    useCreateAdmissionCandidateMutation();

  const { data: cyclesData } = useGetAdmissionCyclesQuery({
    itemsPerPage: 100,
    sort: "createdAt:desc",
  });
  const { data: statesData } = useGetStatesQuery({ itemsPerPage: 200 });

  const cycles = cyclesData?.member ?? [];
  const states = statesData?.member ?? [];

  const reset = useCallback(() => {
    dispatch({ type: AdmissionCandidateFormActionType.Reset });
    form.resetFields();
  }, [form]);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = async () => {
    if (!canIngest) {
      notification.warning({
        message:
          "Candidate ingestion is only allowed when the cycle is in Pre-processing or Application Open.",
      });
      return;
    }
    try {
      const values = await form.validateFields();
      dispatch({
        type: AdmissionCandidateFormActionType.SetFormError,
        message: null,
      });

      let metadata: Record<string, unknown> | null = null;
      if (values.metadataJson?.trim()) {
        metadata = JSON.parse(values.metadataJson) as Record<string, unknown>;
      }

      const dateOfBirth = values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : null;

      await createCandidate({
        cycleId: values.cycleId,
        jambRegNo: values.jambRegNo.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dateOfBirth,
        gender: values.gender ?? null,
        stateId: values.stateId,
        lgaId: values.lgaId ?? null,
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        metadata,
      }).unwrap();

      notification.success({ message: "Candidate created successfully" });
      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: AdmissionCandidateFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  const initForm = useCallback(() => {
    if (open) {
      form.setFieldsValue({
        cycleId: defaultCycleId,
      });
    }
  }, [open, defaultCycleId, form]);

  return {
    state: {
      formError: formState.formError,
      isLoading: isCreating,
      cycles,
      states,
      canIngest,
    },
    actions: { handleSubmit, handleCancel, initForm },
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
  const [formState, dispatch] = useReducer(
    admissionCandidateFormReducer,
    initialAdmissionCandidateFormState,
  );
  const [patchMetadata, { isLoading }] =
    usePatchAdmissionCandidateMetadataMutation();

  const { data: candidate } = useGetAdmissionCandidateQuery(
    { id: candidateId!, include: ADMISSION_CANDIDATE_DETAIL_INCLUDE },
    { skip: candidateId === null || !open },
  );

  const reset = useCallback(() => {
    dispatch({ type: AdmissionCandidateFormActionType.Reset });
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
      dispatch({
        type: AdmissionCandidateFormActionType.SetFormError,
        message: null,
      });

      const metadata =
        values.metadataJson.trim() === ""
          ? null
          : (JSON.parse(values.metadataJson) as Record<string, unknown>);

      await patchMetadata({ id: candidateId, metadata }).unwrap();
      notification.success({ message: "Metadata updated successfully" });
      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: AdmissionCandidateFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  return {
    state: {
      formError: formState.formError,
      isLoading,
      candidate,
    },
    actions: { handleSubmit, handleCancel, initForm },
    form,
  };
}

// ─── Offer ────────────────────────────────────────────────────────────────────

export function useOfferAdmissionCandidateModal(
  candidate: AdmissionCandidate | null,
  _open: boolean,
  onClose: () => void,
) {
  const [offerCandidate, { isLoading }] = useOfferAdmissionCandidateMutation();
  const [error, setError] = useReducer(
    (_: string | null, msg: string | null) => msg,
    null,
  );

  const handleConfirm = async () => {
    if (!candidate) return;
    setError(null);
    try {
      await offerCandidate({ id: candidate.id }).unwrap();
      notification.success({ message: "Offer processed successfully" });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  return {
    state: { isLoading, error, candidate },
    actions: { handleConfirm, handleCancel: onClose },
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
  const [error, setError] = useReducer(
    (_: string | null, msg: string | null) => msg,
    null,
  );

  const handleConfirm = async () => {
    if (!candidate) return;
    setError(null);
    try {
      await matriculateCandidate({ id: candidate.id }).unwrap();
      notification.success({ message: "Candidate matriculated successfully" });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  return {
    state: { isLoading, error, candidate },
    actions: { handleConfirm, handleCancel: onClose },
  };
}
