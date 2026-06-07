import { appPaths } from "@/app/routing/app-path";
import useAuthState from "@/features/auth/use-auth-state";
import { resolvePayerTypeFromScope } from "@/features/student-invoices/utils/resolvePayerType";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import {
  buildInvoiceLineNameMap,
  formatPaymentContextLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import { useCallback, useMemo } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import { useGetMyInvoiceQuery } from "@/features/student-invoices/api/studentInvoiceApi";
import { useGetMyPaymentQuery } from "../api/studentPaymentApi";

export function useStudentPaymentReceiptPage() {
  const navigate = useNavigate();
  const { paymentId: paymentIdParam } = useParams<{ paymentId: string }>();
  const { activeRole } = useAuthState();
  const payerType = resolvePayerTypeFromScope(activeRole?.scope);

  const paymentId = Number.parseInt(paymentIdParam ?? "", 10);
  const skip = payerType === null || Number.isNaN(paymentId);

  const { data: payment, isLoading, isFetching, isError, error, refetch } =
    useGetMyPaymentQuery(
      { id: paymentId, payerType: payerType! },
      { skip: skip || payerType === null },
    );

  const { data: invoiceDetail } = useGetMyInvoiceQuery(
    {
      id: payment?.invoiceId ?? 0,
      payerType: payerType!,
      include: "lines,event",
    },
    { skip: skip || !payment?.invoiceId || payerType === null },
  );

  const allocationLineNames = useMemo(
    () => buildInvoiceLineNameMap(invoiceDetail?.lines),
    [invoiceDetail?.lines],
  );

  const paymentTitle = useMemo(
    () => (payment ? formatPaymentContextLabel(payment) : ""),
    [payment],
  );

  const sectionError = useMemo(
    () =>
      skip
        ? "Your account is not set up for student billing."
        : deriveSectionErrorMessage(isError, error, {
            screen: RequestScreen.Detail,
            method: "GET",
          }),
    [skip, isError, error],
  );

  const handleBackToList = useCallback(() => {
    navigate(appPaths.StudentPayments);
  }, [navigate]);

  const handleViewBill = useCallback(() => {
    if (!payment?.invoiceId) return;
    navigate(
      generatePath(appPaths.studentInvoicePay, {
        invoiceId: String(payment.invoiceId),
      }),
    );
  }, [navigate, payment?.invoiceId]);

  const currency =
    payment?.transaction?.currency ??
    payment?.invoice?.currency ??
    "NGN";

  return {
    state: {
      payment,
      isLoading: isLoading || isFetching,
      sectionError,
      currency,
      allocationLineNames,
      paymentTitle,
      invoiceDetail,
    },
    actions: {
      handleBackToList,
      handleViewBill,
      refetch,
    },
    flags: {
      skip,
      hasInvoice: payment?.invoiceId != null,
    },
  };
}
