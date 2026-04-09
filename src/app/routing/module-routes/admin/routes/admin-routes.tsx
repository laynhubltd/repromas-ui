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
const ProgramPage = lazy(() =>
  import("@/features/program/components/ProgramPage").then((m) => ({
    default: m.ProgramPage,
  }))
);

const StudentPage = lazy(() =>
  import("@/features/student").then((m) => ({ default: m.StudentPage }))
);

const StaffPage = lazy(() =>
  import("@/features/staff").then((m) => ({ default: m.StaffPage }))
);

const CoursePage = lazy(() =>
  import("@/features/courses/components/CoursePage").then((m) => ({
    default: m.CoursePage,
  }))
);

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
          <Route path="program" element={<ProgramPage />} />
          <Route path="students" element={<StudentPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="courses" element={<CoursePage />} />
        </Route>
      </Route>
    </>
  );
}
