/**
 * Idle-session policy core — pure functions, no React, no DOM listeners.
 *
 * Design contract (see OWASP Session Management guidance):
 *  - The SERVER is the authority on session validity (401 → refresh flow).
 *    This layer is a supplementary inactivity policy: UX + shared-machine
 *    hygiene (university lab computers), not a security boundary.
 *  - All comparisons are DURATIONS between two readings of the SAME client
 *    clock (`lastActivityAt` vs `now`). Unlike the removed JWT `exp` checks
 *    (server clock vs client clock), this is immune to clock skew.
 */

export type IdleStatus = "active" | "warning" | "expired";

export type IdleSessionConfig = {
  /** Total inactivity budget before logout. */
  timeoutMs: number;
  /** How long before expiry the warning state begins. */
  warningMs: number;
};

export type IdleSnapshot = {
  status: IdleStatus;
  /** Time left until expiry (0 when expired). */
  msRemaining: number;
};

/** OWASP band for lower-risk applications: 15–30 minutes. */
export const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const DEFAULT_IDLE_WARNING_MS = 2 * 60 * 1000;

/** Shared across tabs so activity in one tab keeps the others alive. */
export const IDLE_LAST_ACTIVITY_KEY = "repromas:lastActivityAt";
/** Per-tab (sessionStorage): lets the login page explain WHY the user is there. */
export const IDLE_LOGOUT_REASON_KEY = "repromas:idleLogoutReason";

/**
 * Classify the session by inactivity duration.
 *
 * Negative elapsed time (system clock moved backwards between readings) is
 * clamped to zero — a clock adjustment must never expire a session.
 */
export function computeIdleState(
  lastActivityAt: number,
  now: number,
  config: IdleSessionConfig,
): IdleSnapshot {
  const elapsed = Math.max(0, now - lastActivityAt);
  const msRemaining = Math.max(0, config.timeoutMs - elapsed);

  if (msRemaining <= 0) {
    return { status: "expired", msRemaining: 0 };
  }
  if (msRemaining <= config.warningMs) {
    return { status: "warning", msRemaining };
  }
  return { status: "active", msRemaining };
}

/**
 * Storage access is wrapped because localStorage can throw (private mode,
 * blocked site data). On failure the caller degrades to per-tab, in-memory
 * tracking — the same policy store.ts applies to redux-persist.
 */
export function readLastActivity(): number | null {
  try {
    const raw = localStorage.getItem(IDLE_LAST_ACTIVITY_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLastActivity(timestamp: number): void {
  try {
    localStorage.setItem(IDLE_LAST_ACTIVITY_KEY, String(timestamp));
  } catch {
    // Degrade silently — the in-memory fallback in useIdleSession still works.
  }
}

export function clearLastActivity(): void {
  try {
    localStorage.removeItem(IDLE_LAST_ACTIVITY_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

export function markIdleLogoutReason(): void {
  try {
    sessionStorage.setItem(IDLE_LOGOUT_REASON_KEY, "1");
  } catch {
    // The login page just won't show the reason banner.
  }
}

/** Reads AND clears the marker so the banner shows exactly once. */
export function consumeIdleLogoutReason(): boolean {
  try {
    const present = sessionStorage.getItem(IDLE_LOGOUT_REASON_KEY) === "1";
    if (present) sessionStorage.removeItem(IDLE_LOGOUT_REASON_KEY);
    return present;
  } catch {
    return false;
  }
}

export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
