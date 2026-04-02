import { appPaths } from "@/app/routing/app-path";
import { Permission } from "./permissions";

export const routePrivilegeMatrix: Record<string, Permission[]> = {
  [appPaths.dashboard]:          [],
  [appPaths.staffs]:             [Permission.RolesList],
  [appPaths.academicStructure]:  [Permission.FacultiesList],
  [appPaths.settings]:           [Permission.SystemConfigsList],
};
