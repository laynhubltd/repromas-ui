/**
 * Idle-session tests.
 *
 * Contract under test: inactivity is measured as a DURATION between two
 * readings of the same client clock (skew-safe, unlike the removed JWT
 * `exp` checks), background-tab timer throttling cannot delay expiry past
 * a wake event (focus/visibility recheck), and expiry fires exactly once.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  computeIdleState,
  consumeIdleLogoutReason,
  formatCountdown,
  IDLE_LAST_ACTIVITY_KEY,
  markIdleLogoutReason,
  readLastActivity,
  writeLastActivity,
} from "@/features/auth/idle-session/idle-session";
import { useIdleSession } from "@/features/auth/idle-session/useIdleSession";

const MINUTE = 60 * 1000;
const CONFIG = { timeoutMs: 30 * MINUTE, warningMs: 2 * MINUTE };

/**
 * jsdom in this project ships without Web Storage, so the suite provides a
 * spec-shaped in-memory implementation. (Production code already degrades
 * gracefully when storage is missing — that fallback is what the "disabled"
 * and hook tests would otherwise silently exercise.)
 */
function makeMemoryStorage(): Storage {
  let data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data = new Map();
    },
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    key: (index: number) => [...data.keys()][index] ?? null,
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeMemoryStorage());
  vi.stubGlobal("sessionStorage", makeMemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("computeIdleState", () => {
  it("is active while inside the budget", () => {
    const now = 1_000_000;
    const state = computeIdleState(now - 5 * MINUTE, now, CONFIG);
    expect(state.status).toBe("active");
    expect(state.msRemaining).toBe(25 * MINUTE);
  });

  it("enters warning inside the warning window", () => {
    const now = 1_000_000;
    const state = computeIdleState(now - 29 * MINUTE, now, CONFIG);
    expect(state.status).toBe("warning");
    expect(state.msRemaining).toBe(1 * MINUTE);
  });

  it("expires at and beyond the timeout", () => {
    const now = 1_000_000;
    expect(computeIdleState(now - 30 * MINUTE, now, CONFIG).status).toBe(
      "expired",
    );
    expect(
      computeIdleState(now - 300 * MINUTE, now, CONFIG).msRemaining,
    ).toBe(0);
  });

  it("boundary: exactly at the warning edge is warning", () => {
    const now = 1_000_000;
    const state = computeIdleState(now - 28 * MINUTE, now, CONFIG);
    expect(state.status).toBe("warning");
    expect(state.msRemaining).toBe(2 * MINUTE);
  });

  it("clamps a backwards clock jump instead of expiring", () => {
    const now = 1_000_000;
    // lastActivity "in the future" — the system clock was set backwards.
    const state = computeIdleState(now + 60 * MINUTE, now, CONFIG);
    expect(state.status).toBe("active");
    expect(state.msRemaining).toBe(CONFIG.timeoutMs);
  });
});

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("round-trips the activity timestamp", () => {
    writeLastActivity(123456);
    expect(readLastActivity()).toBe(123456);
  });

  it("returns null for garbage values", () => {
    localStorage.setItem(IDLE_LAST_ACTIVITY_KEY, "not-a-number");
    expect(readLastActivity()).toBeNull();
  });

  it("logout reason is consumed exactly once", () => {
    markIdleLogoutReason();
    expect(consumeIdleLogoutReason()).toBe(true);
    expect(consumeIdleLogoutReason()).toBe(false);
  });

  it("formats the countdown as m:ss", () => {
    expect(formatCountdown(90 * 1000)).toBe("1:30");
    expect(formatCountdown(500)).toBe("0:01");
    expect(formatCountdown(0)).toBe("0:00");
  });
});

describe("useIdleSession", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("expires once after the timeout elapses (interval path)", () => {
    const onExpire = vi.fn();
    renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 5 * MINUTE,
        warningMs: MINUTE,
        onExpire,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(6 * MINUTE);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(5 * MINUTE);
    });
    expect(onExpire).toHaveBeenCalledTimes(1); // latched — never fires twice
  });

  it("comeback scenario: a stale persisted timestamp expires on focus, without waiting for a timer", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 5 * MINUTE,
        warningMs: MINUTE,
        onExpire,
      }),
    );
    expect(result.current.status).toBe("active");

    // Simulate the machine sleeping / tab throttled: the shared timestamp is
    // old, but no interval tick has run (advanceTimersByTime not called).
    act(() => {
      writeLastActivity(Date.now() - 10 * MINUTE);
      window.dispatchEvent(new Event("focus"));
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("enters warning and extend() returns it to active", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 5 * MINUTE,
        warningMs: 2 * MINUTE,
        onExpire,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(4 * MINUTE);
    });
    expect(result.current.status).toBe("warning");
    expect(onExpire).not.toHaveBeenCalled();

    act(() => {
      result.current.extend();
    });
    expect(result.current.status).toBe("active");

    act(() => {
      vi.advanceTimersByTime(2 * MINUTE);
    });
    expect(onExpire).not.toHaveBeenCalled(); // budget restarted from extend()
  });

  it("activity in another tab (shared storage key) clears the warning", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 5 * MINUTE,
        warningMs: 2 * MINUTE,
        onExpire,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(4 * MINUTE);
    });
    expect(result.current.status).toBe("warning");

    act(() => {
      // Another tab records activity: shared key updates + storage event.
      writeLastActivity(Date.now());
      window.dispatchEvent(
        new StorageEvent("storage", { key: IDLE_LAST_ACTIVITY_KEY }),
      );
    });

    expect(result.current.status).toBe("active");
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("reopen-after-a-day: a stale timestamp from a previous visit expires ON MOUNT", async () => {
    // The browser was closed with a live session; redux-persist restores the
    // token a day later. The stored activity timestamp must be judged, not
    // overwritten — the user gets logged out before touching stale UI.
    writeLastActivity(Date.now() - 24 * 60 * MINUTE);
    const onExpire = vi.fn();

    renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 30 * MINUTE,
        warningMs: 2 * MINUTE,
        onExpire,
      }),
    );

    // The mount check is deferred one microtask; flush it.
    await act(async () => {});

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("fresh login (no stored timestamp) stamps activity and stays active", async () => {
    // Every logout path clears the stored timestamp, so its absence means a
    // brand-new session — even if the previous user left hours ago.
    const onExpire = vi.fn();

    const { result } = renderHook(() =>
      useIdleSession({
        enabled: true,
        timeoutMs: 30 * MINUTE,
        warningMs: 2 * MINUTE,
        onExpire,
      }),
    );

    await act(async () => {});

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.status).toBe("active");
    // And the session is now tracked for the tabs that follow.
    expect(readLastActivity()).not.toBeNull();
  });

  it("does nothing while disabled (logged out)", () => {
    const onExpire = vi.fn();
    renderHook(() =>
      useIdleSession({
        enabled: false,
        timeoutMs: MINUTE,
        warningMs: 30 * 1000,
        onExpire,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(10 * MINUTE);
    });
    expect(onExpire).not.toHaveBeenCalled();
  });
});
