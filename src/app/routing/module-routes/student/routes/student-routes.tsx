import withAuthGuard from "@/features/auth/with-auth-guard";
import { lazy } from "react";
import { Route } from "react-router-dom";

const StudentHomePage = lazy(
  () => import("@/features/student-home/components/StudentHomePage"),
);

function StudentShell() {
  return <StudentHomePage />;
}

const GuardedStudentShell = withAuthGuard({
  Component: StudentShell,
  fallback: null,
});

export function getStudentRouteEntries() {
  return (
    <>
      <Route path="/student" element={<GuardedStudentShell />} />
    </>
  );
}
