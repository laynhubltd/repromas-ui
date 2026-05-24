// Feature: auth/candidate-signup
import { useGetStatesQuery } from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { validators } from "@/shared/utils/validators";
import { Form, notification } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCandidateLookupMutation,
  useCandidateSignupMutation,
  useGetAdmissionSignupConfigQuery,
  useGetLgasByStateQuery,
} from "../api/candidateSignupApi";
import {
  CandidateSignupActionType,
  candidateSignupReducer,
  initialCandidateSignupState,
} from "../state/candidateSignupState";
import type { AdmissionSignupConfig } from "../types/candidate-signup";

type JambLookupFormValues = { jambRegNo: string };

type JambSignupFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
};

type OpenSignupFormValues = {
  firstName: string;
  lastName: string;
  stateId: number;
  gender: string;
  lgaId: number;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  dateOfBirth: Dayjs;
};

function formatCycleDates(config: AdmissionSignupConfig): string | null {
  if (!config.startDate && !config.endDate) return null;
  const start = config.startDate
    ? dayjs(config.startDate).format("MMM D, YYYY")
    : null;
  const end = config.endDate ? dayjs(config.endDate).format("MMM D, YYYY") : null;
  if (start && end) return `Applications open ${start} – ${end}`;
  if (end) return `Applications open until ${end}`;
  if (start) return `Applications open from ${start}`;
  return null;
}

export function useCandidateSignUpPage() {
  const [pageState, dispatch] = useReducer(
    candidateSignupReducer,
    initialCandidateSignupState,
  );
  const [openStateId, setOpenStateId] = useState<number | undefined>();

  const [jambLookupForm] = Form.useForm<JambLookupFormValues>();
  const [jambSignupForm] = Form.useForm<JambSignupFormValues>();
  const [openSignupForm] = Form.useForm<OpenSignupFormValues>();

  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
    refetch: refetchConfig,
  } = useGetAdmissionSignupConfigQuery();

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery({
    itemsPerPage: 200,
  });

  const { data: lgasData, isLoading: isLgasLoading } = useGetLgasByStateQuery(
    { stateId: openStateId! },
    { skip: openStateId === undefined },
  );

  const [candidateLookup, { isLoading: isLookupLoading }] =
    useCandidateLookupMutation();
  const [candidateSignup, { isLoading: isSignupLoading }] =
    useCandidateSignupMutation();

  const applyConfigStep = useCallback(
    (cfg: AdmissionSignupConfig) => {
      if (cfg.status !== "APPLICATION_OPEN") {
        dispatch({
          type: CandidateSignupActionType.SetBlockedReason,
          reason: "wrong_status",
        });
        return;
      }
      if (cfg.admissionIdentityMode === "OPEN") {
        dispatch({
          type: CandidateSignupActionType.SetStep,
          step: "open_form",
        });
      } else {
        dispatch({
          type: CandidateSignupActionType.SetStep,
          step: "jamb_lookup",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (isConfigLoading) {
      dispatch({
        type: CandidateSignupActionType.SetStep,
        step: "bootstrap",
      });
      return;
    }

    if (config) {
      applyConfigStep(config);
      return;
    }

    if (isConfigError && configError && "status" in configError) {
      const status = configError.status as number;
      if (status === 404) {
        dispatch({
          type: CandidateSignupActionType.SetBlockedReason,
          reason: "not_open",
        });
        return;
      }
      if (status === 409) {
        dispatch({
          type: CandidateSignupActionType.SetBlockedReason,
          reason: "ambiguous",
        });
        return;
      }
    }

    if (isConfigError) {
      const parsed = parseApiError(configError);
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: parsed.message,
      });
    }
  }, [isConfigLoading, config, isConfigError, configError, applyConfigStep]);

  const handleJambLookup = async () => {
    try {
      const values = await jambLookupForm.validateFields();
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: null,
      });
      const result = await candidateLookup({
        jambRegNo: values.jambRegNo.trim(),
      }).unwrap();
      dispatch({
        type: CandidateSignupActionType.SetJambRegNo,
        value: values.jambRegNo.trim(),
      });
      dispatch({
        type: CandidateSignupActionType.SetLookupResult,
        result,
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: parsed.message,
      });
      notification.error({ message: parsed.message });
    }
  };

  const handleJambSignup = async () => {
    if (!pageState.lookupResult) return;

    try {
      const values = await jambSignupForm.validateFields();
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: null,
      });

      await candidateSignup({
        email: values.email.trim(),
        password: values.password,
        jambRegNo: pageState.jambRegNo,
        verificationToken: pageState.lookupResult.verificationToken,
        phone: values.phone?.trim() || undefined,
      }).unwrap();

      notification.success({
        message: "Registration successful",
        description: "Welcome! You are now signed in.",
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: parsed.message,
      });
      notification.error({ message: parsed.message });
    }
  };

  const handleOpenSignup = async () => {
    try {
      const values = await openSignupForm.validateFields();
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: null,
      });

      await candidateSignup({
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        stateId: values.stateId,
        gender: values.gender,
        lgaId: values.lgaId,
        phone: values.phone?.trim() || undefined,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
      }).unwrap();

      notification.success({
        message: "Registration successful",
        description: "Welcome! You are now signed in.",
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: parsed.message,
      });
      notification.error({ message: parsed.message });
    }
  };

  const handleOpenStateChange = (stateId: number | undefined) => {
    setOpenStateId(stateId);
    openSignupForm.setFieldValue("lgaId", undefined);
  };

  return {
    state: {
      config,
      cycleDateLabel: config ? formatCycleDates(config) : null,
      step: pageState.step,
      blockedReason: pageState.blockedReason,
      formError: pageState.formError,
      lookupResult: pageState.lookupResult,
      jambRegNo: pageState.jambRegNo,
      states: statesData?.member ?? [],
      lgas: lgasData?.member ?? [],
      isConfigLoading,
      isStatesLoading,
      isLgasLoading,
      isLookupLoading,
      isSignupLoading,
      openStateId,
    },
    actions: {
      handleJambLookup,
      handleJambSignup,
      handleOpenSignup,
      handleOpenStateChange,
      refetchConfig,
      backToJambLookup: () => {
        dispatch({
          type: CandidateSignupActionType.SetStep,
          step: "jamb_lookup",
        });
        dispatch({
          type: CandidateSignupActionType.SetFormError,
          message: null,
        });
      },
    },
    flags: {
      isJambMode: config?.admissionIdentityMode === "JAMB",
      isOpenMode: config?.admissionIdentityMode === "OPEN",
      isBlocked: pageState.step === "blocked",
      isBootstrap: pageState.step === "bootstrap",
    },
    forms: {
      jambLookupForm,
      jambSignupForm,
      openSignupForm,
    },
    validators: {
      emailRules: [
        { required: true, message: "Email is required" },
        {
          validator: (_: unknown, value: string) =>
            !value || validators.email(value)
              ? Promise.resolve()
              : Promise.reject(new Error("Enter a valid email address")),
        },
      ],
      passwordRules: [
        { required: true, message: "Password is required" },
        {
          validator: (_: unknown, value: string) =>
            !value || validators.password(value)
              ? Promise.resolve()
              : Promise.reject(
                  new Error("Password must be at least 8 characters"),
                ),
        },
      ],
    },
  };
}
