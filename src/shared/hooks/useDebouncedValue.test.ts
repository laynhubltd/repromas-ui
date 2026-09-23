import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces rapid value changes and only updates after delayMs has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "c", delay: 300 } },
    );

    expect(result.current).toBe("c");

    // Simulate rapid typing: c -> ch -> che -> chem -> chemi -> chemist -> chemistry (7 keystrokes)
    rerender({ value: "ch", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("c");

    rerender({ value: "che", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("c");

    rerender({ value: "chem", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("c");

    rerender({ value: "chemi", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("c");

    rerender({ value: "chemist", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("c");

    rerender({ value: "chemistry", delay: 300 });
    expect(result.current).toBe("c");

    // Advance 299ms: still old value
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("c");

    // Advance remaining 1ms (total 300ms since last keystroke) -> updates to final value
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("chemistry");
  });

  it("cleans up timer on unmount without errors", () => {
    const { result, unmount, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "start" } },
    );

    rerender({ value: "update" });
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("start");
  });
});
