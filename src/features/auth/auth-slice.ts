import type { MaybeNull } from "@/utils/types/common-types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile, UserRole } from "./auth-api";

export type SimpleUserProfile = {
  profileId: string;
  role: { name: string };
  company: { id: string; name: string; type?: string };
};

export type AuthState = {
  userProfile: MaybeNull<UserProfile>;
  token: MaybeNull<string>;
  refreshToken: MaybeNull<string>;
  profiles: SimpleUserProfile[];
  currentRole: MaybeNull<UserRole>;
  currentProfileId: MaybeNull<string>;
};

const initialState: AuthState = {
  userProfile: null,
  token: null,
  refreshToken: null,
  profiles: [],
  currentRole: null,
  currentProfileId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (_, action: PayloadAction<AuthState>) => action.payload,
    setToken: (
      state,
      action: PayloadAction<{ accessToken?: string; refreshToken?: string }>,
    ) => {
      if (action.payload.accessToken) state.token = action.payload.accessToken;
      if (action.payload.refreshToken)
        state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.userProfile = action.payload;
    },
    setCurrentRole: (state, action: PayloadAction<UserRole | null>) => {
      state.currentRole = action.payload;
    },
    setCurrentProfileId: (state, action: PayloadAction<string | null>) => {
      state.currentProfileId = action.payload;
    },
    setProfiles: (state, action: PayloadAction<SimpleUserProfile[]>) => {
      state.profiles = action.payload;
    },
    clearAuth: () => initialState,
  },
});

export const {
  setAuthState,
  setToken,
  setUser,
  setCurrentRole,
  setCurrentProfileId,
  setProfiles,
  clearAuth,
} = authSlice.actions;
export default authSlice;
