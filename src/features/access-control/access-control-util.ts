import { matchPath } from "react-router-dom";
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

  const required = routePrivilegeMatrix[matchedKey] ?? [];
  
  if (required.length === 0) return true; // empty entry => open to authenticated users
  
  return required.some((p) => userPermissions.includes(p));
}
