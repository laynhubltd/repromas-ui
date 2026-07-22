import {
  ADMIN_PAYMENT_TRANSACTION_ITEMS_PER_PAGE,
  STUDENT_PAYMENT_SORT_DEFAULT,
} from "@/shared/constants/billingPaymentOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useMemo, useReducer } from "react";
import {
  useGetBillingPaymentTransactionsQuery,
  useVerifyTransactionMutation,
} from "../api/billingPaymentTransactionApi";
import type { BillingPaymentTransactionStatus } from "../types/billing-payment-transaction";

type State = {
  page: number;
  statusFilter: BillingPaymentTransactionStatus | null;
  detailId: number | null;
  detailOpen: boolean;
};

type Action =
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_STATUS"; status: BillingPaymentTransactionStatus | null }
  | { type: "OPEN_DETAIL"; id: number }
  | { type: "CLOSE_DETAIL" };

const initial: State = {
  page: 1,
  statusFilter: null,
  detailId: null,
  detailOpen: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "SET_STATUS":
      return { ...state, statusFilter: action.status, page: 1 };
    case "OPEN_DETAIL":
      return { ...state, detailId: action.id, detailOpen: true };
    case "CLOSE_DETAIL":
      return { ...state, detailId: null, detailOpen: false };
    default:
      return state;
  }
}

export function usePaymentTransactionsTab() {
  const [state, dispatch] = useReducer(reducer, initial);
  const handleApiError = useApiError();
  const [verifyTransaction, { isLoading: isVerifying }] = useVerifyTransactionMutation();

  const queryParams = useMemo(
    () => ({
      page: state.page,
      itemsPerPage: ADMIN_PAYMENT_TRANSACTION_ITEMS_PER_PAGE,
      sort: STUDENT_PAYMENT_SORT_DEFAULT,
      ...(state.statusFilter
        ? { "exact[status]": state.statusFilter }
        : {}),
    }),
    [state.page, state.statusFilter],
  );

  const { data, isLoading, isError, error, refetch } =
    useGetBillingPaymentTransactionsQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  return {
    state: {
      transactions: data?.member ?? [],
      totalItems: data?.totalItems ?? 0,
      page: state.page,
      statusFilter: state.statusFilter,
      isLoading,
      sectionError,
      detailId: state.detailId,
      detailOpen: state.detailOpen,
      isVerifying,
    },
    actions: {
      handlePageChange: useCallback((page: number) => {
        dispatch({ type: "SET_PAGE", page });
      }, []),
      handleStatusFilter: useCallback(
        (status: BillingPaymentTransactionStatus | null) => {
          dispatch({ type: "SET_STATUS", status });
        },
        [],
      ),
      handleOpenDetail: useCallback((id: number) => {
        dispatch({ type: "OPEN_DETAIL", id });
      }, []),
      handleCloseDetail: useCallback(() => {
        dispatch({ type: "CLOSE_DETAIL" });
      }, []),
      handleVerify: useCallback(
        async (providerReference: string) => {
          try {
            const result = await verifyTransaction(providerReference).unwrap();

            // The API returns status: "error" with a 200 for application-level failures.
            // Treat these as user-facing errors rather than silent successes.
            if (result.status === "error") {
              handleApiError(new Error(result.message), {
                context: { screen: RequestScreen.Action, method: "POST" },
              });
              return;
            }

            notifyMutationSuccess(result.message);
          } catch (err: unknown) {
            handleApiError(err, {
              context: { screen: RequestScreen.Action, method: "POST" },
            });
          }
        },
        [verifyTransaction, handleApiError],
      ),
      refetch,
    },
    flags: {
      hasData: (data?.member?.length ?? 0) > 0,
    },
  };
}
