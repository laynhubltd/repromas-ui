import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useServerTableState } from "../shared/hooks/useServerTableState";

describe("useServerTableState", () => {
  it("initializes with provided options", () => {
    const { result } = renderHook(() =>
      useServerTableState({
        initialPage: 2,
        initialPageSize: 20,
        initialSort: "name:asc",
        initialFilters: { search: "", status: 1 },
        totalItems: 100,
      }),
    );

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.sort).toBe("name:asc");
    expect(result.current.filters).toEqual({ search: "", status: 1 });
  });

  describe("Invariant P2: Filter & Sort auto-resets page to 1", () => {
    it("resets page to 1 when updateFilters is called", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 5,
          initialFilters: { search: "" },
        }),
      );

      expect(result.current.page).toBe(5);

      act(() => {
        result.current.updateFilters({ search: "biology" });
      });

      expect(result.current.page).toBe(1);
      expect(result.current.filters.search).toBe("biology");
    });

    it("resets page to 1 when updateSort is called", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 4,
          initialFilters: {},
        }),
      );

      expect(result.current.page).toBe(4);

      act(() => {
        result.current.updateSort("code:desc");
      });

      expect(result.current.page).toBe(1);
      expect(result.current.sort).toBe("code:desc");
    });

    it("resets page to 1 when resetFilters is called", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 3,
          initialFilters: { search: "test" },
        }),
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.page).toBe(1);
      expect(result.current.filters).toEqual({ search: "test" });
    });
  });

  describe("Invariant P2 & P4: Page size changes reset page to 1", () => {
    it("resets page to 1 when pageSize changes via pagination onChange", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 3,
          initialPageSize: 10,
          initialFilters: {},
          totalItems: 100,
        }),
      );

      const config = result.current.getPaginationConfig();

      act(() => {
        config.onChange?.(3, 20);
      });

      expect(result.current.pageSize).toBe(20);
      expect(result.current.page).toBe(1);
    });

    it("updates only page when pageSize remains unchanged", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 1,
          initialPageSize: 10,
          initialFilters: {},
          totalItems: 100,
        }),
      );

      const config = result.current.getPaginationConfig();

      act(() => {
        config.onChange?.(2, 10);
      });

      expect(result.current.pageSize).toBe(10);
      expect(result.current.page).toBe(2);
    });
  });

  describe("Invariant P3: Reactive Page Clamp on deletes & mutations", () => {
    it("clamps page when totalItems shrinks below current page range", () => {
      let total = 25;
      const { result, rerender } = renderHook(
        ({ totalItems }) =>
          useServerTableState({
            initialPage: 3, // page 3 with pageSize 10 covers items 21-30
            initialPageSize: 10,
            initialFilters: {},
            totalItems,
          }),
        { initialProps: { totalItems: total } },
      );

      expect(result.current.page).toBe(3);

      // Single or bulk delete reduces total items from 25 to 15 (last page is now 2)
      total = 15;
      rerender({ totalItems: total });

      expect(result.current.page).toBe(2);
    });

    it("clamps page to 1 when all items are deleted", () => {
      let total = 20;
      const { result, rerender } = renderHook(
        ({ totalItems }) =>
          useServerTableState({
            initialPage: 2,
            initialPageSize: 10,
            initialFilters: {},
            totalItems,
          }),
        { initialProps: { totalItems: total } },
      );

      expect(result.current.page).toBe(2);

      total = 0;
      rerender({ totalItems: total });

      expect(result.current.page).toBe(1);
    });
  });

  describe("Invariant P4: Standard pagination configuration", () => {
    it("generates correct showTotal and size changer options", () => {
      const { result } = renderHook(() =>
        useServerTableState({
          initialPage: 1,
          initialPageSize: 10,
          initialFilters: {},
          totalItems: 50,
        }),
      );

      const config = result.current.getPaginationConfig();
      expect(config.showSizeChanger).toBe(true);
      expect(config.total).toBe(50);
      expect(config.showTotal?.(50, [1, 10])).toBe("1-10 of 50 items");
    });
  });
});
