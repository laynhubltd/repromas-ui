import type { BrandConfig } from "@/features/theming/types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export const DEFAULT_PRIMARY = "transparent"; // "#408A71";

interface ThemeState {
  primaryColor: string;
  systemName: string | undefined;
  schoolName: string | undefined;
  tagline: string | undefined;
  logoUrl: string | undefined;
  tenantName: string | undefined;
}

const initialState: ThemeState = {
  primaryColor: DEFAULT_PRIMARY,
  systemName: undefined,
  schoolName: undefined,
  tagline: undefined,
  logoUrl: undefined,
  tenantName: undefined,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    themeLoaded(state, action: PayloadAction<string>) {
      state.primaryColor = action.payload;
    },
    themeReset(state) {
      state.primaryColor = DEFAULT_PRIMARY;
    },
    brandingLoaded(state, action: PayloadAction<Partial<BrandConfig>>) {
      const { systemName, schoolName, tagline, logoUrl, tenantName } =
        action.payload;
      // API returns null for absent fields — coerce null → undefined
      if (systemName !== undefined) state.systemName = systemName ?? undefined;
      if (schoolName !== undefined) state.schoolName = schoolName ?? undefined;
      if (tagline !== undefined) state.tagline = tagline ?? undefined;
      if (logoUrl !== undefined) state.logoUrl = logoUrl ?? undefined;
      if (tenantName !== undefined) state.tenantName = tenantName ?? undefined;
    },
  },
});

export const { themeLoaded, themeReset, brandingLoaded } = themeSlice.actions;
export default themeSlice.reducer;
export const themeReducer = themeSlice.reducer;
