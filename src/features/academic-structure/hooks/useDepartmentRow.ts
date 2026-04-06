// Feature: faculty-department-management
import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { Department } from "../types/faculty";

export function useDepartmentRow(department: Department): {
  state: Record<string, never>;
  actions: Record<string, never>;
  flags: { canEdit: boolean; canDelete: boolean };
} {
  const { activeRole, hasPermission } = useAccessControl();

  let canEdit: boolean;
  let canDelete: boolean;

  if (activeRole?.scope === "FACULTY") {
    // scopeReferenceId is string | null; facultyId is number — compare via Number()
    const scopeRefId = activeRole.scopeReferenceId != null
      ? Number(activeRole.scopeReferenceId)
      : null;
    const scopeMatch = department.facultyId === scopeRefId;
    canEdit = hasPermission(Permission.DepartmentsUpdate) && scopeMatch;
    canDelete = hasPermission(Permission.DepartmentsDelete) && scopeMatch;
  } else {
    // GLOBAL scope or no scope
    canEdit = hasPermission(Permission.DepartmentsUpdate);
    canDelete = hasPermission(Permission.DepartmentsDelete);
  }

  return {
    state: {},
    actions: {},
    flags: { canEdit, canDelete },
  };
}
