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
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
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
import type {
  AdmissionEntryMode,
  AdmissionSignupConfig,
  SignupConfigLane,
} from "../types/candidate-signup";
import {
  buildLaneSelectors,
  parseLaneParamsFromSearch,
  readRawEntryModeFromSearch,
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
  rawUrlEntryMode: string | null,
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

  if (config && config.entryModes.length === 0) {
    return "not_open";
  }

  if (
    config &&
    rawUrlEntryMode !== null &&
    !config.entryModes.some((lane) => lane.entryMode === rawUrlEntryMode)
  ) {
    return "not_open";
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
  return pageStep;
}

export function useCandidateSignUpPage() {
  const handleApiError = useApiError();
  const [searchParams] = useSearchParams();
  const laneParams = useMemo(
    () => parseLaneParamsFromSearch(searchParams),
    [searchParams],
  );
  const rawUrlEntryMode = useMemo(
    () => readRawEntryModeFromSearch(searchParams),
    [searchParams],
  );

  const [pageState, dispatch] = useReducer(
    candidateSignupReducer,
    initialCandidateSignupState,
  );
  const appliedBootstrapKeyRef = useRef<string | null>(null);

  const [jambLookupForm] = Form.useForm<JambLookupFormValues>();
  const [jambSignupForm] = Form.useForm<JambSignupFormValues>();
  const [openSignupForm] = Form.useForm<OpenSignupFormValues>();

  // Always omit entryMode when fetching signup-config so config.entryModes retains
  // every enabled lane on the open cycle; validate URL ?entryMode= client-side.
  const configQueryArg = useMemo(
    () =>
      laneParams.sessionId !== undefined
        ? { sessionId: laneParams.sessionId }
        : undefined,
    [laneParams.sessionId],
  );

  const {
    data: config,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError: isConfigError,
    error: configError,
    refetch: refetchConfig,
  } = useGetAdmissionSignupConfigQuery(configQueryArg);

  const blockedReason = useMemo(
    () =>
      deriveBlockedReason(
        isConfigLoading || isConfigFetching,
        isConfigError,
        configError,
        config,
        rawUrlEntryMode,
      ),
    [
      isConfigLoading,
      isConfigFetching,
      isConfigError,
      configError,
      config,
      rawUrlEntryMode,
    ],
  );

  const activeLane: SignupConfigLane | undefined = useMemo(
    () =>
      config?.entryModes.find(
        (lane) => lane.entryMode === pageState.selectedEntryMode,
      ),
    [config?.entryModes, pageState.selectedEntryMode],
  );

  const isJambMode = activeLane?.identityMode === "JAMB";
  const isOpenMode = activeLane?.identityMode === "OPEN";
  const canChangeEntryMode = (config?.entryModes.length ?? 0) > 1;
  const hasMultipleJambLanes =
    (config?.entryModes.filter((lane) => lane.identityMode === "JAMB")
      .length ?? 0) > 1;

  const isOpenFormActive =
    isOpenMode &&
    blockedReason === null &&
    !isConfigLoading &&
    !isConfigFetching;

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery(
    { itemsPerPage: 100, sort: "name:asc" },
    { skip: !isOpenFormActive },
  );

  const { data: stateWithLgas, isFetching: isStateLgasLoading } =
    useGetStateWithLgasQuery(pageState.openStateId!, {
      skip: !isOpenFormActive || pageState.openStateId == null,
    });

  const embeddedLgaCount = stateWithLgas?.lgas?.length ?? 0;
  const { data: lgasListData, isFetching: isListLgasLoading } =
    useGetLgasByStateQuery(
      { stateId: pageState.openStateId!, itemsPerPage: 100 },
      {
        skip:
          !isOpenFormActive ||
          pageState.openStateId == null ||
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
    pageState.openStateId != null && (isStateLgasLoading || isListLgasLoading);

  const [candidateLookup, { isLoading: isLookupLoading }] =
    useCandidateLookupMutation();
  const [candidateSignup, { isLoading: isSignupLoading }] =
    useCandidateSignupMutation();

  const laneSelectors = useMemo(
    () => buildLaneSelectors(config, laneParams, pageState.selectedEntryMode),
    [config, laneParams, pageState.selectedEntryMode],
  );

  useLayoutEffect(() => {
    if (!config || blockedReason) {
      appliedBootstrapKeyRef.current = null;
      return;
    }

    const bootstrapKey = `${config.cycleId}:${rawUrlEntryMode ?? ""}`;
    if (appliedBootstrapKeyRef.current === bootstrapKey) return;
    appliedBootstrapKeyRef.current = bootstrapKey;

    const matchedUrlLane = rawUrlEntryMode
      ? config.entryModes.find((l) => l.entryMode === rawUrlEntryMode)
      : undefined;

    if (matchedUrlLane) {
      dispatch({
        type: CandidateSignupActionType.BootstrapMultiLane,
        laneContext: {
          entryMode: matchedUrlLane.entryMode,
          batchNo: config.batchNo,
          ...(config.sessionId !== undefined
            ? { sessionId: config.sessionId }
            : {}),
        },
        selectedEntryMode: matchedUrlLane.entryMode,
        step: matchedUrlLane.identityMode === "OPEN" ? "open_form" : "jamb_lookup",
      });
      return;
    }

    if (config.entryModes.length === 1) {
      const onlyLane = config.entryModes[0];
      dispatch({
        type: CandidateSignupActionType.BootstrapMultiLane,
        laneContext: {
          entryMode: onlyLane.entryMode,
          batchNo: config.batchNo,
          ...(config.sessionId !== undefined
            ? { sessionId: config.sessionId }
            : {}),
        },
        selectedEntryMode: onlyLane.entryMode,
        step: onlyLane.identityMode === "OPEN" ? "open_form" : "jamb_lookup",
      });
      return;
    }

    dispatch({
      type: CandidateSignupActionType.BootstrapMultiLane,
      laneContext: {
        entryMode: null,
        batchNo: config.batchNo,
        ...(config.sessionId !== undefined
          ? { sessionId: config.sessionId }
          : {}),
      },
      selectedEntryMode: null,
      step: "select_entry_mode",
    });
  }, [config, blockedReason, rawUrlEntryMode]);

  const effectiveStep = resolveEffectiveStep(
    pageState.step,
    blockedReason,
    isConfigLoading || isConfigFetching,
    config,
  );

  const handleSelectEntryMode = useCallback(
    (entryMode: AdmissionEntryMode) => {
      const lane = config?.entryModes.find((l) => l.entryMode === entryMode);
      if (!lane) return;
      jambLookupForm.resetFields();
      jambSignupForm.resetFields();
      openSignupForm.resetFields();
      dispatch({
        type: CandidateSignupActionType.SetOpenStateId,
        stateId: undefined,
      });
      dispatch({
        type: CandidateSignupActionType.SelectEntryMode,
        entryMode,
        step: lane.identityMode === "OPEN" ? "open_form" : "jamb_lookup",
      });
    },
    [config?.entryModes, jambLookupForm, jambSignupForm, openSignupForm],
  );

  const handleChangeEntryMode = useCallback(() => {
    if (!canChangeEntryMode) return;
    dispatch({
      type: CandidateSignupActionType.SelectEntryMode,
      entryMode: null,
      step: "select_entry_mode",
    });
  }, [canChangeEntryMode]);

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
        type: CandidateSignupActionType.SelectEntryMode,
        entryMode: result.entryMode,
      });
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

      const resolvedSelectors = buildLaneSelectors(
        config,
        laneParams,
        pageState.lookupResult.entryMode ?? pageState.selectedEntryMode,
      );

      await candidateSignup(
        withLaneSelectors(
          {
            email: values.email.trim(),
            password: values.password,
            jambRegNo: pageState.jambRegNo,
            verificationToken: pageState.lookupResult.verificationToken,
            phone: values.phone?.trim() || undefined,
          },
          resolvedSelectors,
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
      dispatch({
        type: CandidateSignupActionType.SetOpenStateId,
        stateId,
      });
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
      selectedEntryMode: pageState.selectedEntryMode,
      activeLane,
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
      openStateId: pageState.openStateId,
    },
    actions: {
      handleSelectEntryMode,
      handleChangeEntryMode,
      handleJambLookup,
      handleJambSignup,
      handleOpenSignup,
      handleOpenStateChange,
      refetchConfig,
      backToJambLookup,
    },
    flags: {
      isJambMode,
      isOpenMode,
      canChangeEntryMode,
      hasMultipleJambLanes,
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
