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

const StudentInvoicesPage = lazy(() =>
  import("@/features/student-invoices").then((m) => ({
    default: m.StudentInvoicesPage,
  })),
);

const StudentInvoicePayPage = lazy(() =>
  import("@/features/student-invoices").then((m) => ({
    default: m.StudentInvoicePayPage,
  })),
);

const StudentPaymentsPage = lazy(() =>
  import("@/features/student-payments").then((m) => ({
    default: m.StudentPaymentsPage,
  })),
);

const StudentPaymentReceiptPage = lazy(() =>
  import("@/features/student-payments").then((m) => ({
    default: m.StudentPaymentReceiptPage,
  })),
);

const CandidateBioDataPage = lazy(() =>
  import("@/features/candidate-profile").then((m) => ({
    default: m.CandidateBioDataPage,
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
          <Route path="invoices" element={<StudentInvoicesPage />} />
          <Route path="invoices/:invoiceId" element={<StudentInvoicePayPage />} />
          <Route path="payments" element={<StudentPaymentsPage />} />
          <Route
            path="payments/:paymentId"
            element={<StudentPaymentReceiptPage />}
          />
          <Route path="bio-data" element={<CandidateBioDataPage />} />
        </Route>
      </Route>
    </>
  );
}
