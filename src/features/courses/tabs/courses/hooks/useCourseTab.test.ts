import { describe, expect, it } from "vitest";
import {
  buildGroupedCourses,
  buildQueryParams,
  computeActiveFilterCount,
  computeScopeFlags,
  GROUP_BY_ITEMS_PER_PAGE,
} from "./useCourseTab";
import type { Course } from "../types/course";

describe("useCourseTab pure helpers", () => {
  describe("buildQueryParams", () => {
    it("respects itemsPerPage in flat table view", () => {
      const params = buildQueryParams({
        page: 2,
        itemsPerPage: 50,
        sort: "code:asc",
        groupByDepartment: false,
        showDepartmentColumn: true,
        showDepartmentFilter: true,
        departmentId: 5,
        showInactive: false,
        debouncedCode: "CSC",
        debouncedTitle: "Intro",
      });

      expect(params.page).toBe(2);
      expect(params.itemsPerPage).toBe(50);
      expect(params.sort).toBe("code:asc");
      expect(params.include).toBe("department");
      expect(params["exact[departmentId]"]).toBe(5);
      expect(params["boolean[isActive]"]).toBe(true);
      expect(params["search[code]"]).toBe("CSC");
      expect(params["search[title]"]).toBe("Intro");
    });

    it("uses GROUP_BY_ITEMS_PER_PAGE when groupByDepartment is true", () => {
      const params = buildQueryParams({
        page: 1,
        itemsPerPage: 10,
        sort: "code:asc",
        groupByDepartment: true,
        showDepartmentColumn: true,
        showDepartmentFilter: true,
        departmentId: undefined,
        showInactive: true,
        debouncedCode: "",
        debouncedTitle: "",
      });

      expect(params.itemsPerPage).toBe(GROUP_BY_ITEMS_PER_PAGE);
      expect(params["boolean[isActive]"]).toBeUndefined();
    });
  });

  describe("computeScopeFlags", () => {
    it("enables department features for GLOBAL and FACULTY scopes", () => {
      expect(computeScopeFlags({ scope: "GLOBAL" })).toEqual({
        showDepartmentColumn: true,
        showDepartmentFilter: true,
        showGroupByToggle: true,
      });

      expect(computeScopeFlags({ scope: "FACULTY" })).toEqual({
        showDepartmentColumn: true,
        showDepartmentFilter: true,
        showGroupByToggle: true,
      });

      expect(computeScopeFlags({ scope: "DEPARTMENT" })).toEqual({
        showDepartmentColumn: false,
        showDepartmentFilter: false,
        showGroupByToggle: false,
      });
    });
  });

  describe("computeActiveFilterCount", () => {
    it("counts department filter when active", () => {
      expect(
        computeActiveFilterCount({ showDepartmentFilter: true, departmentId: 10 }),
      ).toBe(1);
      expect(
        computeActiveFilterCount({ showDepartmentFilter: false, departmentId: 10 }),
      ).toBe(0);
      expect(
        computeActiveFilterCount({ showDepartmentFilter: true, departmentId: undefined }),
      ).toBe(0);
    });
  });

  describe("buildGroupedCourses", () => {
    it("groups courses by departmentId", () => {
      const mockCourses: Course[] = [
        { id: 1, departmentId: 10, code: "CSC101" } as Course,
        { id: 2, departmentId: 10, code: "CSC102" } as Course,
        { id: 3, departmentId: 20, code: "MTH101" } as Course,
      ];

      const grouped = buildGroupedCourses(mockCourses);
      expect(grouped.get(10)).toHaveLength(2);
      expect(grouped.get(20)).toHaveLength(1);
    });
  });
});
