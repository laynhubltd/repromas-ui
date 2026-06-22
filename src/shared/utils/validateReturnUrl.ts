import { appPaths } from "@/app/routing/app-path";

const ALLOWED_PATHS = new Set<string>([
  appPaths.StudentApply,
  appPaths.StudentApplication,
  appPaths.studentHome,
]);

const STEP_QUERY_PATHS = new Set<string>([appPaths.StudentApply]);

const APPLICATION_ALLOWED_QUERY_KEYS = new Set(["step"]);

function isUnsafeReturnUrl(raw: string): boolean {
  return (
    raw.startsWith("//") ||
    raw.includes("://") ||
    raw.includes("@") ||
    raw.includes("\\")
  );
}

function validateApplicationSearch(searchParams: URLSearchParams): boolean {
  for (const key of searchParams.keys()) {
    if (!APPLICATION_ALLOWED_QUERY_KEYS.has(key)) {
      return false;
    }
  }

  const step = searchParams.get("step");
  if (step == null) return true;

  const parsed = Number.parseInt(step, 10);
  return Number.isFinite(parsed) && parsed >= 0 && String(parsed) === step.trim();
}

export function validateReturnUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || isUnsafeReturnUrl(trimmed)) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed, "http://local");
  } catch {
    return null;
  }

  if (!ALLOWED_PATHS.has(url.pathname)) {
    return null;
  }

  if (STEP_QUERY_PATHS.has(url.pathname)) {
    if (!validateApplicationSearch(url.searchParams)) {
      return null;
    }
    return `${url.pathname}${url.search}`;
  }

  if (url.pathname === appPaths.StudentApplication) {
    if (url.search) {
      return null;
    }
    return url.pathname;
  }

  if (url.search) {
    return null;
  }

  return url.pathname;
}

export function parseWizardStepFromReturnUrl(returnTo: string): number | null {
  const validated = validateReturnUrl(returnTo);
  if (!validated) return null;

  try {
    const url = new URL(validated, "http://local");
    const step = url.searchParams.get("step");
    if (step == null) return null;

    const parsed = Number.parseInt(step, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function buildStudentApplyReturnTo(currentStep: number): string {
  const url = new URL(appPaths.StudentApply, "http://local");
  url.searchParams.set("step", String(currentStep));
  return `${url.pathname}${url.search}`;
}
