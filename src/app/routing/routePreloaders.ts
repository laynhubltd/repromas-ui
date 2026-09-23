/**
 * Route preloaders — triggers module download on hover / focus of menu items
 * before the user clicks, providing near-instantaneous page transitions.
 */

const preloadedMap = new Set<string>();

const ROUTE_CHUNK_LOADERS: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("@/features/dashboard/components/Dashboard"),
  "/academic-structure": () => import("@/features/academic-structure"),
  "/settings": () => import("@/features/settings/components/Settings"),
  "/program": () => import("@/features/program/components/ProgramPage"),
  "/students": () => import("@/features/student"),
  "/staff": () => import("@/features/staff"),
  "/courses": () => import("@/features/courses/components/CoursePage"),
  "/course-registration": () => import("@/features/course-registration"),
  "/grading-config": () => import("@/features/grading-config"),
  "/admission-config": () => import("@/features/admission-config"),
  "/admission-candidates": () =>
    import("@/features/admission-candidate/components/AdmissionCandidatePage"),
  "/assessment": () => import("@/features/assessment"),
  "/results/broadsheet": () => import("@/features/result-broadsheet"),
  "/student-transitions": () => import("@/features/student-transitions"),
  "/billing": () => import("@/features/billing"),
  "/profile": () => import("@/features/profile"),
  "/student": () => import("@/features/student-home"),
  "/invoices": () => import("@/features/student-invoices"),
  "/payments": () => import("@/features/student-payments"),
  "/bio-data": () => import("@/features/candidate-profile"),
  "/admission": () => import("@/features/student-admission"),
  "/application": () => import("@/features/admission-application"),
};

export function preloadRoute(path: string): void {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (preloadedMap.has(normalized)) return;

  const loader = ROUTE_CHUNK_LOADERS[normalized];
  if (loader) {
    preloadedMap.add(normalized);
    loader().catch(() => {
      preloadedMap.delete(normalized);
    });
  }
}
