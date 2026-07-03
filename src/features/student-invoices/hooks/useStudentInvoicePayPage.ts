import { appPaths } from "@/app/routing/app-path";
import useAuthState from "@/features/auth/use-auth-state";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useGetMyInvoiceQuery,
  useInitiateFeeChargePaymentMutation,
} from "../api/studentInvoiceApi";
import {
  initialStudentInvoicePayPageState,
  studentInvoicePayPageReducer,
  StudentInvoicePayPageActionType,
} from "../state/studentInvoicePayPageState";
import { saveCheckoutContext } from "@/features/student-payments/utils/paymentSession";
import { submitRemitaPaymentForm } from "@/features/student-payments/utils/remitaCheckout";
import { validateReturnUrl } from "@/shared/utils/validateReturnUrl";
import { buildSelectedOptionalLineIdsParam } from "../utils/invoiceDisplay";
import { resolvePayerTypeFromScope } from "../utils/resolvePayerType";

export function useStudentInvoicePayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { invoiceId: invoiceIdParam } = useParams<{ invoiceId: string }>();
  const { activeRole, userProfile } = useAuthState();
  const handleApiError = useApiError();

  const invoiceId = Number.parseInt(invoiceIdParam ?? "", 10);
  const payerType = resolvePayerTypeFromScope(activeRole?.scope);
  const skip = payerType === null || Number.isNaN(invoiceId);
  const validatedReturnTo = useMemo(
    () => validateReturnUrl(searchParams.get("returnTo")),
    [searchParams],
  );

  const buildInvoicesReturnPath = useCallback(() => {
    const redirect = new URL(appPaths.StudentInvoices, "http://local");
    redirect.searchParams.set("paymentReturn", "1");
    if (validatedReturnTo) {
      redirect.searchParams.set("returnTo", validatedReturnTo);
    }
    return `${redirect.pathname}${redirect.search}`;
  }, [validatedReturnTo]);

  const [state, dispatch] = useReducer(
    studentInvoicePayPageReducer,
    initialStudentInvoicePayPageState,
  );

  useEffect(() => {
    dispatch({ type: StudentInvoicePayPageActionType.Reset });
  }, [invoiceId]);

  const selectedOptionalLineIdsParam = useMemo(
    () =>
      state.previewApplied
        ? buildSelectedOptionalLineIdsParam(state.selectedOptionalLineIds)
        : undefined,
    [state.previewApplied, state.selectedOptionalLineIds],
  );

  const queryArgs = useMemo(
    () =>
      skip
        ? undefined
        : {
            id: invoiceId,
            payerType,
            include: "lines,event",
            selectedOptionalLineIds: selectedOptionalLineIdsParam,
          },
    [skip, invoiceId, payerType, selectedOptionalLineIdsParam],
  );

  const { data: invoice, isLoading, isFetching, isError, error, refetch } =
    useGetMyInvoiceQuery(queryArgs!, { skip: skip || !queryArgs });

  const [initiatePayment, { isLoading: isPaying }] =
    useInitiateFeeChargePaymentMutation();

  const lines = useMemo(() => invoice?.lines ?? [], [invoice?.lines]);
  const optionalLines = useMemo(
    () => lines.filter((line) => !line.isRequired),
    [lines],
  );

  useEffect(() => {
    if (!invoice || optionalLines.length === 0) return;
    const serverSelected = optionalLines
      .filter((line) => line.isSelected)
      .map((line) => line.id);
    if (state.selectedOptionalLineIds.length === 0 && serverSelected.length > 0) {
      dispatch({
        type: StudentInvoicePayPageActionType.SetSelectedFromServer,
        lineIds: serverSelected,
      });
    }
  }, [invoice, optionalLines, state.selectedOptionalLineIds.length]);

  const sectionError = useMemo(
    () =>
      skip
        ? "Your account is not set up for student billing."
        : deriveSectionErrorMessage(isError, error, {
            screen: RequestScreen.List,
            method: "GET",
          }),
    [skip, isError, error],
  );

  const handleToggleOptionalLine = useCallback((lineId: number) => {
    dispatch({
      type: StudentInvoicePayPageActionType.ToggleOptionalLine,
      lineId,
    });
  }, []);

  const handleUpdateSelection = useCallback(() => {
    dispatch({
      type: StudentInvoicePayPageActionType.SetSelectedOptionalLineIds,
      lineIds: state.selectedOptionalLineIds,
    });
    void refetch();
  }, [refetch, state.selectedOptionalLineIds]);

  const handleBackToList = useCallback(() => {
    navigate(appPaths.StudentInvoices);
  }, [navigate]);

  const handlePayNow = useCallback(async () => {
    if (!invoice || !invoice.canPay) return;

    try {
      const result = await initiatePayment({
        feeChargeId: invoice.feeChargeId,
        body: {
          redirectUrl: `${import.meta.env.VITE_APP_URL?.replace(/\/$/, "") ?? window.location.origin}${buildInvoicesReturnPath()}`,
          customerEmail: userProfile?.email ?? undefined,
          customerName:
            [userProfile?.firstName, userProfile?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || undefined,
          selectedOptionalLineIds:
            state.selectedOptionalLineIds.length > 0
              ? state.selectedOptionalLineIds
              : undefined,
        },
      }).unwrap();

      if (result.providerReference) {
        saveCheckoutContext({
          providerReference: result.providerReference,
          provider: result.provider,
          amount: result.amount,
          currency: result.currency ?? invoice.currency,
          eventCode: invoice.eventCode,
          feeChargeId: invoice.feeChargeId,
          payerType: payerType ?? undefined,
        });
      }

      if (result.checkoutUrl) {
        switch (result.provider) {
          case "REMITA":
            submitRemitaPaymentForm(result.checkoutUrl);
            break;
          default:
            window.location.href = result.checkoutUrl;
            break;
        }
      }
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [
    handleApiError,
    buildInvoicesReturnPath,
    initiatePayment,
    invoice,
    state.selectedOptionalLineIds,
    payerType,
    userProfile,
  ]);

  const isLineSelected = useCallback(
    (lineId: number, isRequired: boolean) => {
      if (isRequired) return true;
      if (state.previewApplied) {
        return state.selectedOptionalLineIds.includes(lineId);
      }
      const line = lines.find((l) => l.id === lineId);
      return line?.isSelected ?? state.selectedOptionalLineIds.includes(lineId);
    },
    [lines, state.previewApplied, state.selectedOptionalLineIds],
  );

  const selectionDirty = useMemo(() => {
    const serverSelected = optionalLines
      .filter((line) => line.isSelected)
      .map((line) => line.id)
      .sort((a, b) => a - b);
    const localSelected = [...state.selectedOptionalLineIds].sort((a, b) => a - b);
    if (serverSelected.length !== localSelected.length) return true;
    return serverSelected.some((id, i) => id !== localSelected[i]);
  }, [optionalLines, state.selectedOptionalLineIds]);

  return {
    state: {
      invoice,
      lines,
      isLoading: isLoading || isFetching,
      sectionError,
      isPaying,
      selectedOptionalLineIds: state.selectedOptionalLineIds,
    },
    actions: {
      handleToggleOptionalLine,
      handleUpdateSelection,
      handlePayNow,
      handleBackToList,
      refetch,
    },
    flags: {
      canPay: invoice?.canPay ?? false,
      hasOptionalLines: optionalLines.length > 0,
      isCancelled: invoice?.status === "CANCELLED" || invoice?.isActive === false,
      selectionDirty,
      isLineSelected,
      skip,
    },
  };
}
