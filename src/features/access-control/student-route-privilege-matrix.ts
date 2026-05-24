import { appPaths } from "@/app/routing/app-path";
import { StudentPortalScope } from "./student-portal-scopes";

/**
 * Student portal route allow-list by activeRole.scope.
 * Keep allowedScopes in sync with student-route-menu-config.tsx.
 */
export const studentRoutePrivilegeMatrix: Record<string, StudentPortalScope[]> =
  {
  [appPaths.studentHome]: [
    StudentPortalScope.Student,
    StudentPortalScope.Candidate,
  ],
  [appPaths.courseRegistration]: [StudentPortalScope.Student],
};
