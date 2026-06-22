import { appPaths } from "@/app/routing/app-path";
import useAuthState from "@/features/auth/use-auth-state";
import {
  STUDENT_INVOICE_ITEMS_PER_PAGE,
  STUDENT_INVOICE_SORT_DEFAULT,
  STUDENT_INVOICE_UI_COPY,
} from "@/shared/constants/studentInvoiceOptions";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { validateReturnUrl } from "@/shared/utils/validateReturnUrl";
import { usePaymentReturnPolling } from "@/features/student-payments/hooks/usePaymentReturnPolling";
import { message } from "antd";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { generatePath, useNavigate, useSearchParams } from "react-router-dom";
import { useGetMyInvoicesQuery } from "../api/studentInvoiceApi";
import {
  initialStudentInvoicesPageState,
  studentInvoicesPageReducer,
  StudentInvoicesPageActionType,
} from "../state/studentInvoicesPageState";
import { findInvoiceIdByFeeChargeId } from "../utils/invoiceDisplay";
import { resolvePayerTypeFromScope } from "../utils/resolvePayerType";

export function useStudentInvoicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRole } = useAuthState();
  const isMobile = useIsMobile();
  const payerType = resolvePayerTypeFromScope(activeRole?.scope);

  const [state, dispatch] = useReducer(
    studentInvoicesPageReducer,
    initialStudentInvoicesPageState,
  );

  const feeChargeIdParam = searchParams.get("feeChargeId");
  const validatedReturnTo = useMemo(
    () => validateReturnUrl(searchParams.get("returnTo")),
    [searchParams],
  );
  const paymentReturnPolling = usePaymentReturnPolling({
    returnTo: validatedReturnTo,
  });

  const skip = payerType === null;

  const queryParams = useMemo(
    () =>
      payerType
        ? {
            payerType,
            activeOnly: state.activeOnly,
            page: state.page,
            itemsPerPage: STUDENT_INVOICE_ITEMS_PER_PAGE,
            sort: STUDENT_INVOICE_SORT_DEFAULT,
          }
        : undefined,
    [payerType, state.activeOnly, state.page],
  );

  const { data, isLoading, isFetching, isSuccess, isError, error, refetch } =
    useGetMyInvoicesQuery(queryParams!, { skip: skip || !queryParams });

  const invoices = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

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

  useEffect(() => {
    if (!feeChargeIdParam || skip || !isSuccess) return;

    const feeChargeId = Number.parseInt(feeChargeIdParam, 10);
    if (Number.isNaN(feeChargeId)) return;

    const invoiceId = findInvoiceIdByFeeChargeId(invoices, feeChargeId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("feeChargeId");

    if (invoiceId !== null) {
      const payPath = generatePath(appPaths.studentInvoicePay, {
        invoiceId: String(invoiceId),
      });
      const query = validatedReturnTo
        ? `?returnTo=${encodeURIComponent(validatedReturnTo)}`
        : "";
      navigate(`${payPath}${query}`, { replace: true });
      return;
    }

    message.warning(STUDENT_INVOICE_UI_COPY.noPayableInvoice);
    setSearchParams(nextParams, { replace: true });
  }, [
    feeChargeIdParam,
    invoices,
    isSuccess,
    navigate,
    searchParams,
    setSearchParams,
    skip,
    validatedReturnTo,
  ]);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: StudentInvoicesPageActionType.SetPage, page });
  }, []);

  const handleActiveOnlyChange = useCallback((activeOnly: boolean) => {
    dispatch({
      type: StudentInvoicesPageActionType.SetActiveOnly,
      activeOnly,
    });
  }, []);

  const handleOpenInvoice = useCallback(
    (invoiceId: number) => {
      navigate(
        generatePath(appPaths.studentInvoicePay, {
          invoiceId: String(invoiceId),
        }),
      );
    },
    [navigate],
  );

  const handleDismissPaymentReturn = useCallback(() => {
    paymentReturnPolling.actions.handleDismiss();
    void refetch();
  }, [paymentReturnPolling.actions, refetch]);

  const hasData = invoices.length > 0;
  const isSearchActive = !state.activeOnly;

  return {
    state: {
      invoices,
      totalItems,
      page: state.page,
      activeOnly: state.activeOnly,
      isLoading: isLoading || isFetching,
      sectionError,
      paymentReturnPolling,
      itemsPerPage: STUDENT_INVOICE_ITEMS_PER_PAGE,
    },
    actions: {
      handlePageChange,
      handleActiveOnlyChange,
      handleOpenInvoice,
      handleDismissPaymentReturn,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
      isMobile,
      skip,
    },
  };
}
