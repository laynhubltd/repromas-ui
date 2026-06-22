export type QueryHttpStatus = number | null;

export function getQueryHttpStatus(error: unknown): QueryHttpStatus {
  if (!error || typeof error !== "object") return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}
