import { matchPath } from "react-router-dom";
import { routePrivilegeMatrix } from "./route-privilege-matrix";

const READ_SUFFIX = ":re";

export function hasRouteReadAccess({
  userPrivileges,
  routePath,
}: {
  userPrivileges?: string[];
  routePath: string;
}): boolean {
  const matchedKey = Object.keys(routePrivilegeMatrix).find((key) =>
    matchPath({ path: key, end: false }, routePath),
  );
  if (!matchedKey) return true; // no matrix entry => allow
  const required = routePrivilegeMatrix[matchedKey] ?? [];
  const readPrivileges = required.filter((p) => p.endsWith(READ_SUFFIX));
  if (readPrivileges.length === 0) return true;
  return readPrivileges.some((p) => userPrivileges?.includes(p));
}
