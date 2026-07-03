import useAuthState from "@/features/auth/use-auth-state";
import { useLazyGetMeHandoffQuery } from "@/features/auth/api/meHandoffApi";
import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { appPaths } from "@/app/routing/app-path";
import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import {
  HANDOFF_UI_COPY,
  PAYMENT_RETURN_POLL_MAX_MS,
  STUDENT_PAYMENT_UI_COPY,
} from "@/shared/constants/billingPaymentOptions";
import { useLazyGetMeAdmissionProgressQuery } from "@/features/student-home/api/meAdmissionProgressApi";
import { getQueryHttpStatus } from "@/features/student-home/utils/getQueryHttpStatus";
import { resolvePayerTypeFromScope } from "@/features/student-invoices/utils/resolvePayerType";
import type { PayerType } from "@/features/student-invoices/types/student-invoice";
import { validateReturnUrl } from "@/shared/utils/validateReturnUrl";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLazyGetMyPaymentTransactionsQuery } from "../api/studentPaymentApi";
import {
  initialPaymentReturnOrchestratorState,
  paymentReturnOrchestratorReducer,
  PaymentReturnOrchestratorActionType,
  type HandoffUiPhase,
} from "../state/paymentReturnOrchestratorState";
import {
  firstTransactionFromList,
  formatPaymentAmount,
  isTransactionSettled,
  resolvePollStateFromTransaction,
} from "../utils/paymentDisplay";
import {
  HANDOFF_POLL_MAX_ATTEMPTS,
  isAdmissionRegistrationFeePayment,
  isPortalMatriculated,
  resolveBackoffMs,
  resolvePaymentEventCode,
  sleep,
} from "../utils/handoffOrchestration";
import {
  clearCheckoutContext,
  readCheckoutContext,
  readProviderReferenceFromUrl,
  resolveFlowPayerType,
  stripPaymentReturnSearchParams,
} from "../utils/paymentSession";

const PAYMENT_TRANSACTION_INCLUDE = "payments,feeCharge,invoice";

export type PaymentReturnOrchestratorUi = {
  phase: HandoffUiPhase;
  providerReference: string | null;
  paymentId: number | null;
  amountDisplay: string | null;
  title: string;
  description: string;
  isActive: boolean;
  continueApplicationUrl: string;
};

type UsePaymentReturnOrchestratorOptions = {
  enabled?: boolean;
  returnTo?: string | null;
  /** When true, run Step C if dashboard shows matriculated but JWT is still CANDIDATE. */
  enableMatriculatedOnLoad?: boolean;
  /** Admission progress from parent query (for on-load handoff gate). */
  portalState?: string | null;
};

function copyForPhase(
  phase: HandoffUiPhase,
  amountDisplay: string | null,
  errorMessage: string | null,
): Pick<PaymentReturnOrchestratorUi, "title" | "description"> {
  switch (phase) {
    case "confirming_payment":
      return {
        title: HANDOFF_UI_COPY.confirmingPayment,
        description: HANDOFF_UI_COPY.confirmingPaymentDetail,
      };
    case "payment_confirmed":
      return {
        title: HANDOFF_UI_COPY.paymentConfirmed,
        description: amountDisplay
          ? `${HANDOFF_UI_COPY.paymentConfirmedDetail} (${amountDisplay})`
          : HANDOFF_UI_COPY.paymentConfirmedDetail,
      };
    case "matriculating":
      return {
        title: HANDOFF_UI_COPY.matriculating,
        description: HANDOFF_UI_COPY.matriculatingDetail,
      };
    case "handoff":
      return {
        title: HANDOFF_UI_COPY.handoff,
        description: HANDOFF_UI_COPY.handoffDetail,
      };
    case "complete":
      return {
        title: HANDOFF_UI_COPY.complete,
        description: HANDOFF_UI_COPY.completeDetail,
      };
    case "payment_pending":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnTimeout,
        description: STUDENT_PAYMENT_UI_COPY.paymentReturnTimeoutDetail,
      };
    case "failed":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnFailed,
        description: STUDENT_PAYMENT_UI_COPY.paymentReturnFailedDetail,
      };
    case "error":
      return {
        title: HANDOFF_UI_COPY.handoffTimeout,
        description:
          errorMessage ?? HANDOFF_UI_COPY.handoffTimeoutDetail,
      };
    default:
      return { title: "", description: "" };
  }
}

function invalidateBillingTags(dispatch: ReturnType<typeof useDispatch>) {
  dispatch(
    baseApi.util.invalidateTags([
      ApiTagTypes.StudentInvoice,
      ApiTagTypes.BillingWorkflow,
      ApiTagTypes.StudentPayment,
      ApiTagTypes.MeAdmissionProgress,
    ]),
  );
}

export function usePaymentReturnOrchestrator(
  options: UsePaymentReturnOrchestratorOptions = {},
) {
  const {
    enabled = true,
    returnTo: returnToOption = null,
    enableMatriculatedOnLoad = false,
    portalState = null,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRole } = useAuthState();
  const { hasStudentPortalScope } = useAccessControl();
  const isCandidate = hasStudentPortalScope([StudentPortalScope.Candidate]);
  const dispatch = useDispatch();
  const payerType = resolvePayerTypeFromScope(activeRole?.scope);

  const paymentReturnParam = searchParams.get("paymentReturn") === "1";
  const providerReference = readProviderReferenceFromUrl(searchParams);
  const storedContext = readCheckoutContext();
  const flowPayerType = resolveFlowPayerType(storedContext, activeRole?.scope);

  const continueApplicationUrl = useMemo(() => {
    const fromUrl = validateReturnUrl(searchParams.get("returnTo"));
    const fromOption = validateReturnUrl(returnToOption);
    return fromUrl ?? fromOption ?? appPaths.StudentApply;
  }, [returnToOption, searchParams]);

  const shouldOrchestratePaymentReturn =
    enabled &&
    flowPayerType !== null &&
    paymentReturnParam &&
    providerReference !== null;

  const [orchestratorState, orchestratorDispatch] = useReducer(
    paymentReturnOrchestratorReducer,
    initialPaymentReturnOrchestratorState,
  );

  const [fetchTransactions] = useLazyGetMyPaymentTransactionsQuery();
  const [fetchProgress] = useLazyGetMeAdmissionProgressQuery();
  const [fetchHandoff] = useLazyGetMeHandoffQuery();

  const runIdRef = useRef(0);
  const onLoadHandoffTriggeredRef = useRef(false);
  const isRunningRef = useRef(false);
  const handledReferenceRef = useRef<string | null>(null);
  const displayReferenceRef = useRef<string | null>(null);
  const displayAmountRef = useRef<{ amount: string; currency: string } | null>(
    null,
  );

  const finalizePaymentReturn = useCallback(() => {
    clearCheckoutContext();
    handledReferenceRef.current = null;
    const next = stripPaymentReturnSearchParams(searchParams);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const runHandoffWithRetry = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; attempt < HANDOFF_POLL_MAX_ATTEMPTS; attempt++) {
      try {
        await fetchHandoff({ issueTokens: true }).unwrap();
        return true;
      } catch (err: unknown) {
        const status = getQueryHttpStatus(err);
        if (status === 422) {
          await sleep(resolveBackoffMs(attempt));
          continue;
        }
        throw err;
      }
    }
    return false;
  }, [fetchHandoff]);

  const runMatriculationPoll = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; attempt < HANDOFF_POLL_MAX_ATTEMPTS; attempt++) {
      const progress = await fetchProgress().unwrap();
      if (isPortalMatriculated(progress.portalState)) {
        return true;
      }
      await sleep(resolveBackoffMs(attempt));
    }
    return false;
  }, [fetchProgress]);

  const runPaymentConfirmPoll = useCallback(
    async (
      reference: string,
      pollPayerType: PayerType,
    ): Promise<
      | { outcome: "settled"; transaction: NonNullable<Awaited<ReturnType<typeof firstTransactionFromList>>> }
      | { outcome: "failed" }
      | { outcome: "timeout" }
    > => {
      const startedAt = Date.now();

      for (let attempt = 0; attempt < HANDOFF_POLL_MAX_ATTEMPTS; attempt++) {
        const result = await fetchTransactions({
          payerType: pollPayerType,
          providerReference: reference,
          include: PAYMENT_TRANSACTION_INCLUDE,
          itemsPerPage: 5,
        }).unwrap();

        const transaction = firstTransactionFromList(
          result.member,
          reference,
        );
        const elapsed = Date.now() - startedAt;
        const pollState = resolvePollStateFromTransaction(
          transaction,
          elapsed,
          PAYMENT_RETURN_POLL_MAX_MS,
        );

        if (pollState === "success" && isTransactionSettled(transaction)) {
          return { outcome: "settled", transaction };
        }
        if (pollState === "failed") {
          return { outcome: "failed" };
        }
        if (pollState === "timeout") {
          return { outcome: "timeout" };
        }

        await sleep(resolveBackoffMs(attempt));
      }

      return { outcome: "timeout" };
    },
    [fetchTransactions],
  );

  const runPaymentReturnFlow = useCallback(async () => {
    const checkoutContext = readCheckoutContext();
    const reference = checkoutContext?.providerReference ?? providerReference;
    const pollPayerType = resolveFlowPayerType(
      checkoutContext,
      activeRole?.scope,
    );

    if (!reference || !pollPayerType || isRunningRef.current) return;

    isRunningRef.current = true;
    const runId = ++runIdRef.current;
    handledReferenceRef.current = reference;
    displayReferenceRef.current = reference;
    if (checkoutContext?.amount) {
      displayAmountRef.current = {
        amount: checkoutContext.amount,
        currency: checkoutContext.currency ?? "NGN",
      };
    }

    orchestratorDispatch({
      type: PaymentReturnOrchestratorActionType.StartPaymentConfirm,
    });

    try {
      const paymentResult = await runPaymentConfirmPoll(reference, pollPayerType);
      if (runId !== runIdRef.current) return;

      if (paymentResult.outcome === "failed") {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.Failed,
        });
        return;
      }

      if (paymentResult.outcome === "timeout") {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.PaymentPending,
        });
        return;
      }

      const transaction = paymentResult.transaction;

      const posted = transaction.payments?.[0];
      const paymentId = posted?.id ?? null;
      const eventCode = resolvePaymentEventCode(transaction, checkoutContext);

      if (!isAdmissionRegistrationFeePayment(eventCode)) {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.PaymentConfirmed,
          paymentId,
        });
        invalidateBillingTags(dispatch);
        finalizePaymentReturn();
        return;
      }

      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.StartMatriculating,
      });

      const matriculated = await runMatriculationPoll();
      if (runId !== runIdRef.current) return;

      if (!matriculated) {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.Error,
          message: HANDOFF_UI_COPY.matriculationTimeoutDetail,
        });
        invalidateBillingTags(dispatch);
        return;
      }

      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.StartHandoff,
      });

      const handoffOk = await runHandoffWithRetry();
      if (runId !== runIdRef.current) return;

      if (!handoffOk) {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.Error,
          message: HANDOFF_UI_COPY.handoffTimeoutDetail,
        });
        return;
      }

      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.Complete,
        paymentId,
      });
      invalidateBillingTags(dispatch);
      finalizePaymentReturn();
    } catch {
      if (runId !== runIdRef.current) return;
      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.Failed,
      });
    } finally {
      isRunningRef.current = false;
    }
  }, [
    activeRole?.scope,
    dispatch,
    finalizePaymentReturn,
    providerReference,
    runHandoffWithRetry,
    runMatriculationPoll,
    runPaymentConfirmPoll,
  ]);

  const runOnLoadHandoff = useCallback(async () => {
    if (onLoadHandoffTriggeredRef.current || isRunningRef.current) return;
    if (!isCandidate || activeRole?.scope !== StudentPortalScope.Candidate) {
      return;
    }
    if (!isPortalMatriculated(portalState)) return;
    if (shouldOrchestratePaymentReturn) return;

    onLoadHandoffTriggeredRef.current = true;
    isRunningRef.current = true;
    const runId = ++runIdRef.current;

    orchestratorDispatch({
      type: PaymentReturnOrchestratorActionType.StartHandoff,
    });

    try {
      const handoffOk = await runHandoffWithRetry();
      if (runId !== runIdRef.current) return;

      if (!handoffOk) {
        orchestratorDispatch({
          type: PaymentReturnOrchestratorActionType.Error,
          message: HANDOFF_UI_COPY.handoffTimeoutDetail,
        });
        return;
      }

      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.Complete,
      });
      invalidateBillingTags(dispatch);
    } catch {
      if (runId !== runIdRef.current) return;
      orchestratorDispatch({
        type: PaymentReturnOrchestratorActionType.Error,
        message: HANDOFF_UI_COPY.handoffTimeoutDetail,
      });
    } finally {
      isRunningRef.current = false;
    }
  }, [
    activeRole?.scope,
    dispatch,
    isCandidate,
    portalState,
    runHandoffWithRetry,
    shouldOrchestratePaymentReturn,
  ]);

  useEffect(() => {
    if (!shouldOrchestratePaymentReturn) {
      if (!enableMatriculatedOnLoad && !isRunningRef.current) {
        orchestratorDispatch({ type: PaymentReturnOrchestratorActionType.Reset });
      }
      return;
    }

    if (
      handledReferenceRef.current !== null &&
      handledReferenceRef.current === providerReference
    ) {
      return;
    }

    void runPaymentReturnFlow();

    return () => {
      // Do not cancel an in-flight registration-fee handoff when URL/session clear re-renders.
      if (!isRunningRef.current) {
        runIdRef.current += 1;
      }
    };
    // Intentionally omit runPaymentReturnFlow — role changes after handoff must not restart Step A.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldOrchestratePaymentReturn,
    providerReference,
    enableMatriculatedOnLoad,
  ]);

  useEffect(() => {
    if (!enableMatriculatedOnLoad) return;
    void runOnLoadHandoff();

    return () => {
      if (!isRunningRef.current) {
        runIdRef.current += 1;
      }
    };
  }, [enableMatriculatedOnLoad, runOnLoadHandoff]);

  const handleDismiss = useCallback(() => {
    runIdRef.current += 1;
    handledReferenceRef.current = null;
    displayReferenceRef.current = null;
    displayAmountRef.current = null;
    finalizePaymentReturn();
    orchestratorDispatch({ type: PaymentReturnOrchestratorActionType.Reset });
    isRunningRef.current = false;
  }, [finalizePaymentReturn]);

  const handleRetryPoll = useCallback(() => {
    if (shouldOrchestratePaymentReturn) {
      handledReferenceRef.current = null;
      void runPaymentReturnFlow();
      return;
    }
    if (enableMatriculatedOnLoad && isPortalMatriculated(portalState)) {
      onLoadHandoffTriggeredRef.current = false;
      void runOnLoadHandoff();
    }
  }, [
    enableMatriculatedOnLoad,
    portalState,
    runOnLoadHandoff,
    runPaymentReturnFlow,
    shouldOrchestratePaymentReturn,
  ]);

  const amountDisplay = useMemo(() => {
    const stored = displayAmountRef.current;
    if (stored?.amount) {
      return formatPaymentAmount(stored.amount, stored.currency);
    }
    const amount = storedContext?.amount;
    const currency = storedContext?.currency ?? "NGN";
    if (!amount) return null;
    return formatPaymentAmount(amount, currency);
  }, [storedContext?.amount, storedContext?.currency, orchestratorState.phase]);

  const displayReference =
    displayReferenceRef.current ?? providerReference;

  const ui: PaymentReturnOrchestratorUi = useMemo(() => {
    const { phase } = orchestratorState;
    const copy = copyForPhase(
      phase,
      amountDisplay,
      orchestratorState.errorMessage,
    );
    const isActive = phase !== "idle";

    return {
      phase,
      providerReference: displayReference,
      paymentId: orchestratorState.paymentId,
      amountDisplay,
      title: copy.title,
      description: copy.description,
      isActive,
      continueApplicationUrl,
    };
  }, [
    amountDisplay,
    continueApplicationUrl,
    displayReference,
    orchestratorState,
  ]);

  const isPolling =
    orchestratorState.phase === "confirming_payment" ||
    orchestratorState.phase === "matriculating" ||
    orchestratorState.phase === "handoff";

  return {
    ui,
    flags: {
      isPolling,
      shouldPoll: shouldOrchestratePaymentReturn,
      skip: flowPayerType === null && payerType === null,
    },
    actions: {
      handleDismiss,
      handleRetryPoll,
      runPoll: runPaymentReturnFlow,
    },
  };
}

/** @deprecated Use usePaymentReturnOrchestrator */
export const usePaymentReturnPolling = usePaymentReturnOrchestrator;
