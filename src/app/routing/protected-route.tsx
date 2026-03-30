import { hasRouteReadAccess } from "@/features/access-control/access-control-util";
import useAuthState from "@/features/auth/use-auth-state";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { appPaths } from "./app-path";

export default function ProtectedRoute() {
  const location = useLocation();
  const { token, currentRole } = useAuthState();
  const routePath = location.pathname;

  if (!token) {
    return <Navigate to={appPaths.login} replace />;
  }

  // Optional: require role selection when multiple profiles exist
  if (token && !currentRole && routePath !== appPaths.roleSelection) {
    // Allow dashboard if no role selection flow is used
    const allowWithoutRole = true;
    if (!allowWithoutRole) {
      return <Navigate to={appPaths.roleSelection} replace />;
    }
  }

  const isAuthorized =
    hasRouteReadAccess({
      userPrivileges: currentRole?.privileges,
      routePath,
    }) ?? true;

  if (!isAuthorized) {
    return <Navigate to={appPaths.unauthorized} replace />;
  }

  return <Outlet />;
}
