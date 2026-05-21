// Feature: grading-config — Grading System Boundary tab hook
import { useCallback, useState } from "react";
import { useListGradingSystemsQuery } from "../../grading-system/api/gradingSystemApi";
import type { GradingSystem } from "../../grading-system/types/grading-system";
import { useListGradingSystemBoundariesQuery } from "../api/gradingSystemBoundaryApi";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";

export function useGradingSystemBoundaryTab(): {
  state: {
    gradingSystemId: number | null;
    upsertOpen: boolean;
    upsertTarget: GradingSystemBoundary | null;
    deleteOpen: boolean;
    deleteTarget: GradingSystemBoundary | null;
    systems: GradingSystem[];
    systemsLoading: boolean;
    boundaries: GradingSystemBoundary[];
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
  };
  actions: {
    handleSystemChange: (id: number | null) => void;
    handleOpenUpsert: (target?: GradingSystemBoundary) => void;
    handleCloseUpsert: () => void;
    handleOpenDelete: (target: GradingSystemBoundary) => void;
    handleCloseDelete: () => void;
    refetch: () => void;
  };
  flags: {
    hasSystemSelected: boolean;
    hasData: boolean;
  };
} {
  // Selected grading system
  const [gradingSystemId, setGradingSystemId] = useState<number | null>(null);

  // Upsert modal state
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertTarget, setUpsertTarget] =
    useState<GradingSystemBoundary | null>(null);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<GradingSystemBoundary | null>(null);

  // Fetch grading systems for the selector (always active)
  const { data: systemsData, isLoading: systemsLoading } =
    useListGradingSystemsQuery({ sort: "name:asc", itemsPerPage: 100 });

  const systems = systemsData?.member ?? [];

  // Fetch boundaries only when a system is selected
  const {
    data: boundariesData,
    isLoading,
    isError,
    refetch,
  } = useListGradingSystemBoundariesQuery(
    {
      "exact[gradingSystemId]": gradingSystemId ?? undefined,
      sort: "minScore:desc",
    },
    { skip: gradingSystemId === null },
  );

  const boundaries = boundariesData?.member ?? [];
  const totalItems = boundariesData?.totalItems ?? 0;

  // Handlers
  const handleSystemChange = useCallback((id: number | null) => {
    setGradingSystemId(id);
    // Close any open modals when switching systems
    setUpsertOpen(false);
    setUpsertTarget(null);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  const handleOpenUpsert = useCallback((target?: GradingSystemBoundary) => {
    setUpsertTarget(target ?? null);
    setUpsertOpen(true);
  }, []);

  const handleCloseUpsert = useCallback(() => {
    setUpsertOpen(false);
    setUpsertTarget(null);
  }, []);

  const handleOpenDelete = useCallback((target: GradingSystemBoundary) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, []);

  return {
    state: {
      gradingSystemId,
      upsertOpen,
      upsertTarget,
      deleteOpen,
      deleteTarget,
      systems,
      systemsLoading,
      boundaries,
      totalItems,
      isLoading,
      isError,
    },
    actions: {
      handleSystemChange,
      handleOpenUpsert,
      handleCloseUpsert,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasSystemSelected: gradingSystemId !== null,
      hasData: boundaries.length > 0,
    },
  };
}
