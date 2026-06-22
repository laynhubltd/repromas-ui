import useAuthState from "@/features/auth/use-auth-state";
import { appPaths } from "@/app/routing/app-path";
import { baseApi } from "@/app/api/baseApi";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import {
  PAYMENT_RETURN_POLL_INTERVAL_MS,
  PAYMENT_RETURN_POLL_MAX_MS,
  STUDENT_PAYMENT_UI_COPY,
} from "@/shared/constants/billingPaymentOptions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLazyGetMyPaymentTransactionsQuery } from "../api/studentPaymentApi";
import {
  firstTransactionFromList,
  formatPaymentAmount,
  isTransactionSettled,
  resolvePollStateFromTransaction,
} from "../utils/paymentDisplay";
import {
  clearCheckoutContext,
  readCheckoutContext,
  readProviderReferenceFromUrl,
} from "../utils/paymentSession";
import { resolvePayerTypeFromScope } from "@/features/student-invoices/utils/resolvePayerType";
import { validateReturnUrl } from "@/shared/utils/validateReturnUrl";
import type { PaymentReturnPollState } from "../types/student-payment";
import { useDispatch } from "react-redux";

export type PaymentReturnUi = {
  state: PaymentReturnPollState;
  providerReference: string | null;
  paymentId: number | null;
  amountDisplay: string | null;
  title: string;
  description: string;
  isActive: boolean;
  continueApplicationUrl: string;
};

function copyForState(
  state: PaymentReturnPollState,
  amountDisplay: string | null,
): Pick<PaymentReturnUi, "title" | "description"> {
  switch (state) {
    case "processing":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnProcessing,
        description: STUDENT_PAYMENT_UI_COPY.paymentReturnProcessingDetail,
      };
    case "success":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnSuccess,
        description: amountDisplay
          ? `${STUDENT_PAYMENT_UI_COPY.paymentReturnSuccessDetail} (${amountDisplay})`
          : STUDENT_PAYMENT_UI_COPY.paymentReturnSuccessDetail,
      };
    case "timeout":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnTimeout,
        description: STUDENT_PAYMENT_UI_COPY.paymentReturnTimeoutDetail,
      };
    case "failed":
      return {
        title: STUDENT_PAYMENT_UI_COPY.paymentReturnFailed,
        description: STUDENT_PAYMENT_UI_COPY.paymentReturnFailedDetail,
      };
    default:
      return { title: "", description: "" };
  }
}

type UsePaymentReturnPollingOptions = {
  enabled?: boolean;
  returnTo?: string | null;
};

export function usePaymentReturnPolling(
  options: UsePaymentReturnPollingOptions = {},
) {
  const { enabled = true, returnTo: returnToOption = null } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRole } = useAuthState();
  const dispatch = useDispatch();
  const payerType = resolvePayerTypeFromScope(activeRole?.scope);

  const paymentReturnParam = searchParams.get("paymentReturn") === "1";
  const providerReference = readProviderReferenceFromUrl(searchParams);
  const storedContext = readCheckoutContext();
  const continueApplicationUrl = useMemo(() => {
    const fromUrl = validateReturnUrl(searchParams.get("returnTo"));
    const fromOption = validateReturnUrl(returnToOption);
    return fromUrl ?? fromOption ?? appPaths.StudentApply;
  }, [returnToOption, searchParams]);

  const shouldPoll =
    enabled &&
    payerType !== null &&
    (paymentReturnParam || providerReference !== null);

  const [pollState, setPollState] = useState<PaymentReturnPollState>("idle");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const [fetchTransactions, { isFetching }] =
    useLazyGetMyPaymentTransactionsQuery();

  const runPoll = useCallback(async () => {
    if (!payerType || !providerReference) return;

    const startedAt = startedAtRef.current ?? Date.now();
    if (startedAtRef.current === null) startedAtRef.current = startedAt;

    const result = await fetchTransactions({
      payerType,
      providerReference,
      include: "payments",
      itemsPerPage: 5,
    }).unwrap();

    const transaction = firstTransactionFromList(
      result.member,
      providerReference,
    );
    const elapsed = Date.now() - startedAt;
    const next = resolvePollStateFromTransaction(
      transaction,
      elapsed,
      PAYMENT_RETURN_POLL_MAX_MS,
    );
    setPollState(next);

    if (isTransactionSettled(transaction)) {
      const posted = transaction?.payments?.[0];
      if (posted?.id) setPaymentId(posted.id);
      dispatch(
        baseApi.util.invalidateTags([
          ApiTagTypes.StudentInvoice,
          ApiTagTypes.BillingWorkflow,
          ApiTagTypes.StudentPayment,
          ApiTagTypes.MeAdmissionProgress,
        ]),
      );
      clearCheckoutContext();
    }
  }, [dispatch, fetchTransactions, payerType, providerReference]);

  useEffect(() => {
    if (!shouldPoll) {
      setPollState("idle");
      startedAtRef.current = null;
      return;
    }

    setPollState("processing");
    startedAtRef.current = Date.now();
    void runPoll();
  }, [shouldPoll, providerReference, runPoll]);

  useEffect(() => {
    if (!shouldPoll || pollState !== "processing") return;

    const interval = window.setInterval(() => {
      void runPoll();
    }, PAYMENT_RETURN_POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [shouldPoll, pollState, runPoll]);

  const handleDismiss = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("paymentReturn");
    next.delete("providerReference");
    next.delete("returnTo");
    setSearchParams(next, { replace: true });
    clearCheckoutContext();
    setPollState("idle");
    startedAtRef.current = null;
  }, [searchParams, setSearchParams]);

  const handleRetryPoll = useCallback(() => {
    startedAtRef.current = Date.now();
    setPollState("processing");
    void runPoll();
  }, [runPoll]);

  const amountDisplay = useMemo(() => {
    const amount = storedContext?.amount;
    const currency = storedContext?.currency ?? "NGN";
    if (!amount) return null;
    return formatPaymentAmount(amount, currency);
  }, [storedContext?.amount, storedContext?.currency]);

  const ui: PaymentReturnUi = useMemo(() => {
    const copy = copyForState(pollState, amountDisplay);
    return {
      state: pollState,
      providerReference,
      paymentId,
      amountDisplay,
      title: copy.title,
      description: copy.description,
      isActive: shouldPoll && pollState !== "idle",
      continueApplicationUrl,
    };
  }, [
    amountDisplay,
    continueApplicationUrl,
    paymentId,
    pollState,
    providerReference,
    shouldPoll,
  ]);

  return {
    ui,
    flags: {
      isPolling: isFetching && pollState === "processing",
      shouldPoll,
      skip: payerType === null,
    },
    actions: {
      handleDismiss,
      handleRetryPoll,
      runPoll,
    },
  };
}
