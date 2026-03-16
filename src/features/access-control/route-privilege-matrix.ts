import { appPaths } from "@/routing/app-path";
import { Privilege } from "./privileges-enum";

export const routePrivilegeMatrix: Record<string, string[]> = {
  [appPaths.dashboard]: [Privilege.DashboardRead],
};
