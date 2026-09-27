import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SEARCH_DEBOUNCE_MS,
  useDebouncedState,
  useDebouncedValue,
} from "../shared/hooks/useDebouncedValue";

describe("useDebouncedValue & useDebouncedState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("useDebouncedValue (backward-compatible)", () => {
    it("returns initial value immediately", () => {
      const { result } = renderHook(() => useDebouncedValue("initial"));
      expect(result.current).toBe("initial");
    });

    it("debounces value updates by default 500ms", () => {
      const { result, rerender } = renderHook(
        ({ val }) => useDebouncedValue(val),
        { initialProps: { val: "initial" } },
      );

      rerender({ val: "updated" });
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SEARCH_DEBOUNCE_MS - 1);
      });
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe("updated");
    });

    it("respects custom delay", () => {
      const { result, rerender } = renderHook(
        ({ val }) => useDebouncedValue(val, 200),
        { initialProps: { val: "initial" } },
      );

      rerender({ val: "custom" });
      act(() => {
        vi.advanceTimersByTime(199);
      });
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe("custom");
    });
  });

  describe("useDebouncedState (with isDebouncing)", () => {
    it("initializes with isDebouncing false", () => {
      const { result } = renderHook(() => useDebouncedState("initial"));
      expect(result.current.debouncedValue).toBe("initial");
      expect(result.current.isDebouncing).toBe(false);
    });

    it("sets isDebouncing true on change and false when timer fires", () => {
      const { result, rerender } = renderHook(
        ({ val }) => useDebouncedState(val),
        { initialProps: { val: "initial" } },
      );

      rerender({ val: "typing" });
      expect(result.current.isDebouncing).toBe(true);
      expect(result.current.debouncedValue).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SEARCH_DEBOUNCE_MS);
      });

      expect(result.current.isDebouncing).toBe(false);
      expect(result.current.debouncedValue).toBe("typing");
    });
  });
});
