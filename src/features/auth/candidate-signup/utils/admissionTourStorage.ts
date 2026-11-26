const TOUR_STORAGE_PREFIX = "repromas:login_admission_tour";

/** Builds a tenant-host and cycle-scoped storage key for tour dismissal. */
export function getAdmissionTourStorageKey(cycleId: number): string {
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname || "default"
      : "default";
  return `${TOUR_STORAGE_PREFIX}:${hostname}:${cycleId}`;
}

/** Returns true if the admission guide was already dismissed for this cycle. */
export function isAdmissionTourDismissed(cycleId: number): boolean {
  try {
    return (
      window.localStorage.getItem(getAdmissionTourStorageKey(cycleId)) === "1"
    );
  } catch {
    return false;
  }
}

/** Persists tour dismissal for the given cycle, ignoring storage errors. */
export function markAdmissionTourDismissed(cycleId: number): void {
  try {
    window.localStorage.setItem(getAdmissionTourStorageKey(cycleId), "1");
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}
