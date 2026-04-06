// Feature: faculty-department-management
import { useAccessControl } from "@/features/access-control";
import { useEffect, useState } from "react";
import { useGetFacultiesQuery } from "../api/facultiesApi";
import type { Faculty } from "../types/faculty";

export function useHierarchyView(): {
  state: {
    faculties: Faculty[];
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
    page: number;
    itemsPerPage: number;
    nameSearch: string;
    codeSearch: string;
    sort: string;
    expandedIds: Set<number>;
    createModalOpen: boolean;
    editTarget: Faculty | null;
    deleteTarget: Faculty | null;
    addDeptTarget: Faculty | null;
  };
  actions: {
    handleNameSearchChange: (value: string) => void;
    handleCodeSearchChange: (value: string) => void;
    handleSortChange: (field: string, direction: "asc" | "desc") => void;
    handlePageChange: (page: number, pageSize: number) => void;
    handleToggleExpand: (id: number) => void;
    handleOpenCreate: () => void;
    handleOpenEdit: (faculty: Faculty) => void;
    handleOpenDelete: (faculty: Faculty) => void;
    handleOpenAddDept: (faculty: Faculty) => void;
    handleCloseCreate: () => void;
    handleCloseEdit: () => void;
    handleCloseDelete: () => void;
    handleCloseAddDept: () => void;
    refetch: () => void;
  };
  flags: {
    hasData: boolean;
    isSearchActive: boolean;
  };
} {
  const { activeRole } = useAccessControl();

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search
  const [nameSearch, setNameSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");

  // Sort
  const [sort, setSort] = useState("");

  // Expand state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    // Dean auto-expand on mount
    if (
      activeRole?.scope === "FACULTY" &&
      activeRole.scopeReferenceId != null
    ) {
      return new Set([Number(activeRole.scopeReferenceId)]);
    }
    return new Set<number>();
  });

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [addDeptTarget, setAddDeptTarget] = useState<Faculty | null>(null);

  // Dean auto-expand: also handle when activeRole changes after mount
  useEffect(() => {
    if (
      activeRole?.scope === "FACULTY" &&
      activeRole.scopeReferenceId != null
    ) {
      const id = Number(activeRole.scopeReferenceId);
      setExpandedIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  }, [activeRole?.scope, activeRole?.scopeReferenceId]);

  const queryParams = {
    page,
    itemsPerPage,
    ...(nameSearch ? { "search[name]": nameSearch } : {}),
    ...(codeSearch ? { "search[code]": codeSearch } : {}),
    ...(sort ? { sort } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetFacultiesQuery(queryParams);

  const faculties = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setSort(`${field}:${direction}`);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setItemsPerPage(newPageSize);
  };

  const isSearchActive =
    nameSearch.trim().length > 0 || codeSearch.trim().length > 0;

  return {
    state: {
      faculties,
      totalItems,
      isLoading,
      isError,
      page,
      itemsPerPage,
      nameSearch,
      codeSearch,
      sort,
      expandedIds,
      createModalOpen,
      editTarget,
      deleteTarget,
      addDeptTarget,
    },
    actions: {
      handleNameSearchChange: setNameSearch,
      handleCodeSearchChange: setCodeSearch,
      handleSortChange,
      handlePageChange,
      handleToggleExpand,
      handleOpenCreate: () => setCreateModalOpen(true),
      handleOpenEdit: setEditTarget,
      handleOpenDelete: setDeleteTarget,
      handleOpenAddDept: setAddDeptTarget,
      handleCloseCreate: () => setCreateModalOpen(false),
      handleCloseEdit: () => setEditTarget(null),
      handleCloseDelete: () => setDeleteTarget(null),
      handleCloseAddDept: () => setAddDeptTarget(null),
      refetch,
    },
    flags: {
      hasData: faculties.length > 0,
      isSearchActive,
    },
  };
}
