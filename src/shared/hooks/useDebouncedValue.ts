import { useEffect, useState } from "react";

export const DEFAULT_SEARCH_DEBOUNCE_MS = 500;

export interface DebouncedStateResult<T> {
  debouncedValue: T;
  isDebouncing: boolean;
}

/**
 * useDebouncedValue — Debounces any value changes by a specified delay (default: 500ms).
 *
 * Trailing-only evaluation ensures rapid keystrokes or state changes only propagate
 * once the input has stabilized. Safe on unmount with automatic timer cleanup.
 *
 * @param value The value to debounce.
 * @param delayMs Delay in milliseconds (default: 500ms).
 * @returns The stabilized debounced value.
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = DEFAULT_SEARCH_DEBOUNCE_MS
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * useDebouncedState — Debounces a value and exposes `isDebouncing` flag
 * for input suffix spinners or micro-interaction indicators while typing.
 *
 * @param value The value to debounce.
 * @param delayMs Delay in milliseconds (default: 500ms).
 * @returns An object containing `debouncedValue` and `isDebouncing`.
 */
export function useDebouncedState<T>(
  value: T,
  delayMs: number = DEFAULT_SEARCH_DEBOUNCE_MS
): DebouncedStateResult<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (value === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs, debouncedValue]);

  return { debouncedValue, isDebouncing };
}
