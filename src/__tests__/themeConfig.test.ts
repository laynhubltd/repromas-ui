/**
 * themeConfig — PBT Exploration Tests
 *
 * These tests MUST FAIL before implementation — failure confirms
 * `buildThemeConfig` does not exist yet in src/app/theme/themeConfig.ts.
 * DO NOT fix the code when these tests fail.
 *
 * Validates: Requirements 3.1, 3.2, 5.3, 5.5
 */

import * as fc from "fast-check";

// Hex color generator: produces strings like "#a1b2c3"
// fc.hexaString was removed in fast-check v4; use stringMatching instead
const hexColorArb = fc
  .stringMatching(/^[0-9a-f]{6}$/)
  .map((h) => `#${h}`);

// ── Helpers (duplicated from src/config/theme.ts for comparison) ─────────────

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

// ── Non-color token constants from src/config/theme.ts (preservation baseline) ─

const EXPECTED_NON_COLOR_TOKENS = {
  borderRadius: 4,
  borderRadiusLG: 4,
  fontFamily: '"Inter", sans-serif',
  fontFamilyCode: '"Inter", sans-serif',
  fontSize: 14,
  lineHeight: 1.5,
  sizeUnit: 4,
  sizeStep: 4,
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
} as const;

const EXPECTED_BUTTON_TOKENS = {
  borderRadius: 4,
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
  fontWeight: 500,
} as const;

const EXPECTED_INPUT_TOKENS = {
  borderRadius: 4,
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
} as const;

const EXPECTED_LAYOUT_TOKENS = {
  headerHeight: 64,
  headerPadding: "0 24px",
} as const;

const EXPECTED_MENU_TOKENS = {
  itemActiveBg: "transparent",
  itemHoverBg: "rgba(255,255,255,0.08)",
  itemHoverColor: "#ffffff",
  itemSelectedBg: "#ffffff",
  itemColor: "rgba(255,255,255,0.9)",
  subMenuItemBg: "transparent",
  borderRadius: 8,
  itemBorderRadius: 8,
  itemMarginBlock: 2,
  itemPaddingInline: 16,
  boxShadow: "none",
  itemHeight: 48,
} as const;

// ── Preservation Tests ───────────────────────────────────────────────────────
// These tests MUST PASS now (against src/config/theme.ts) AND after migration
// (when buildThemeConfig in src/app/theme/themeConfig.ts replaces it).
// Validates: Requirements 5.3, 5.5

describe("themeConfig — preservation (MUST PASS before and after migration)", () => {
  // src/config/theme.ts has been deleted (migration complete).
  // Verify the same non-color values are present in buildThemeConfig output.
  let themeConfig: import("antd").ThemeConfig;

  beforeAll(async () => {
    const { buildThemeConfig, DEFAULT_PRIMARY } = await import("@/app/theme/themeConfig");
    themeConfig = buildThemeConfig(DEFAULT_PRIMARY);
  });

  describe("token non-color fields", () => {
    it("has correct borderRadius", () => {
      expect((themeConfig.token as Record<string, unknown>)?.borderRadius).toBe(4);
    });
    it("has correct borderRadiusLG", () => {
      expect((themeConfig.token as Record<string, unknown>)?.borderRadiusLG).toBe(4);
    });
    it("has correct fontFamily", () => {
      expect((themeConfig.token as Record<string, unknown>)?.fontFamily).toBe('"Inter", sans-serif');
    });
    it("has correct fontFamilyCode", () => {
      expect((themeConfig.token as Record<string, unknown>)?.fontFamilyCode).toBe('"Inter", sans-serif');
    });
    it("has correct fontSize", () => {
      expect((themeConfig.token as Record<string, unknown>)?.fontSize).toBe(14);
    });
    it("has correct lineHeight", () => {
      expect((themeConfig.token as Record<string, unknown>)?.lineHeight).toBe(1.5);
    });
    it("has correct sizeUnit", () => {
      expect((themeConfig.token as Record<string, unknown>)?.sizeUnit).toBe(4);
    });
    it("has correct sizeStep", () => {
      expect((themeConfig.token as Record<string, unknown>)?.sizeStep).toBe(4);
    });
    it("has correct controlHeight", () => {
      expect((themeConfig.token as Record<string, unknown>)?.controlHeight).toBe(40);
    });
    it("has correct controlHeightSM", () => {
      expect((themeConfig.token as Record<string, unknown>)?.controlHeightSM).toBe(32);
    });
    it("has correct controlHeightLG", () => {
      expect((themeConfig.token as Record<string, unknown>)?.controlHeightLG).toBe(48);
    });
  });

  describe("Button component overrides", () => {
    let button: Record<string, unknown>;
    beforeAll(() => {
      button = themeConfig.components?.Button as Record<string, unknown>;
    });
    it("has correct borderRadius", () => expect(button?.borderRadius).toBe(4));
    it("has correct controlHeight", () => expect(button?.controlHeight).toBe(40));
    it("has correct controlHeightSM", () => expect(button?.controlHeightSM).toBe(32));
    it("has correct controlHeightLG", () => expect(button?.controlHeightLG).toBe(48));
    it("has correct fontWeight", () => expect(button?.fontWeight).toBe(500));
  });

  describe("Input component overrides", () => {
    let input: Record<string, unknown>;
    beforeAll(() => {
      input = themeConfig.components?.Input as Record<string, unknown>;
    });
    it("has correct borderRadius", () => expect(input?.borderRadius).toBe(4));
    it("has correct controlHeight", () => expect(input?.controlHeight).toBe(40));
    it("has correct controlHeightSM", () => expect(input?.controlHeightSM).toBe(32));
    it("has correct controlHeightLG", () => expect(input?.controlHeightLG).toBe(48));
  });

  describe("Layout component overrides (non-color)", () => {
    let layout: Record<string, unknown>;
    beforeAll(() => {
      layout = themeConfig.components?.Layout as Record<string, unknown>;
    });
    it("has correct headerHeight", () => expect(layout?.headerHeight).toBe(64));
    it("has correct headerPadding", () => expect(layout?.headerPadding).toBe("0 24px"));
  });

  describe("Menu component overrides (non-color)", () => {
    let menu: Record<string, unknown>;
    beforeAll(() => {
      menu = themeConfig.components?.Menu as Record<string, unknown>;
    });
    it("has correct itemActiveBg", () => expect(menu?.itemActiveBg).toBe("transparent"));
    it("has correct itemHoverBg", () => expect(menu?.itemHoverBg).toBe("rgba(255,255,255,0.08)"));
    it("has correct itemHoverColor", () => expect(menu?.itemHoverColor).toBe("#ffffff"));
    it("has correct itemSelectedBg", () => expect(menu?.itemSelectedBg).toBe("#ffffff"));
    it("has correct itemColor", () => expect(menu?.itemColor).toBe("rgba(255,255,255,0.9)"));
    it("has correct subMenuItemBg", () => expect(menu?.subMenuItemBg).toBe("transparent"));
    it("has correct borderRadius", () => expect(menu?.borderRadius).toBe(8));
    it("has correct itemBorderRadius", () => expect(menu?.itemBorderRadius).toBe(8));
    it("has correct itemMarginBlock", () => expect(menu?.itemMarginBlock).toBe(2));
    it("has correct itemPaddingInline", () => expect(menu?.itemPaddingInline).toBe(16));
    it("has correct boxShadow", () => expect(menu?.boxShadow).toBe("none"));
    it("has correct itemHeight", () => expect(menu?.itemHeight).toBe(48));
  });

  describe("Table component overrides (non-color)", () => {
    let table: Record<string, unknown>;
    beforeAll(() => {
      table = themeConfig.components?.Table as Record<string, unknown>;
    });
    it("has correct borderRadius", () => expect(table?.borderRadius).toBe(8));
  });

  describe("Card component overrides (non-color)", () => {
    let card: Record<string, unknown>;
    beforeAll(() => {
      card = themeConfig.components?.Card as Record<string, unknown>;
    });
    it("has correct borderRadius", () => expect(card?.borderRadius).toBe(4));
    it("has correct paddingLG", () => expect(card?.paddingLG).toBe(24));
    it("has correct padding", () => expect(card?.padding).toBe(16));
  });
});

// ── Exploration Tests (MUST FAIL before implementation) ──────────────────────

describe("themeConfig — exploration (MUST FAIL before implementation)", () => {
  // Feature: dynamic-theming, Property 3: buildThemeConfig colorPrimary matches input
  // Validates: Requirements 3.1, 3.4
  it("P3 — buildThemeConfig colorPrimary matches input color", async () => {
    const { buildThemeConfig } = await import("@/app/theme/themeConfig");

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const config = buildThemeConfig(color);
        expect(config.token?.colorPrimary).toBe(color);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: dynamic-theming, Property 4: buildThemeConfig derived tokens consistent
  // Validates: Requirements 3.2
  it("P4 — buildThemeConfig derived tokens are computed from primaryColor", async () => {
    const { buildThemeConfig } = await import("@/app/theme/themeConfig");

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const config = buildThemeConfig(color);
        const layout = config.components?.Layout as Record<string, unknown>;
        const menu = config.components?.Menu as Record<string, unknown>;

        expect(layout?.["headerBg"]).toBe(darkenHex(color, 0.32));
        expect(layout?.["siderBg"]).toBe(darkenHex(color, 0.32));
        expect(menu?.["itemSelectedColor"]).toBe(color);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: dynamic-theming, Property 6: Non-color tokens preserved in migration
  // Validates: Requirements 5.3, 5.5
  it("P6 — non-color tokens are identical to original src/config/theme.ts values", async () => {
    const { buildThemeConfig } = await import("@/app/theme/themeConfig");

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const config = buildThemeConfig(color);
        const token = config.token as Record<string, unknown>;
        const button = config.components?.Button as Record<string, unknown>;
        const input = config.components?.Input as Record<string, unknown>;
        const layout = config.components?.Layout as Record<string, unknown>;
        const menu = config.components?.Menu as Record<string, unknown>;

        // Token non-color fields
        for (const [key, value] of Object.entries(EXPECTED_NON_COLOR_TOKENS)) {
          expect(token?.[key]).toBe(value);
        }

        // Button component overrides
        for (const [key, value] of Object.entries(EXPECTED_BUTTON_TOKENS)) {
          expect(button?.[key]).toBe(value);
        }

        // Input component overrides
        for (const [key, value] of Object.entries(EXPECTED_INPUT_TOKENS)) {
          expect(input?.[key]).toBe(value);
        }

        // Layout non-color overrides
        for (const [key, value] of Object.entries(EXPECTED_LAYOUT_TOKENS)) {
          expect(layout?.[key]).toBe(value);
        }

        // Menu non-color overrides
        for (const [key, value] of Object.entries(EXPECTED_MENU_TOKENS)) {
          expect(menu?.[key]).toBe(value);
        }
      }),
      { numRuns: 100 },
    );
  });
});
