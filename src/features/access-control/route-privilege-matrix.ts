import { appPaths } from "@/app/routing/app-path";
import { Permission } from "./permissions";

export const routePrivilegeMatrix: Record<string, Permission[]> = {
  [appPaths.dashboard]: [],
  [appPaths.staff]: [Permission.StaffList],
  [appPaths.students]: [Permission.StudentsList],
  [appPaths.academicStructure]: [Permission.FacultiesList],
  [appPaths.settings]: [Permission.SystemConfigsList],
  [appPaths.courseRegistration]: [Permission.StudentCourseRegistrationsManage],
};
