import withAuthGuard from "@/features/auth/with-auth-guard";
import { lazy } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import { appPaths } from "./app-path";
import DashboardShell from "./dashboard-shell";
import RouterShell from "./router-shell";

const Login = lazy(() => import("@/features/auth/components/Login"));
const SignUp = lazy(() => import("@/features/auth/components/SignUp"));
const ForgotPassword = lazy(
  () => import("@/features/auth/components/ForgotPassword"),
);
const Dashboard = lazy(
  () => import("@/features/dashboard/components/Dashboard"),
);
const AcademicStructure = lazy(() =>
  import("@/features/academic-structure/components/AcademicStructurePage").then(
    (m) => ({
      default: m.AcademicStructurePage,
    }),
  ),
);
const Settings = lazy(() => import("@/features/settings/components/Settings"));
const GradingConfigPage = lazy(() =>
  import("@/features/grading-config").then((m) => ({
    default: m.GradingConfigPage,
  })),
);

const GuardedDashboardShell = withAuthGuard({
  Component: DashboardShell,
  fallback: null,
});

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<RouterShell />} />
        <Route index element={<Navigate to={appPaths.dashboard} replace />} />
        <Route path={appPaths.login} element={<Login />} />
        <Route path={appPaths.signUp} element={<SignUp />} />
        <Route path={appPaths.forgotPassword} element={<ForgotPassword />} />
        <Route path={appPaths.unauthorized} element={<Unauthorized />} />

        <Route path="/" element={<GuardedDashboardShell />}>
          {/* <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="academic-structure" element={<AcademicStructure />} />
          <Route path="settings" element={<Settings />} />
          <Route path="grading-config" element={<GradingConfigPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={appPaths.dashboard} replace />}
        />
      </Routes>
    </Router>
  );
}

function Unauthorized() {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Unauthorized</h2>
      <p>You do not have access to this resource.</p>
    </div>
  );
}
