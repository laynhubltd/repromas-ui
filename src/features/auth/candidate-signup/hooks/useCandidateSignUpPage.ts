// Feature: auth/candidate-signup
import {
  useGetLgasByStateQuery,
  useGetStateWithLgasQuery,
  useGetStatesQuery,
} from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form } from "antd";
import { formatAdmissionCycleDates } from "../utils/formatAdmissionCycleDates";
import type { Dayjs } from "dayjs";
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useCandidateLookupMutation,
  useCandidateSignupMutation,
  useGetAdmissionSignupConfigQuery,
} from "../api/candidateSignupApi";
import {
  CandidateSignupActionType,
  candidateSignupReducer,
  initialCandidateSignupState,
  type CandidateSignupBlockedReason,
  type CandidateSignupStep,
} from "../state/candidateSignupState";
import type { AdmissionSignupConfig } from "../types/candidate-signup";
import {
  buildLaneSelectors,
  parseLaneParamsFromSearch,
  withLaneSelectors,
} from "../utils/candidateSignupPayload";

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

function deriveBlockedReason(
  isConfigLoading: boolean,
  isConfigError: boolean,
  configError: unknown,
  config: AdmissionSignupConfig | undefined,
): CandidateSignupBlockedReason | null {
  if (isConfigLoading) return null;

  if (isConfigError && configError) {
    const parsed = parseApiError(configError);
    if (parsed.status === 404) return "not_open";
    if (parsed.status === 409) return "ambiguous";
  }

  if (config && config.status !== "APPLICATION_OPEN") {
    return "wrong_status";
  }

  return null;
}

function resolveEffectiveStep(
  pageStep: CandidateSignupStep,
  blockedReason: CandidateSignupBlockedReason | null,
  isConfigLoading: boolean,
  config: AdmissionSignupConfig | undefined,
): CandidateSignupStep {
  if (blockedReason) return "blocked";
  if (isConfigLoading || !config) return "bootstrap";
  if (pageStep === "jamb_details") return "jamb_details";
  if (config.admissionIdentityMode === "OPEN") return "open_form";
  return "jamb_lookup";
}

export function useCandidateSignUpPage() {
  const handleApiError = useApiError();
  const [searchParams] = useSearchParams();
  const laneParams = useMemo(
    () => parseLaneParamsFromSearch(searchParams),
    [searchParams],
  );

  const [pageState, dispatch] = useReducer(
    candidateSignupReducer,
    initialCandidateSignupState,
  );
  const [openStateId, setOpenStateId] = useState<number | undefined>();
  const appliedCycleIdRef = useRef<number | null>(null);

  const [jambLookupForm] = Form.useForm<JambLookupFormValues>();
  const [jambSignupForm] = Form.useForm<JambSignupFormValues>();
  const [openSignupForm] = Form.useForm<OpenSignupFormValues>();

  const {
    data: config,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError: isConfigError,
    error: configError,
    refetch: refetchConfig,
  } = useGetAdmissionSignupConfigQuery(laneParams);

  const blockedReason = useMemo(
    () =>
      deriveBlockedReason(
        isConfigLoading || isConfigFetching,
        isConfigError,
        configError,
        config,
      ),
    [isConfigLoading, isConfigFetching, isConfigError, configError, config],
  );

  const isOpenFormActive =
    config?.admissionIdentityMode === "OPEN" &&
    blockedReason === null &&
    !isConfigLoading &&
    !isConfigFetching;

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery(
    { itemsPerPage: 200, sort: "name:asc" },
    { skip: !isOpenFormActive },
  );

  const { data: stateWithLgas, isFetching: isStateLgasLoading } =
    useGetStateWithLgasQuery(openStateId!, {
      skip: !isOpenFormActive || openStateId == null,
    });

  const embeddedLgaCount = stateWithLgas?.lgas?.length ?? 0;
  const { data: lgasListData, isFetching: isListLgasLoading } =
    useGetLgasByStateQuery(
      { stateId: openStateId!, itemsPerPage: 200 },
      {
        skip:
          !isOpenFormActive ||
          openStateId == null ||
          isStateLgasLoading ||
          embeddedLgaCount > 0,
      },
    );

  const states = statesData?.member ?? [];
  const lgas = useMemo(() => {
    const embedded = stateWithLgas?.lgas ?? [];
    if (embedded.length > 0) return embedded;
    return lgasListData?.member ?? [];
  }, [stateWithLgas?.lgas, lgasListData?.member]);

  const isLgasLoading =
    openStateId != null && (isStateLgasLoading || isListLgasLoading);

  const [candidateLookup, { isLoading: isLookupLoading }] =
    useCandidateLookupMutation();
  const [candidateSignup, { isLoading: isSignupLoading }] =
    useCandidateSignupMutation();

  const laneSelectors = useMemo(
    () => buildLaneSelectors(config, laneParams),
    [config, laneParams],
  );

  useLayoutEffect(() => {
    if (!config || blockedReason) {
      appliedCycleIdRef.current = null;
      return;
    }
    if (appliedCycleIdRef.current === config.cycleId) return;

    appliedCycleIdRef.current = config.cycleId;
    dispatch({
      type: CandidateSignupActionType.SetLaneContext,
      laneContext: {
        entryMode: config.entryMode,
        batchNo: config.batchNo,
        ...(config.sessionId !== undefined
          ? { sessionId: config.sessionId }
          : {}),
      },
      step:
        config.admissionIdentityMode === "OPEN" ? "open_form" : "jamb_lookup",
    });
  }, [config, blockedReason]);

  const effectiveStep = resolveEffectiveStep(
    pageState.step,
    blockedReason,
    isConfigLoading || isConfigFetching,
    config,
  );

  const handleJambLookup = async () => {
    try {
      const values = await jambLookupForm.validateFields();
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: null,
      });
      const result = await candidateLookup(
        withLaneSelectors(
          { jambRegNo: values.jambRegNo.trim() },
          laneSelectors,
        ),
      ).unwrap();
      dispatch({
        type: CandidateSignupActionType.SetJambRegNo,
        value: values.jambRegNo.trim(),
      });
      dispatch({
        type: CandidateSignupActionType.SetLookupResult,
        result,
      });
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Form, method: "POST" },
        form: jambLookupForm,
      });
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

      await candidateSignup(
        withLaneSelectors(
          {
            email: values.email.trim(),
            password: values.password,
            jambRegNo: pageState.jambRegNo,
            verificationToken: pageState.lookupResult.verificationToken,
            phone: values.phone?.trim() || undefined,
          },
          laneSelectors,
        ),
      ).unwrap();

      notifyMutationSuccess(
        CANDIDATE_SIGNUP_UI_COPY.signupSuccessMessage,
        CANDIDATE_SIGNUP_UI_COPY.signupSuccessDescription,
      );
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Form, method: "POST" },
        form: jambSignupForm,
      });
    }
  };

  const handleOpenSignup = async () => {
    try {
      const values = await openSignupForm.validateFields();
      dispatch({
        type: CandidateSignupActionType.SetFormError,
        message: null,
      });

      await candidateSignup(
        withLaneSelectors(
          {
            email: values.email.trim(),
            password: values.password,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            stateId: values.stateId,
            gender: values.gender,
            lgaId: values.lgaId,
            phone: values.phone?.trim() || undefined,
            dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
          },
          laneSelectors,
        ),
      ).unwrap();

      notifyMutationSuccess(
        CANDIDATE_SIGNUP_UI_COPY.signupSuccessMessage,
        CANDIDATE_SIGNUP_UI_COPY.signupSuccessDescription,
      );
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Form, method: "POST" },
        form: openSignupForm,
      });
    }
  };

  const handleOpenStateChange = useCallback(
    (stateId: number) => {
      setOpenStateId(stateId);
      openSignupForm.setFieldValue("lgaId", undefined);
    },
    [openSignupForm],
  );

  const backToJambLookup = useCallback(() => {
    dispatch({
      type: CandidateSignupActionType.SetStep,
      step: "jamb_lookup",
    });
    dispatch({
      type: CandidateSignupActionType.SetFormError,
      message: null,
    });
  }, []);

  return {
    state: {
      config,
      cycleDateLabel: config ? formatAdmissionCycleDates(config) : null,
      step: effectiveStep,
      blockedReason,
      formError: pageState.formError,
      lookupResult: pageState.lookupResult,
      jambRegNo: pageState.jambRegNo,
      laneContext: pageState.laneContext,
      states,
      lgas,
      isConfigLoading: isConfigLoading || isConfigFetching,
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
      backToJambLookup,
    },
    flags: {
      isJambMode: config?.admissionIdentityMode === "JAMB",
      isOpenMode: config?.admissionIdentityMode === "OPEN",
      isBlocked: effectiveStep === "blocked",
      isBootstrap: effectiveStep === "bootstrap",
    },
    forms: {
      jambLookupForm,
      jambSignupForm,
      openSignupForm,
    },
  };
}
