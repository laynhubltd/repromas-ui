export { hasRouteReadAccess } from "./access-control-util";
export {
  hasStudentPortalScope,
  hasStudentRouteAccess,
} from "./student-access-control-util";
export { PermissionGuard } from "./PermissionGuard";
export { ScopeGuard } from "./ScopeGuard";
export type { Permission } from "./permissions";
export type { StudentPortalScope } from "./student-portal-scopes";
export {
  STUDENT_PORTAL_SCOPES,
  normalizeStudentPortalScope,
} from "./student-portal-scopes";
export { useAccessControl } from "./use-access-control";
