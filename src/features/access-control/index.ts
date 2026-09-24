export { hasRouteReadAccess } from "./access-control-util";
export {
  hasStudentPortalScope,
  hasStudentRouteAccess,
} from "./student-access-control-util";
export { PermissionGuard, type PermissionGuardProps } from "./PermissionGuard";
export { ScopeGuard } from "./ScopeGuard";
export { Permission } from "./permissions";
export type { Permission as PermissionType } from "./permissions";
export type { StudentPortalScope } from "./student-portal-scopes";
export {
  STUDENT_PORTAL_SCOPES,
  normalizeStudentPortalScope,
} from "./student-portal-scopes";
export { useAccessControl, usePermitted } from "./use-access-control";

// Layer 0: Policy Core
export type { PermissionRequirement } from "./types";
export { isPermitted } from "./evaluate";

// Layer 2: Headless Engines
export {
  filterPermittedMenuItems,
  usePermittedMenuItems,
  type PermittedMenuItem,
} from "./permitted-menu";
export {
  filterPermittedGroups,
  filterPermittedTabs,
  usePermittedGroups,
} from "./permitted-tabs";
export {
  filterPermittedSegmentedOptions,
  usePermittedSegmentedOptions,
  type PermittedSegmentedOption,
} from "./permitted-segmented";

// Layer 3: Presentational Adapters
export {
  PermittedDropdown,
  type PermittedDropdownProps,
} from "./PermittedDropdown";
export { routePrivilegeMatrix } from "./route-privilege-matrix";
