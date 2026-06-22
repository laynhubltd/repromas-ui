import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDynamicFormLayout } from "./useDynamicFormLayout";

vi.mock("@/hooks/useBreakpoint", () => ({
  useIsMobile: vi.fn(() => false),
  useIsXs: vi.fn(() => false),
}));

describe("useDynamicFormLayout", () => {
  it("returns desktop layout flags by default", async () => {
    const { useIsMobile, useIsXs } = await import("@/hooks/useBreakpoint");
    vi.mocked(useIsMobile).mockReturnValue(false);
    vi.mocked(useIsXs).mockReturnValue(false);

    const { result } = renderHook(() => useDynamicFormLayout());
    expect(result.current.stepsVariant).toBe("horizontal");
    expect(result.current.navButtonsBlock).toBe(false);
  });

  it("returns mobile layout flags on small screens", async () => {
    const { useIsMobile, useIsXs } = await import("@/hooks/useBreakpoint");
    vi.mocked(useIsMobile).mockReturnValue(true);
    vi.mocked(useIsXs).mockReturnValue(true);

    const { result } = renderHook(() => useDynamicFormLayout());
    expect(result.current.stepsVariant).toBe("compact");
    expect(result.current.stackSittingCards).toBe(true);
    expect(result.current.stickyNav).toBe(true);
  });
});
