import type { ThemeConfig } from "antd";

/** Hex to rgba string for a given alpha (0–1) */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darken a hex color by amount (0–1). */
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

/** Lighten a hex color by amount (0–1). */
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

/**
 * Single source of truth for primary color.
 * Change this value only – primaryDark, primaryLight, headerBg, siderBg, etc. are derived automatically.
 */
const primary = "#006747";

/** All primary variants are derived from `primary` so one change updates the whole theme. */
export const colors = {
  primary,
  primaryDark: darkenHex(primary, 0.18),
  primaryDarker: darkenHex(primary, 0.32),
  primaryLight: lightenHex(primary, 0.28),
  primaryLighter: lightenHex(primary, 0.5),
  success: "#28a745",
  error: "#dc3545",
  warning: "#ffc107",
  info: "#17a2b8",
  text: "#212529",
  textSecondary: "#666666",
  textTertiary: "#6c757d",
  border: "#dee2e6",
  borderLight: "#e9ecef",
  background: "#ffffff",
  backgroundLight: "#f8f9fa",
  backgroundLighter: "#f5f5f5",
  headerBg: darkenHex(primary, 0.32),
  siderBg: darkenHex(primary, 0.32),
  siderHover: darkenHex(primary, 0.18),
} as const;

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    borderRadius: 4,
    borderRadiusLG: 4,
    boxShadowSecondary:
      "0 6px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    fontFamily: '"Inter", sans-serif',
    fontFamilyCode: '"Inter", sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    colorText: colors.text,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderLight,
    colorBgContainer: colors.background,
    colorBgElevated: colors.backgroundLight,
    colorBgLayout: colors.backgroundLighter,
    sizeUnit: 4,
    sizeStep: 4,
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 48,
      primaryColor: colors.background,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 4,
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 48,
    },
    Card: {
      borderRadius: 4,
      paddingLG: 24,
      padding: 16,
      headerBg: colors.backgroundLight,
    },
    Layout: {
      headerBg: colors.headerBg,
      headerHeight: 64,
      headerPadding: "0 24px",
      siderBg: colors.siderBg,
      bodyBg: colors.backgroundLighter,
    },
    Menu: {
      itemActiveBg: "transparent",
      itemHoverBg: "rgba(255,255,255,0.08)",
      itemHoverColor: colors.background,
      itemSelectedBg: colors.background,
      itemSelectedColor: colors.primary,
      itemColor: "rgba(255,255,255,0.9)",
      subMenuItemBg: "transparent",
      borderRadius: 8,
      itemBorderRadius: 8,
      itemMarginBlock: 2,
      itemPaddingInline: 16,
      boxShadow: "none",
      itemHeight: 48,
    },
    Typography: {
      colorText: colors.text,
      colorTextSecondary: colors.textSecondary,
    },
    Table: {
      borderRadius: 8,
      headerBg: colors.backgroundLight,
    },
  },
};
