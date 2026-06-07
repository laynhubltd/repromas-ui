import {
  ADMIN_INVOICE_ITEMS_PER_PAGE,
  ADMIN_INVOICE_SORT_DEFAULT,
} from "@/shared/constants/billingInvoiceOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer } from "react";
import { useGetBillingInvoicesQuery } from "../api/billingInvoiceApi";

type State = {
  page: number;
  detailId: number | null;
  detailOpen: boolean;
};

type Action =
  | { type: "SET_PAGE"; page: number }
  | { type: "OPEN_DETAIL"; id: number }
  | { type: "CLOSE_DETAIL" };

const initial: State = { page: 1, detailId: null, detailOpen: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "OPEN_DETAIL":
      return { ...state, detailId: action.id, detailOpen: true };
    case "CLOSE_DETAIL":
      return { ...state, detailId: null, detailOpen: false };
    default:
      return state;
  }
}

export type UseInvoicesTabOptions = {
  initialFeeChargeId?: number | null;
};

export function useInvoicesTab(options: UseInvoicesTabOptions = {}) {
  const [state, dispatch] = useReducer(reducer, initial);

  const queryParams = useMemo(
    () => ({
      page: state.page,
      itemsPerPage: ADMIN_INVOICE_ITEMS_PER_PAGE,
      sort: ADMIN_INVOICE_SORT_DEFAULT,
      ...(options.initialFeeChargeId
        ? { "exact[feeChargeId]": options.initialFeeChargeId }
        : {}),
    }),
    [state.page, options.initialFeeChargeId],
  );

  const { data, isLoading, isError, error, refetch } =
    useGetBillingInvoicesQuery(queryParams);

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
      invoices: data?.member ?? [],
      totalItems: data?.totalItems ?? 0,
      page: state.page,
      isLoading,
      sectionError,
      detailId: state.detailId,
      detailOpen: state.detailOpen,
    },
    actions: {
      handlePageChange: useCallback((page: number) => {
        dispatch({ type: "SET_PAGE", page });
      }, []),
      handleOpenDetail: useCallback((id: number) => {
        dispatch({ type: "OPEN_DETAIL", id });
      }, []),
      handleCloseDetail: useCallback(() => {
        dispatch({ type: "CLOSE_DETAIL" });
      }, []),
      refetch,
    },
    flags: {
      hasData: (data?.member?.length ?? 0) > 0,
    },
  };
}
