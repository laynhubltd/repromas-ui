import { appPaths } from "@/app/routing/app-path";
import useAuthState from "@/features/auth/use-auth-state";
import { resolvePaymentPayerType } from "../utils/resolvePaymentPayerType";
import {
  STUDENT_PAYMENT_ITEMS_PER_PAGE,
  STUDENT_PAYMENT_SORT_DEFAULT,
} from "@/shared/constants/billingPaymentOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { useGetMyPaymentsQuery } from "../api/studentPaymentApi";
import {
  initialStudentPaymentsPageState,
  studentPaymentsPageReducer,
  StudentPaymentsPageActionType,
} from "../state/studentPaymentsPageState";

export function useStudentPaymentsPage() {
  const navigate = useNavigate();
  const { activeRole } = useAuthState();
  const payerType = resolvePaymentPayerType(activeRole?.scope);

  const [state, dispatch] = useReducer(
    studentPaymentsPageReducer,
    initialStudentPaymentsPageState,
  );

  const skip = payerType === null;

  const queryParams = useMemo(
    () =>
      payerType
        ? {
            payerType,
            page: state.page,
            itemsPerPage: STUDENT_PAYMENT_ITEMS_PER_PAGE,
            sort: STUDENT_PAYMENT_SORT_DEFAULT,
          }
        : undefined,
    [payerType, state.page],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMyPaymentsQuery(queryParams!, { skip: skip || !queryParams });

  const payments = data?.member ?? [];
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

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: StudentPaymentsPageActionType.SetPage, page });
  }, []);

  const handleOpenPayment = useCallback(
    (paymentId: number) => {
      navigate(
        generatePath(appPaths.studentPaymentReceipt, {
          paymentId: String(paymentId),
        }),
      );
    },
    [navigate],
  );

  return {
    state: {
      payments,
      totalItems,
      page: state.page,
      isLoading: isLoading || isFetching,
      sectionError,
      itemsPerPage: STUDENT_PAYMENT_ITEMS_PER_PAGE,
    },
    actions: {
      handlePageChange,
      handleOpenPayment,
      refetch,
    },
    flags: {
      hasData: payments.length > 0,
      skip,
    },
  };
}
