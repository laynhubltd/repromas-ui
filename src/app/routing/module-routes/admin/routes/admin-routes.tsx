import DashboardShell from "@/app/routing/dashboard-shell";
import ProtectedRoute from "@/app/routing/protected-route";
import withAuthGuard from "@/features/auth/with-auth-guard";
import { lazy } from "react";
import { Route } from "react-router-dom";

const Dashboard = lazy(
  () => import("@/features/dashboard/components/Dashboard")
);
const AcademicStructure = lazy(
  () =>
    import("@/features/academic-structure").then((m) => ({
      default: m.AcademicStructure,
    }))
);
const Settings = lazy(() => import("@/features/settings/components/Settings"));

const GuardedDashboardShell = withAuthGuard({
  Component: DashboardShell,
  fallback: null,
});

export function getAdminRouteEntries() {
  return (
    <>
      <Route path="/" element={<GuardedDashboardShell />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route element={<ProtectedRoute />}>
          <Route path="academic-structure" element={<AcademicStructure />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </>
  );
}
