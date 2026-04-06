// Feature: faculty-department-management
import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useState } from "react";
import { useGetDepartmentsQuery } from "../api/departmentsApi";
import type { Department } from "../types/faculty";

export function useFacultyRow(facultyId: number, isExpanded: boolean): {
  state: {
    departments: Department[];
    isLoading: boolean;
    isError: boolean;
    nameSearch: string;
    codeSearch: string;
    editTarget: Department | null;
    deleteTarget: Department | null;
  };
  actions: {
    handleNameSearchChange: (value: string) => void;
    handleCodeSearchChange: (value: string) => void;
    handleOpenEdit: (dept: Department) => void;
    handleOpenDelete: (dept: Department) => void;
    handleCloseEdit: () => void;
    handleCloseDelete: () => void;
    refetch: () => void;
  };
  flags: {
    hasData: boolean;
    isSearchActive: boolean;
    canCreateDept: boolean;
    canEditDept: (dept: Department) => boolean;
    canDeleteDept: (dept: Department) => boolean;
  };
} {
  // Search state is preserved across collapse/re-expand (not reset on collapse)
  const [nameSearch, setNameSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const { activeRole, hasPermission } = useAccessControl();

  const { data, isLoading, isError, refetch } = useGetDepartmentsQuery(
    {
      "exact[facultyId]": facultyId,
      ...(nameSearch ? { "search[name]": nameSearch } : {}),
      ...(codeSearch ? { "search[code]": codeSearch } : {}),
    },
    { skip: !isExpanded }
  );

  const departments = data?.member ?? [];

  // RBAC flags
  const isFacultyScope = activeRole?.scope === "FACULTY";

  // scopeReferenceId is string | null; facultyId is number — compare via Number()
  const scopeRefId = activeRole?.scopeReferenceId != null
    ? Number(activeRole.scopeReferenceId)
    : null;

  const canCreateDept = isFacultyScope
    ? hasPermission(Permission.DepartmentsCreate) && scopeRefId === facultyId
    : hasPermission(Permission.DepartmentsCreate);

  const canEditDept = (dept: Department): boolean => {
    if (isFacultyScope) {
      return (
        hasPermission(Permission.DepartmentsUpdate) &&
        dept.facultyId === scopeRefId
      );
    }
    return hasPermission(Permission.DepartmentsUpdate);
  };

  const canDeleteDept = (dept: Department): boolean => {
    if (isFacultyScope) {
      return (
        hasPermission(Permission.DepartmentsDelete) &&
        dept.facultyId === scopeRefId
      );
    }
    return hasPermission(Permission.DepartmentsDelete);
  };

  const isSearchActive = nameSearch.trim().length > 0 || codeSearch.trim().length > 0;

  return {
    state: {
      departments,
      isLoading,
      isError,
      nameSearch,
      codeSearch,
      editTarget,
      deleteTarget,
    },
    actions: {
      handleNameSearchChange: setNameSearch,
      handleCodeSearchChange: setCodeSearch,
      handleOpenEdit: setEditTarget,
      handleOpenDelete: setDeleteTarget,
      handleCloseEdit: () => setEditTarget(null),
      handleCloseDelete: () => setDeleteTarget(null),
      refetch,
    },
    flags: {
      hasData: departments.length > 0,
      isSearchActive,
      canCreateDept,
      canEditDept,
      canDeleteDept,
    },
  };
}
