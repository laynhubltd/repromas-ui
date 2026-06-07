import {
  ADMIN_PAYMENT_ITEMS_PER_PAGE,
  STUDENT_PAYMENT_SORT_DEFAULT,
} from "@/shared/constants/billingPaymentOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer } from "react";
import { useGetBillingPaymentsQuery } from "../api/billingPaymentApi";

type PaymentsTabState = {
  page: number;
  feeChargeIdFilter: number | null;
  detailId: number | null;
  detailOpen: boolean;
};

type PaymentsTabAction =
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_FEE_CHARGE_FILTER"; feeChargeId: number | null }
  | { type: "OPEN_DETAIL"; id: number }
  | { type: "CLOSE_DETAIL" };

const initialState: PaymentsTabState = {
  page: 1,
  feeChargeIdFilter: null,
  detailId: null,
  detailOpen: false,
};

function reducer(
  state: PaymentsTabState,
  action: PaymentsTabAction,
): PaymentsTabState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "SET_FEE_CHARGE_FILTER":
      return { ...state, feeChargeIdFilter: action.feeChargeId, page: 1 };
    case "OPEN_DETAIL":
      return { ...state, detailId: action.id, detailOpen: true };
    case "CLOSE_DETAIL":
      return { ...state, detailId: null, detailOpen: false };
    default:
      return state;
  }
}

export type UsePaymentsTabOptions = {
  initialFeeChargeId?: number | null;
};

export function usePaymentsTab(options: UsePaymentsTabOptions = {}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    feeChargeIdFilter: options.initialFeeChargeId ?? null,
  });

  const queryParams = useMemo(
    () => ({
      page: state.page,
      itemsPerPage: ADMIN_PAYMENT_ITEMS_PER_PAGE,
      sort: STUDENT_PAYMENT_SORT_DEFAULT,
      ...(state.feeChargeIdFilter
        ? { "exact[feeChargeId]": state.feeChargeIdFilter }
        : {}),
    }),
    [state.page, state.feeChargeIdFilter],
  );

  const { data, isLoading, isError, error, refetch } =
    useGetBillingPaymentsQuery(queryParams);

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
      payments: data?.member ?? [],
      totalItems: data?.totalItems ?? 0,
      page: state.page,
      feeChargeIdFilter: state.feeChargeIdFilter,
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
