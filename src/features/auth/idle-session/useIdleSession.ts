import { useCallback, useEffect, useRef, useState } from "react";

import {
  computeIdleState,
  DEFAULT_IDLE_TIMEOUT_MS,
  DEFAULT_IDLE_WARNING_MS,
  IDLE_LAST_ACTIVITY_KEY,
  readLastActivity,
  writeLastActivity,
  type IdleSnapshot,
} from "./idle-session";

/**
 * Activity events counted as "the user is here". Deliberately input-only —
 * background API polling or animations must never extend the session.
 */
const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "wheel",
  "scroll",
  "touchstart",
] as const;

/** Activity writes are throttled — a mousemove-per-pixel write is the classic mistake. */
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;
/** Coarse re-check cadence while active; 1s while the warning countdown shows. */
const CHECK_INTERVAL_ACTIVE_MS = 15 * 1000;
const CHECK_INTERVAL_WARNING_MS = 1000;

export type UseIdleSessionOptions = {
  enabled: boolean;
  timeoutMs?: number;
  warningMs?: number;
  /** Fired exactly once per expiry. Perform the logout here. */
  onExpire: () => void;
};

export type UseIdleSessionResult = IdleSnapshot & {
  /** User chose "stay signed in" — records activity and re-evaluates. */
  extend: () => void;
};

/**
 * Headless inactivity tracker.
 *
 * Timer strategy: browsers throttle background-tab timers (Chrome 88+ runs
 * them at most once per minute after ~5 idle minutes), so the deadline is
 * NEVER a setTimeout. Instead the state is recomputed from the persisted
 * `lastActivityAt` on a coarse interval, and — the load-bearing part — on
 * `visibilitychange` / `focus` / `pageshow`, so a user returning to a stale
 * tab is evaluated (and logged out) immediately, before interacting.
 *
 * `lastActivityAt` lives in localStorage, shared across tabs: activity in
 * one tab keeps every tab alive, and each tab independently reaches the
 * same expiry verdict from the same timestamp.
 */
export function useIdleSession({
  enabled,
  timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  warningMs = DEFAULT_IDLE_WARNING_MS,
  onExpire,
}: UseIdleSessionOptions): UseIdleSessionResult {
  const [snapshot, setSnapshot] = useState<IdleSnapshot>({
    status: "active",
    msRemaining: timeoutMs,
  });

  const expiredRef = useRef(false);
  const statusRef = useRef<IdleSnapshot["status"]>("active");
  const lastWriteRef = useRef(0);
  // In-memory fallback when localStorage is unavailable (per-tab tracking).
  // Stamped with the real time by the enable effect before any check runs.
  const memoryActivityRef = useRef(0);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const recordActivity = useCallback((now: number) => {
    memoryActivityRef.current = now;
    lastWriteRef.current = now;
    writeLastActivity(now);
  }, []);

  const check = useCallback(() => {
    if (expiredRef.current) return;
    const now = Date.now();
    const lastActivity = readLastActivity() ?? memoryActivityRef.current;
    const next = computeIdleState(lastActivity, now, { timeoutMs, warningMs });

    statusRef.current = next.status;
    setSnapshot((prev) =>
      prev.status === next.status && prev.msRemaining === next.msRemaining
        ? prev
        : next,
    );

    if (next.status === "expired") {
      expiredRef.current = true;
      onExpireRef.current();
    }
  }, [timeoutMs, warningMs]);

  const extend = useCallback(() => {
    recordActivity(Date.now());
    check();
  }, [recordActivity, check]);

  // Session start. Two distinct cases, told apart by the stored timestamp
  // (every logout path clears it via the auth listener):
  //  - No stored activity → FRESH LOGIN: stamp now.
  //  - Stored activity present → RESUMED SESSION (page reload, or the tab /
  //    browser reopened hours later): do NOT overwrite it — the check below
  //    must judge it, so reopening after a day logs the user out instead of
  //    silently resuming.
  useEffect(() => {
    if (!enabled) return;
    expiredRef.current = false;
    const existing = readLastActivity();
    if (existing === null) {
      recordActivity(Date.now());
    } else {
      memoryActivityRef.current = existing;
    }
    // Deferred: the effect synchronizes the external clock/storage state;
    // the derived React state settles on the next microtask.
    queueMicrotask(check);
  }, [enabled, recordActivity, check]);

  // Input activity, throttled. While the warning is showing, any input
  // counts as "I'm here" immediately (no 30s throttle window).
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      const now = Date.now();
      const throttled =
        now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS &&
        statusRef.current !== "warning";
      if (throttled) return;
      recordActivity(now);
      if (statusRef.current !== "active") check();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );
    return () =>
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
  }, [enabled, recordActivity, check]);

  // The comeback path: re-evaluate the moment the tab becomes visible again.
  useEffect(() => {
    if (!enabled) return;

    const handleWake = () => check();
    // Activity in ANOTHER tab updates the shared key — clear our warning.
    const handleStorage = (event: StorageEvent) => {
      if (event.key === IDLE_LAST_ACTIVITY_KEY) check();
    };

    document.addEventListener("visibilitychange", handleWake);
    window.addEventListener("focus", handleWake);
    window.addEventListener("pageshow", handleWake);
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("visibilitychange", handleWake);
      window.removeEventListener("focus", handleWake);
      window.removeEventListener("pageshow", handleWake);
      window.removeEventListener("storage", handleStorage);
    };
  }, [enabled, check]);

  // Coarse polling (throttling-tolerant); tight cadence only for the countdown.
  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(
      check,
      snapshot.status === "warning"
        ? CHECK_INTERVAL_WARNING_MS
        : CHECK_INTERVAL_ACTIVE_MS,
    );
    return () => window.clearInterval(interval);
  }, [enabled, snapshot.status, check]);

  return { ...snapshot, extend };
}
