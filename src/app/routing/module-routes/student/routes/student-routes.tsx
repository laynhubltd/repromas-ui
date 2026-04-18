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

function StudentShell() {
  return <StudentHomePage />;
}

const GuardedStudentShell = withAuthGuard({
  Component: StudentShell,
  fallback: null,
});

const GuardedCourseRegistration = withAuthGuard({
  Component: CourseRegistrationPage,
  fallback: null,
});

export function getStudentRouteEntries() {
  return (
    <>
      <Route path="/student" element={<GuardedStudentShell />} />
      <Route
        path="/course-registration"
        element={<GuardedCourseRegistration />}
      />
    </>
  );
}
