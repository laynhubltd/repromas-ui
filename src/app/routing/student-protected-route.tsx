import { useAccessControl } from "@/features/access-control";
import useAuthState from "@/features/auth/use-auth-state";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { appPaths } from "./app-path";

export default function StudentProtectedRoute() {
  const location = useLocation();
  const { token } = useAuthState();
  const { canAccessStudentRoute } = useAccessControl();

  if (!token) {
    return <Navigate to={appPaths.login} replace />;
  }

  if (!canAccessStudentRoute(location.pathname)) {
    return <Navigate to={appPaths.unauthorized} replace />;
  }

  return <Outlet />;
}
