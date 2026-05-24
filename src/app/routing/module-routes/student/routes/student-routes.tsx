import StudentProtectedRoute from "@/app/routing/student-protected-route";
import StudentShell from "@/app/routing/student-shell";
import withAuthGuard from "@/features/auth/with-auth-guard";
import { lazy } from "react";
import { Route } from "react-router-dom";

const StudentHomePage = lazy(
  () => import("@/features/student-home/components/StudentHomePage"),
);

const CourseRegistrationPage = lazy(() =>
  import("@/features/course-registration").then((m) => ({
    default: m.CourseRegistrationPage,
  })),
);

const GuardedStudentShell = withAuthGuard({
  Component: StudentShell,
  fallback: null,
});

export function getStudentRouteEntries() {
  return (
    <>
      <Route path="/" element={<GuardedStudentShell />}>
        <Route element={<StudentProtectedRoute />}>
          <Route path="student" element={<StudentHomePage />} />
          <Route
            path="course-registration"
            element={<CourseRegistrationPage />}
          />
        </Route>
      </Route>
    </>
  );
}
