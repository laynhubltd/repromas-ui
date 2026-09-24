import { matchPath } from "react-router-dom";
import { isPermitted } from "./evaluate";
import { routePrivilegeMatrix } from "./route-privilege-matrix";

export function hasRouteReadAccess({
  userPermissions,
  routePath,
}: {
  userPermissions: string[];
  routePath: string;
}): boolean {
  const matchedKey = Object.keys(routePrivilegeMatrix).find((key) =>
    matchPath({ path: key, end: false }, routePath),
  );

  if (!matchedKey) return true; // no matrix entry => allow

  const requirement = routePrivilegeMatrix[matchedKey];
  return isPermitted(userPermissions, requirement);
}
