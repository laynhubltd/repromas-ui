import { useGetBillableEventsQuery } from "@/features/billing/tabs/fee-events/api/billableEventApi";
import { FEE_EVENT_SORT_DEFAULT } from "@/shared/constants/feeEventOptions";
import {
  FEE_CHARGE_ITEMS_PER_PAGE,
  FEE_CHARGE_SORT_DEFAULT,
} from "@/shared/constants/feeChargeOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useGetFeeChargesQuery } from "../api/feeChargeApi";
import {
  feeChargesTabReducer,
  FeeChargesTabActionType,
  initialFeeChargesTabState,
} from "../state/feeChargesTabState";

export type UseFeeChargesTabOptions = {
  initialEventCode?: string | null;
};

export function useFeeChargesTab({
  initialEventCode = null,
}: UseFeeChargesTabOptions = {}) {
  const [state, dispatch] = useReducer(
    feeChargesTabReducer,
    initialFeeChargesTabState,
  );

  useEffect(() => {
    if (initialEventCode) {
      dispatch({
        type: FeeChargesTabActionType.SetEventCodeFilter,
        value: initialEventCode,
      });
    }
  }, [initialEventCode]);

  const queryParams = {
    page: state.page,
    itemsPerPage: FEE_CHARGE_ITEMS_PER_PAGE,
    sort: FEE_CHARGE_SORT_DEFAULT,
    ...(state.eventCodeFilter
      ? { "exact[eventCode]": state.eventCodeFilter }
      : {}),
    ...(state.statusFilter ? { "exact[status]": state.statusFilter } : {}),
  };

  const { data, isLoading, isError, error: queryError, refetch } =
    useGetFeeChargesQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const { data: eventsData } = useGetBillableEventsQuery({
    itemsPerPage: 100,
    sort: FEE_EVENT_SORT_DEFAULT,
    include: "currentPolicy",
  });

  const events = eventsData?.member ?? [];
  const eventByCode = useMemo(() => {
    const map = new Map<string, (typeof events)[number]>();
    for (const event of events) {
      map.set(event.code, event);
    }
    return map;
  }, [events]);

  const eventCodeOptions = useMemo(
    () =>
      events.map((event) => ({
        value: event.code,
        label: `${event.name} (${event.code})`,
      })),
    [events],
  );

  const charges = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: FeeChargesTabActionType.SetPage, value: page });
  }, []);

  const handleEventCodeFilterChange = useCallback((value: string | undefined) => {
    dispatch({
      type: FeeChargesTabActionType.SetEventCodeFilter,
      value,
    });
  }, []);

  const handleStatusFilterChange = useCallback((value: string | undefined) => {
    dispatch({
      type: FeeChargesTabActionType.SetStatusFilter,
      value,
    });
  }, []);

  const handleOpenDetail = useCallback((id: number) => {
    dispatch({ type: FeeChargesTabActionType.OpenDetail, id });
  }, []);

  const handleCloseDetail = useCallback(() => {
    dispatch({ type: FeeChargesTabActionType.CloseDetail });
  }, []);

  const isFilterActive =
    state.eventCodeFilter !== undefined || state.statusFilter !== undefined;

  return {
    state: {
      charges,
      totalItems,
      isLoading,
      isError,
      sectionError,
      page: state.page,
      eventCodeFilter: state.eventCodeFilter,
      statusFilter: state.statusFilter,
      eventCodeOptions,
      eventByCode,
      detailId: state.detailId,
      detailOpen: state.detailOpen,
    },
    actions: {
      handlePageChange,
      handleEventCodeFilterChange,
      handleStatusFilterChange,
      handleOpenDetail,
      handleCloseDetail,
      refetch,
    },
    flags: {
      hasData: charges.length > 0,
      isFilterActive,
    },
  };
}
