import { appPaths } from "@/app/routing/app-path";

export function buildAcknowledgementVerifyUrl(applicationId: number): string {
  const base =
    import.meta.env.VITE_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!base) {
    return `${appPaths.StudentApplication}?ref=${applicationId}`;
  }

  return `${base}${appPaths.StudentApplication}?ref=${applicationId}`;
}
