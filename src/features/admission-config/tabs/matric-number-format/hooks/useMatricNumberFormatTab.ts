import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetAcademicSessionsForCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import {
  MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
  MATRIC_NUMBER_FORMAT_UI_COPY,
  matricSlotLabel,
} from "@/shared/constants/matricNumberFormatOptions";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  RocketOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { createElement, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetMatricNumberFormatPrerequisitesQuery,
  useGetMatricNumberFormatsActiveQuery,
  useGetMatricNumberFormatsQuery,
} from "../api/matricNumberFormatApi";
import {
  MatricNumberFormatTabActionType,
  initialMatricNumberFormatTabState,
  matricNumberFormatTabReducer,
} from "../state/matricNumberFormatTabState";
import type { MatricFormatSlot, MatricNumberFormat } from "../types/matric-number-format";
import {
  canActivateDraft,
  canDeactivateActive,
  canReactivateInactive,
  findLiveFormatInSlot,
} from "../utils/slotLifecycleEligibility";
import { isPrerequisitesReadyForTemplate, normalizeMatricPrerequisites } from "../utils/templateTokenHelpers";

export function useMatricNumberFormatTab() {
  const [state, dispatch] = useReducer(
    matricNumberFormatTabReducer,
    initialMatricNumberFormatTabState,
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hasPermission } = useAccessControl();

  const canUpdate = hasPermission(Permission.MatricNumberFormatsUpdate);
  const canCreate = hasPermission(Permission.MatricNumberFormatsCreate);
  const canActivate = hasPermission(Permission.MatricNumberFormatsActivate);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
    sort: "updatedAt:desc",
    ...(state.debouncedSearch ? { "search[code]": state.debouncedSearch } : {}),
    ...(state.statusFilter ? { "exact[status]": state.statusFilter } : {}),
    ...(state.entryModeFilter === "ANY"
      ? {}
      : state.entryModeFilter === null
        ? { "exact[entryMode]": "" as const }
        : { "exact[entryMode]": state.entryModeFilter }),
  };

  const { data, isLoading, isError, error, refetch } =
    useGetMatricNumberFormatsQuery(queryParams);

  const {
    data: activeData,
    isLoading: slotsLoading,
    isError: slotsIsError,
    error: slotsError,
    refetch: refetchActiveSlots,
  } = useGetMatricNumberFormatsActiveQuery();

  const { data: prerequisites } = useGetMatricNumberFormatPrerequisitesQuery();
  const { data: academicSessions } = useGetAcademicSessionsForCyclesQuery();

  const formats = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const activeSlots = activeData?.slots ?? [];
  const currentSessionId = activeData?.currentSessionId ?? null;

  const sessionLabel = useMemo(() => {
    if (currentSessionId === null) return null;
    const session = academicSessions?.member?.find((s) => s.id === currentSessionId);
    return session?.name ?? null;
  }, [academicSessions, currentSessionId]);

  const draftCount = useMemo(
    () => formats.filter((f) => f.status === "DRAFT").length,
    [formats],
  );

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  const slotsSectionError = useMemo(
    () =>
      deriveSectionErrorMessage(slotsIsError, slotsError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [slotsIsError, slotsError],
  );

  const activeFilterCount =
    (state.statusFilter !== undefined ? 1 : 0) +
    (state.entryModeFilter !== "ANY" ? 1 : 0);
  const isFilterActive = activeFilterCount > 0;
  const isSearchActive = state.search.trim().length > 0;
  const hasData = formats.length > 0;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: MatricNumberFormatTabActionType.SetSearch, value });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({ type: MatricNumberFormatTabActionType.SetDebouncedSearch, value });
    }, 300);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: import("../types/matric-number-format").MatricFormatStatus | undefined) => {
      dispatch({ type: MatricNumberFormatTabActionType.SetStatusFilter, value });
    },
    [],
  );

  const handleEntryModeFilterChange = useCallback(
    (value: import("../state/matricNumberFormatTabState").MatricNumberFormatTabFilterSlot) => {
      dispatch({ type: MatricNumberFormatTabActionType.SetEntryModeFilter, value });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: MatricNumberFormatTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenCreate });
  }, []);

  const handleOpenCreateForSlot = useCallback((entryMode: MatricFormatSlot) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenCreateForSlot, entryMode });
  }, []);

  const handleCloseCreate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseCreate });
  }, []);

  const handleOpenBuilder = useCallback((format: MatricNumberFormat, readOnly: boolean) => {
    dispatch({
      type: MatricNumberFormatTabActionType.OpenBuilder,
      formatId: format.id,
      readOnly,
    });
  }, []);

  const handleCloseBuilder = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseBuilder });
  }, []);

  const handleOpenDuplicate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenDuplicate, target: format });
  }, []);

  const handleCloseDuplicate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseDuplicate });
  }, []);

  const handleOpenActivate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenActivate, target: format });
  }, []);

  const handleCloseActivate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseActivate });
  }, []);

  const handleOpenDeactivate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenDeactivate, target: format });
  }, []);

  const handleCloseDeactivate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseDeactivate });
  }, []);

  const handleOpenReactivate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenReactivate, target: format });
  }, []);

  const handleCloseReactivate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseReactivate });
  }, []);

  const handleCreated = useCallback((format: MatricNumberFormat) => {
    handleOpenBuilder(format, false);
  }, [handleOpenBuilder]);

  const handleDuplicated = useCallback((format: MatricNumberFormat) => {
    handleOpenBuilder(format, false);
  }, [handleOpenBuilder]);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.SetStatusFilter, value: undefined });
    dispatch({ type: MatricNumberFormatTabActionType.SetEntryModeFilter, value: "ANY" });
  }, []);

  const buildRowMenuItems = useCallback(
    (record: MatricNumberFormat): MenuProps["items"] => {
      const items: MenuProps["items"] = [];
      const slotLocked = !canActivateDraft(record, activeSlots) && record.status === "DRAFT";

      if (record.status === "DRAFT") {
        if (canUpdate) {
          items.push({
            key: "edit",
            label: MATRIC_NUMBER_FORMAT_UI_COPY.actionEdit,
            icon: createElement(EditOutlined),
            onClick: () => handleOpenBuilder(record, false),
          });
        }
        if (canActivate) {
          items.push({
            key: "activate",
            label: MATRIC_NUMBER_FORMAT_UI_COPY.actionActivate,
            icon: createElement(RocketOutlined),
            disabled:
              slotLocked ||
              !isPrerequisitesReadyForTemplate(prerequisites, record.template),
            title: slotLocked ? MATRIC_NUMBER_FORMAT_UI_COPY.actionActivateSlotLocked : undefined,
            onClick: () => handleOpenActivate(record),
          });
        }
        return items;
      }

      items.push({
        key: "view",
        label: MATRIC_NUMBER_FORMAT_UI_COPY.actionView,
        icon: createElement(EyeOutlined),
        onClick: () => handleOpenBuilder(record, true),
      });

      if (canCreate) {
        items.push({
          key: "duplicate",
          label: MATRIC_NUMBER_FORMAT_UI_COPY.actionDuplicate,
          icon: createElement(CopyOutlined),
          onClick: () => handleOpenDuplicate(record),
        });
      }

      if (record.status === "INACTIVE" && canActivate && canReactivateInactive(record, activeSlots)) {
        items.push({
          key: "reactivate",
          label: MATRIC_NUMBER_FORMAT_UI_COPY.actionReactivate,
          icon: createElement(RocketOutlined),
          onClick: () => handleOpenReactivate(record),
        });
      }

      if (record.status === "ACTIVE" && canActivate) {
        const deactivateLocked = !canDeactivateActive(record, activeSlots);
        items.push({ type: "divider" });
        items.push({
          key: "deactivate",
          label: MATRIC_NUMBER_FORMAT_UI_COPY.actionDeactivate,
          icon: createElement(StopOutlined),
          danger: true,
          disabled: deactivateLocked,
          title: deactivateLocked
            ? MATRIC_NUMBER_FORMAT_UI_COPY.actionDeactivateSlotLocked
            : undefined,
          onClick: () => handleOpenDeactivate(record),
        });
      }

      return items;
    },
    [
      activeSlots,
      canActivate,
      canCreate,
      canUpdate,
      handleOpenActivate,
      handleOpenBuilder,
      handleOpenDeactivate,
      handleOpenDuplicate,
      handleOpenReactivate,
      prerequisites,
    ],
  );

  const getActivateSlotPeer = useCallback(
    (target: MatricNumberFormat | null) =>
      target ? findLiveFormatInSlot(activeSlots, target.entryMode) : null,
    [activeSlots],
  );

  return {
    state: {
      formats,
      totalItems,
      isLoading,
      isError,
      sectionError,
      activeSlots,
      currentSessionId,
      sessionLabel,
      slotsLoading,
      slotsSectionError,
      draftCount,
      prerequisites,
      search: state.search,
      statusFilter: state.statusFilter,
      entryModeFilter: state.entryModeFilter,
      page: state.page,
      builderFormatId: state.builderFormatId,
      builderReadOnly: state.builderReadOnly,
      builderOpen: state.builderOpen,
      createOpen: state.createOpen,
      createEntryMode: state.createEntryMode,
      duplicateTarget: state.duplicateTarget,
      activateTarget: state.activateTarget,
      deactivateTarget: state.deactivateTarget,
      reactivateTarget: state.reactivateTarget,
      getActivateSlotPeer,
      matricSlotLabel,
    },
    actions: {
      handleSearchChange,
      handleStatusFilterChange,
      handleEntryModeFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenCreateForSlot,
      handleCloseCreate,
      handleOpenBuilder,
      handleCloseBuilder,
      handleOpenDuplicate,
      handleCloseDuplicate,
      handleOpenActivate,
      handleCloseActivate,
      handleOpenDeactivate,
      handleCloseDeactivate,
      handleOpenReactivate,
      handleCloseReactivate,
      handleCreated,
      handleDuplicated,
      clearAllFilters,
      buildRowMenuItems,
      refetch,
      refetchActiveSlots,
    },
    flags: {
      hasData,
      isFilterActive,
      isSearchActive,
      activeFilterCount,
      prerequisitesReady: normalizeMatricPrerequisites(prerequisites)?.ready ?? false,
      canUpdate,
      canCreate,
      canActivate,
    },
  };
}
