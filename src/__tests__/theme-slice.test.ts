/**
 * Theme Slice — PBT Exploration Tests
 *
 * These tests MUST FAIL before implementation — failure confirms the slice
 * does not exist yet. DO NOT fix the code when these tests fail.
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import * as fc from "fast-check";

// Hex color generator: produces strings like "#a1b2c3"
// fc.hexaString was removed in fast-check v4; use stringMatching instead
const hexColorArb = fc
  .stringMatching(/^[0-9a-f]{6}$/)
  .map((h) => `#${h}`);

describe("Theme Slice — exploration (MUST FAIL before implementation)", () => {
  it("initial state has primaryColor equal to DEFAULT_PRIMARY (#006747)", async () => {
    // Importing a non-existent module will throw — confirming the slice is missing
    const { themeReducer, DEFAULT_PRIMARY } = await import(
      "@/app/state/theme-slice"
    );

    const initialState = themeReducer(undefined, { type: "@@INIT" });
    expect(initialState.primaryColor).toBe(DEFAULT_PRIMARY);
    expect(DEFAULT_PRIMARY).toBe("#006747");
  });

  // Feature: dynamic-theming, Property 1: themeLoaded round-trip
  // Validates: Requirements 2.2, 3.4
  it("P1 — themeLoaded round-trip: dispatching themeLoaded(color) sets primaryColor to color", async () => {
    const { themeReducer, themeLoaded } = await import(
      "@/app/state/theme-slice"
    );

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const nextState = themeReducer(undefined, themeLoaded(color));
        expect(nextState.primaryColor).toBe(color);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: dynamic-theming, Property 2: themeReset restores default
  // Validates: Requirements 2.3
  it("P2 — themeReset restores DEFAULT_PRIMARY after any themeLoaded", async () => {
    const { themeReducer, themeLoaded, themeReset, DEFAULT_PRIMARY } =
      await import("@/app/state/theme-slice");

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const afterLoad = themeReducer(undefined, themeLoaded(color));
        const afterReset = themeReducer(afterLoad, themeReset());
        expect(afterReset.primaryColor).toBe(DEFAULT_PRIMARY);
      }),
      { numRuns: 100 },
    );
  });
});
