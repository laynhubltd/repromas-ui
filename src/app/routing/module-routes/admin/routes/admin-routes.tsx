import DashboardShell from "@/app/routing/dashboard-shell";
import ProtectedRoute from "@/app/routing/protected-route";
import SetupGatedRoute from "@/app/routing/setup-gated-route";
import withAuthGuard from "@/features/auth/with-auth-guard";
import { lazy } from "react";
import { Route } from "react-router-dom";

const Dashboard = lazy(
  () => import("@/features/dashboard/components/Dashboard"),
);
const AcademicStructure = lazy(() =>
  import("@/features/academic-structure").then((m) => ({
    default: m.AcademicStructure,
  })),
);
const Settings = lazy(() => import("@/features/settings/components/Settings"));
const ProgramPage = lazy(() =>
  import("@/features/program/components/ProgramPage").then((m) => ({
    default: m.ProgramPage,
  })),
);

const StudentPage = lazy(() =>
  import("@/features/student").then((m) => ({ default: m.StudentPage })),
);

const StaffPage = lazy(() =>
  import("@/features/staff").then((m) => ({ default: m.StaffPage })),
);

const CoursePage = lazy(() =>
  import("@/features/courses/components/CoursePage").then((m) => ({
    default: m.CoursePage,
  })),
);

const CourseRegistrationPage = lazy(() =>
  import("@/features/course-registration").then((m) => ({
    default: m.CourseRegistrationPage,
  })),
);

const GradingConfigPage = lazy(() =>
  import("@/features/grading-config").then((m) => ({
    default: m.GradingConfigPage,
  })),
);

const AdmissionConfigPage = lazy(() =>
  import("@/features/admission-config").then((m) => ({
    default: m.AdmissionConfigPage,
  })),
);

const AdmissionCandidatePage = lazy(() =>
  import(
    "@/features/admission-candidate/components/AdmissionCandidatePage"
  ).then((m) => ({
    default: m.AdmissionCandidatePage,
  })),
);

const AssessmentPage = lazy(() =>
  import("@/features/assessment").then((m) => ({
    default: m.AssessmentPage,
  })),
);

const StudentTransitionsPage = lazy(() =>
  import("@/features/student-transitions").then((m) => ({
    default: m.StudentTransitionsPage,
  })),
);

const ResultBroadsheetPage = lazy(() =>
  import("@/features/result-broadsheet").then((m) => ({
    default: m.ResultBroadsheetPage,
  })),
);

const BillingPage = lazy(() =>
  import("@/features/billing").then((m) => ({
    default: m.BillingPage,
  })),
);

const ProfilePage = lazy(() =>
  import("@/features/profile").then((m) => ({
    default: m.ProfilePage,
  })),
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
        <Route path="profile" element={<ProfilePage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<SetupGatedRoute />}>
            <Route path="academic-structure" element={<AcademicStructure />} />
            <Route path="settings" element={<Settings />} />
            <Route path="program" element={<ProgramPage />} />
            <Route path="students" element={<StudentPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="courses" element={<CoursePage />} />
            <Route
              path="course-registration"
              element={<CourseRegistrationPage />}
            />
            <Route path="grading-config" element={<GradingConfigPage />} />
            <Route path="admission-config" element={<AdmissionConfigPage />} />
            <Route
              path="admission-candidates"
              element={<AdmissionCandidatePage />}
            />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route
              path="results/broadsheet"
              element={<ResultBroadsheetPage />}
            />
            <Route
              path="student-transitions"
              element={<StudentTransitionsPage />}
            />
            <Route path="billing" element={<BillingPage />} />
          </Route>
        </Route>
      </Route>
    </>
  );
}
