/**
 * ThemeVars — PBT Exploration Tests
 *
 * These tests MUST FAIL before implementation — failure confirms ThemeVars
 * does not read from the Redux store yet.
 * DO NOT fix the code when these tests fail.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7
 */

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { Provider } from "react-redux";
import { afterEach } from "vitest";

// Hex color generator: produces strings like "#a1b2c3"
// fc.hexaString was removed in fast-check v4; use stringMatching instead
const hexColorArb = fc
  .stringMatching(/^[0-9a-f]{6}$/)
  .map((h) => `#${h}`);

// ── Helpers (mirrors src/app/theme/themeConfig.ts after migration) ────────────

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(
    0,
    Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)),
  );
  const g = Math.max(
    0,
    Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)),
  );
  const b = Math.max(
    0,
    Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)),
  );
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(
    255,
    Math.round(
      parseInt(hex.slice(1, 3), 16) +
        (255 - parseInt(hex.slice(1, 3), 16)) * amount,
    ),
  );
  const g = Math.min(
    255,
    Math.round(
      parseInt(hex.slice(3, 5), 16) +
        (255 - parseInt(hex.slice(3, 5), 16)) * amount,
    ),
  );
  const b = Math.min(
    255,
    Math.round(
      parseInt(hex.slice(5, 7), 16) +
        (255 - parseInt(hex.slice(5, 7), 16)) * amount,
    ),
  );
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Helper: build a minimal store with theme slice ────────────────────────────

async function makeThemeStore(primaryColor: string) {
  const { themeReducer } = await import("@/app/state/theme-slice");
  const { themeLoaded } = await import("@/app/state/theme-slice");

  const store = configureStore({ reducer: { theme: themeReducer } });
  store.dispatch(themeLoaded(primaryColor));
  return store;
}

describe("ThemeVars — exploration (MUST FAIL before implementation)", () => {
  afterEach(() => {
    // Clean up any CSS vars injected during tests
    const root = document.documentElement;
    root.style.removeProperty("--color-primary");
    root.style.removeProperty("--color-primary-dark");
    root.style.removeProperty("--color-primary-darker");
    root.style.removeProperty("--color-primary-light");
    root.style.removeProperty("--color-primary-lighter");
  });

  // Feature: dynamic-theming, Property 5: ThemeVars injects all CSS variables correctly
  // Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7
  it("P5 — ThemeVars injects all 5 CSS custom properties from store primaryColor", async () => {
    const ThemeVars = (await import("@/app/theme/ThemeVars")).default;

    await fc.assert(
      fc.asyncProperty(hexColorArb, async (color) => {
        const store = await makeThemeStore(color);

        render(
          <Provider store={store}>
            <ThemeVars />
          </Provider>,
        );

        const root = document.documentElement;

        expect(root.style.getPropertyValue("--color-primary")).toBe(color);
        expect(root.style.getPropertyValue("--color-primary-dark")).toBe(
          darkenHex(color, 0.18),
        );
        expect(root.style.getPropertyValue("--color-primary-darker")).toBe(
          darkenHex(color, 0.32),
        );
        expect(root.style.getPropertyValue("--color-primary-light")).toBe(
          lightenHex(color, 0.28),
        );
        expect(root.style.getPropertyValue("--color-primary-lighter")).toBe(
          lightenHex(color, 0.5),
        );

        // Clean up between iterations
        root.style.removeProperty("--color-primary");
        root.style.removeProperty("--color-primary-dark");
        root.style.removeProperty("--color-primary-darker");
        root.style.removeProperty("--color-primary-light");
        root.style.removeProperty("--color-primary-lighter");
      }),
      { numRuns: 100 },
    );
  });

  it("ThemeVars renders null (no DOM elements)", async () => {
    const ThemeVars = (await import("@/app/theme/ThemeVars")).default;
    const { themeReducer } = await import("@/app/state/theme-slice");
    const store = configureStore({ reducer: { theme: themeReducer } });

    const { container } = render(
      <Provider store={store}>
        <ThemeVars />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
