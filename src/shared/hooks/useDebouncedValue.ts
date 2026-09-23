import { useEffect, useState } from "react";

/**
 * useDebouncedValue — Debounces any value changes by a specified delay (default: 300ms).
 *
 * Trailing-only evaluation ensures rapid keystrokes or state changes only propagate
 * once the input has stabilized. Safe on unmount with automatic timer cleanup.
 *
 * @param value The value to debounce.
 * @param delayMs Delay in milliseconds (default: 300ms standard).
 * @returns The stabilized debounced value.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 300): T {
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
