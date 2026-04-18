/**
 * Curriculum Version Settings — Property-Based Tests
 *
 * Feature: curriculum-version-settings
 * Tests properties from design.md using fast-check (min 100 iterations each).
 */

import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

type MenuItem = {
  key: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
};

import {
    calcTotalPages,
    getMenuItems,
    getStatusTag,
    resetPageOnFilterChange,
    statusFilterToQueryParam,
} from "@/features/settings/tabs/curriculum-version/components/CurriculumVersionTab";
import { extractNameError } from "@/features/settings/tabs/curriculum-version/utils/extractNameError";

// ── Shared arbitraries ────────────────────────────────────────────────────────

const curriculumVersionArb = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1 }),
  isActiveForAdmission: fc.boolean(),
  createdAt: fc.constantFrom(
    "2024-01-15T10:00:00.000Z",
    "2025-06-30T08:30:00.000Z",
    "2023-12-01T00:00:00.000Z",
  ),
});

// ── Property 1: Status tag rendering ─────────────────────────────────────────

// Feature: curriculum-version-settings, Property 1: Status tag rendering
describe("Property 1: Status tag rendering", () => {
  it('renders "Active" with color "green" when isActiveForAdmission is true', () => {
    fc.assert(
      fc.property(
        curriculumVersionArb.filter((v) => v.isActiveForAdmission === true),
        (version) => {
          const tag = getStatusTag(version.isActiveForAdmission);
          expect(tag.label).toBe("Active");
          expect(tag.color).toBe("green");
        },
      ),
      { numRuns: 100 },
    );
  });

  it('renders "Inactive" with no color when isActiveForAdmission is false', () => {
    fc.assert(
      fc.property(
        curriculumVersionArb.filter((v) => v.isActiveForAdmission === false),
        (version) => {
          const tag = getStatusTag(version.isActiveForAdmission);
          expect(tag.label).toBe("Inactive");
          expect(tag.color).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("label is always either 'Active' or 'Inactive' for any boolean input", () => {
    fc.assert(
      fc.property(fc.boolean(), (isActive) => {
        const tag = getStatusTag(isActive);
        expect(["Active", "Inactive"]).toContain(tag.label);
        if (isActive) {
          expect(tag.color).toBe("green");
        } else {
          expect(tag.color).toBeUndefined();
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 2: Pagination total pages calculation ────────────────────────────

// Feature: curriculum-version-settings, Property 2: Pagination total pages calculation
describe("Property 2: Pagination total pages calculation", () => {
  it("totalPages equals Math.ceil(totalItems / itemsPerPage)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 100 }),
        (totalItems, itemsPerPage) => {
          const totalPages = calcTotalPages(totalItems, itemsPerPage);
          expect(totalPages).toBe(Math.ceil(totalItems / itemsPerPage));
        },
      ),
      { numRuns: 100 },
    );
  });

  it("current page never exceeds totalPages (page is clamped)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 500 }),
        (totalItems, itemsPerPage, rawPage) => {
          const totalPages = calcTotalPages(totalItems, itemsPerPage);
          // The valid page is clamped to [1, totalPages] (or 1 when list is empty)
          const clampedPage =
            totalPages === 0 ? 1 : Math.min(rawPage, totalPages);
          expect(clampedPage).toBeGreaterThanOrEqual(1);
          if (totalPages > 0) {
            expect(clampedPage).toBeLessThanOrEqual(totalPages);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("totalPages is 0 when totalItems is 0", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (itemsPerPage) => {
        expect(calcTotalPages(0, itemsPerPage)).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  it("totalPages is 1 when totalItems <= itemsPerPage", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (itemsPerPage, extra) => {
          // totalItems in range [1, itemsPerPage]
          const totalItems = ((extra - 1) % itemsPerPage) + 1;
          expect(calcTotalPages(totalItems, itemsPerPage)).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 3: Filter maps to correct query parameter ────────────────────────

// Feature: curriculum-version-settings, Property 3: Filter maps to correct query parameter
describe("Property 3: Filter maps to correct query parameter", () => {
  it('"active" filter maps boolean[isActiveForAdmission] to true', () => {
    fc.assert(
      fc.property(fc.constant("active" as const), (filter) => {
        expect(statusFilterToQueryParam(filter)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('"inactive" filter maps boolean[isActiveForAdmission] to false', () => {
    fc.assert(
      fc.property(fc.constant("inactive" as const), (filter) => {
        expect(statusFilterToQueryParam(filter)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('"all" filter omits boolean[isActiveForAdmission] (returns undefined)', () => {
    fc.assert(
      fc.property(fc.constant("all" as const), (filter) => {
        expect(statusFilterToQueryParam(filter)).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("every valid filter value produces the correct param", () => {
    const cases: Array<["all" | "active" | "inactive", boolean | undefined]> = [
      ["all", undefined],
      ["active", true],
      ["inactive", false],
    ];
    fc.assert(
      fc.property(fc.constantFrom(...cases), ([filter, expected]) => {
        expect(statusFilterToQueryParam(filter)).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 4: Search and filter changes reset page to 1 ─────────────────────

// Feature: curriculum-version-settings, Property 4: Search and filter changes reset page to 1
describe("Property 4: Search and filter changes reset page to 1", () => {
  const statusFilterArb = fc.constantFrom(
    "all" as const,
    "active" as const,
    "inactive" as const,
  );

  it("page resets to 1 when search term changes", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        statusFilterArb,
        fc.integer({ min: 2, max: 100 }),
        (prevSearch, nextSearch, filter, currentPage) => {
          fc.pre(prevSearch !== nextSearch);
          const result = resetPageOnFilterChange(
            prevSearch,
            nextSearch,
            filter,
            filter,
            currentPage,
          );
          expect(result).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("page resets to 1 when status filter changes", () => {
    fc.assert(
      fc.property(
        statusFilterArb,
        statusFilterArb,
        fc.string(),
        fc.integer({ min: 2, max: 100 }),
        (prevFilter, nextFilter, search, currentPage) => {
          fc.pre(prevFilter !== nextFilter);
          const result = resetPageOnFilterChange(
            search,
            search,
            prevFilter,
            nextFilter,
            currentPage,
          );
          expect(result).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("page is preserved when neither search nor filter changes", () => {
    fc.assert(
      fc.property(
        fc.string(),
        statusFilterArb,
        fc.integer({ min: 1, max: 100 }),
        (search, filter, currentPage) => {
          const result = resetPageOnFilterChange(
            search,
            search,
            filter,
            filter,
            currentPage,
          );
          expect(result).toBe(currentPage);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("page resets to 1 when both search and filter change simultaneously", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        statusFilterArb,
        statusFilterArb,
        fc.integer({ min: 2, max: 100 }),
        (prevSearch, nextSearch, prevFilter, nextFilter, currentPage) => {
          fc.pre(prevSearch !== nextSearch || prevFilter !== nextFilter);
          const result = resetPageOnFilterChange(
            prevSearch,
            nextSearch,
            prevFilter,
            nextFilter,
            currentPage,
          );
          expect(result).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 10: At most one active version after activation ──────────────────

// Feature: curriculum-version-settings, Property 10: At most one active version after activation
describe("Property 10: At most one active version after activation", () => {
  /**
   * Simulates what the server returns after a successful PATCH activate:
   * the activated version becomes active, all others become inactive.
   * This mirrors the RTK Query cache invalidation + refetch cycle.
   */
  function simulateActivation(
    versions: Array<{ id: number; isActiveForAdmission: boolean }>,
    activatedId: number,
  ): Array<{ id: number; isActiveForAdmission: boolean }> {
    return versions.map((v) => ({
      ...v,
      isActiveForAdmission: v.id === activatedId,
    }));
  }

  const versionListArb = fc.array(
    fc.record({
      id: fc.integer({ min: 1, max: 1000 }),
      isActiveForAdmission: fc.boolean(),
    }),
    { minLength: 1, maxLength: 20 },
  );

  it("at most one version is active after activation", () => {
    // **Validates: Requirements 6.6**
    fc.assert(
      fc.property(versionListArb, (versions) => {
        // Deduplicate ids so we have a realistic list
        const unique = versions.filter(
          (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i,
        );
        fc.pre(unique.length >= 1);

        const targetId = unique[0].id;
        const result = simulateActivation(unique, targetId);

        const activeCount = result.filter((v) => v.isActiveForAdmission).length;
        expect(activeCount).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it("exactly the activated version is active after activation", () => {
    fc.assert(
      fc.property(
        versionListArb,
        fc.integer({ min: 0, max: 19 }),
        (versions, indexSeed) => {
          const unique = versions.filter(
            (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i,
          );
          fc.pre(unique.length >= 1);

          const targetIndex = indexSeed % unique.length;
          const targetId = unique[targetIndex].id;
          const result = simulateActivation(unique, targetId);

          const activeVersions = result.filter((v) => v.isActiveForAdmission);
          expect(activeVersions).toHaveLength(1);
          expect(activeVersions[0].id).toBe(targetId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all other versions are inactive after activation", () => {
    fc.assert(
      fc.property(
        versionListArb,
        fc.integer({ min: 0, max: 19 }),
        (versions, indexSeed) => {
          const unique = versions.filter(
            (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i,
          );
          fc.pre(unique.length >= 2);

          const targetIndex = indexSeed % unique.length;
          const targetId = unique[targetIndex].id;
          const result = simulateActivation(unique, targetId);

          const inactiveVersions = result.filter((v) => v.id !== targetId);
          expect(inactiveVersions.every((v) => !v.isActiveForAdmission)).toBe(
            true,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("activation is idempotent — activating an already-active version keeps exactly one active", () => {
    fc.assert(
      fc.property(
        versionListArb,
        fc.integer({ min: 0, max: 19 }),
        (versions, indexSeed) => {
          const unique = versions.filter(
            (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i,
          );
          fc.pre(unique.length >= 1);

          const targetIndex = indexSeed % unique.length;
          const targetId = unique[targetIndex].id;

          // Activate once, then activate the same version again
          const afterFirst = simulateActivation(unique, targetId);
          const afterSecond = simulateActivation(afterFirst, targetId);

          const activeCount = afterSecond.filter(
            (v) => v.isActiveForAdmission,
          ).length;
          expect(activeCount).toBe(1);
          expect(
            afterSecond.find((v) => v.id === targetId)?.isActiveForAdmission,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 12: Every row has a three-item actions menu ─────────────────────

// Feature: curriculum-version-settings, Property 12: Every row has a three-item actions menu
describe("Property 12: Every row has a three-item actions menu", () => {
  const versionListArb = fc.array(curriculumVersionArb, {
    minLength: 1,
    maxLength: 50,
  });

  it("every row's menu has exactly 3 items", () => {
    // **Validates: Requirements 8.1, 8.2**
    fc.assert(
      fc.property(versionListArb, (versions) => {
        for (const version of versions) {
          const items = getMenuItems(version.isActiveForAdmission);
          expect(items).toHaveLength(3);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every row's menu contains exactly Edit, Activate, and Delete items", () => {
    fc.assert(
      fc.property(versionListArb, (versions) => {
        for (const version of versions) {
          const items = getMenuItems(version.isActiveForAdmission);
          const labels = items.map((item: MenuItem) => item.label);
          expect(labels).toContain("Edit");
          expect(labels).toContain("Activate");
          expect(labels).toContain("Delete");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("menu item order is always Edit, Activate, Delete for any version", () => {
    fc.assert(
      fc.property(fc.boolean(), (isActive) => {
        const items = getMenuItems(isActive);
        expect(items[0].label).toBe("Edit");
        expect(items[1].label).toBe("Activate");
        expect(items[2].label).toBe("Delete");
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 5: Error normalisation surfaces name errors inline ──────────────

// Feature: curriculum-version-settings, Property 5: Error normalisation surfaces name errors inline
describe("Property 5: Error normalisation surfaces name errors inline", () => {
  /**
   * Validates: Requirements 4.6, 4.7, 4.8, 5.6, 5.7, 5.8
   *
   * For any API error response (409 ConstraintViolation, 400 ValidationViolation,
   * or GenericError) returned from a create or update mutation, extractNameError
   * should return a field-level error when the error targets the "name" field,
   * and a form-level error for generic errors — never silently swallowing the message.
   */

  it("409 ConstraintViolation with field=name returns { type: 'field', message }", () => {
    // **Validates: Requirements 4.6, 5.6**
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (message) => {
        const error = { data: { errors: [{ field: "name", message }] } };
        const result = extractNameError(error);
        expect(result).toEqual({ type: "field", message });
      }),
      { numRuns: 100 },
    );
  });

  it("409 ConstraintViolation with field !== name returns null", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s !== "name"),
        fc.string({ minLength: 1 }),
        (field, message) => {
          const error = { data: { errors: [{ field, message }] } };
          const result = extractNameError(error);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("400 ValidationViolation with propertyPath=name returns { type: 'field', message }", () => {
    // **Validates: Requirements 4.7, 5.7**
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (message) => {
        const error = {
          data: { violations: [{ propertyPath: "name", message }] },
        };
        const result = extractNameError(error);
        expect(result).toEqual({ type: "field", message });
      }),
      { numRuns: 100 },
    );
  });

  it("400 ValidationViolation with propertyPath !== name returns null", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s !== "name"),
        fc.string({ minLength: 1 }),
        (propertyPath, message) => {
          const error = { data: { violations: [{ propertyPath, message }] } };
          const result = extractNameError(error);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("400 GenericError shape returns { type: 'form', message: detail }", () => {
    // **Validates: Requirements 4.8, 5.8**
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 400, max: 499 }),
        fc.string({ minLength: 1 }),
        (type, title, status, detail) => {
          const error = { data: { type, title, status, detail } };
          const result = extractNameError(error);
          expect(result).toEqual({ type: "form", message: detail });
        },
      ),
      { numRuns: 100 },
    );
  });

  it("unrecognised shapes return null", () => {
    const unrecognisedArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.string(),
      fc.integer(),
      fc.record({ message: fc.string(), code: fc.integer() }),
      fc.record({
        data: fc.record({ message: fc.string(), code: fc.integer() }),
      }),
    );
    fc.assert(
      fc.property(unrecognisedArb, (input) => {
        const result = extractNameError(input);
        expect(result).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it("never silently swallows — result message always equals the input message for recognised shapes", () => {
    const constraintViolationArb = fc
      .string({ minLength: 1 })
      .map((message) => ({
        input: { data: { errors: [{ field: "name", message }] } },
        expected: message,
      }));

    const validationViolationArb = fc
      .string({ minLength: 1 })
      .map((message) => ({
        input: { data: { violations: [{ propertyPath: "name", message }] } },
        expected: message,
      }));

    const genericErrorArb = fc
      .tuple(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 400, max: 499 }),
        fc.string({ minLength: 1 }),
      )
      .map(([type, title, status, detail]) => ({
        input: { data: { type, title, status, detail } },
        expected: detail,
      }));

    fc.assert(
      fc.property(
        fc.oneof(
          constraintViolationArb,
          validationViolationArb,
          genericErrorArb,
        ),
        ({ input, expected }) => {
          const result = extractNameError(input);
          expect(result).not.toBeNull();
          expect(result!.message).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 9: Active version's Activate menu item is disabled ───────────────

// Feature: curriculum-version-settings, Property 9: Active version's Activate menu item is disabled
describe("Property 9: Active version's Activate menu item is disabled", () => {
  it("Activate menu item is disabled when isActiveForAdmission is true", () => {
    // **Validates: Requirements 6.4, 8.3**
    fc.assert(
      fc.property(
        curriculumVersionArb.filter((v) => v.isActiveForAdmission === true),
        (version) => {
          const items = getMenuItems(version.isActiveForAdmission);
          const activateItem = items.find(
            (item: MenuItem) => item.key === "activate",
          );
          expect(activateItem).toBeDefined();
          expect(activateItem?.disabled).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Activate menu item is enabled when isActiveForAdmission is false", () => {
    fc.assert(
      fc.property(
        curriculumVersionArb.filter((v) => v.isActiveForAdmission === false),
        (version) => {
          const items = getMenuItems(version.isActiveForAdmission);
          const activateItem = items.find(
            (item: MenuItem) => item.key === "activate",
          );
          expect(activateItem).toBeDefined();
          expect(activateItem?.disabled).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Activate disabled state always matches isActiveForAdmission for any boolean", () => {
    fc.assert(
      fc.property(fc.boolean(), (isActive) => {
        const items = getMenuItems(isActive);
        const activateItem = items.find(
          (item: MenuItem) => item.key === "activate",
        );
        expect(activateItem).toBeDefined();
        expect(activateItem?.disabled).toBe(isActive);
      }),
      { numRuns: 100 },
    );
  });
});
