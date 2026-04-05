import { createSlice, type AnyAction, type PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import {
  authCleared,
  profileFetched,
  roleSelected,
  tokenRefreshed,
  userLoggedIn,
  userLoggedOut
} from "../events";
import type { ApiRole, SimpleUserProfile, UserProfile, UserRole } from "../types";

export interface AuthState {
  userProfile: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  profiles: SimpleUserProfile[];
  currentRole: UserRole | null;
  currentProfileId: string | null;
  bootstrapComplete: boolean;
  roles: ApiRole[];
  permissions: string[];
  activeRole: ApiRole | null;
  roleSwitcherOpen: boolean;
}

const initialState: AuthState = {
  userProfile: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  profiles: [],
  currentRole: null,
  currentProfileId: null,
  bootstrapComplete: false,
  roles: [],
  permissions: [],
  activeRole: null,
  roleSwitcherOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      state.userProfile = action.payload.userProfile;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.profiles = action.payload.profiles;
      state.currentRole = action.payload.currentRole;
      state.currentProfileId = action.payload.currentProfileId;
      state.bootstrapComplete = action.payload.bootstrapComplete;
      state.roles = action.payload.roles ?? [];
      state.permissions = action.payload.permissions ?? [];
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.userProfile = action.payload;
    },
    setToken: (
      state,
      action: PayloadAction<{ accessToken?: string; refreshToken?: string }>,
    ) => {
      state.token = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = !!action.payload.accessToken;
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
    roleSwitcherOpened: (state) => {
      state.roleSwitcherOpen = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLoggedIn, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh_token ?? null;
        const roles = action.payload.roles ?? [];
        state.roles = roles;
        state.permissions = action.payload.permissions ?? [];
        state.userProfile = action.payload.user ?? null;
        state.profiles = action.payload.profiles ?? [];
        state.isAuthenticated = true;
        state.bootstrapComplete = false;

        if (roles.length === 1) {
          state.activeRole = roles[0];
          state.roleSwitcherOpen = false;
        } else if (roles.length > 1) {
          state.activeRole = null;
          state.roleSwitcherOpen = true;
        } else {
          state.activeRole = null;
          state.roleSwitcherOpen = false;
        }

        // backward compat: keep currentRole in sync
        const first = roles[0];
        state.currentRole = first ? { name: first.name } : null;
      })
      .addCase(profileFetched, (state, action) => {
        state.userProfile = action.payload;
        state.bootstrapComplete = true;
      })
      .addCase(tokenRefreshed, (state, action) => {
        state.token = action.payload.accessToken ?? state.token;
        state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      })
      .addCase(authCleared, () => initialState)
      .addCase(userLoggedOut, () => initialState)
      .addCase(roleSelected, (state, action) => {
        state.activeRole = action.payload;
        state.roleSwitcherOpen = false;
        state.currentRole = { name: action.payload.name };
      })
      .addCase(REHYDRATE, (_state, action: AnyAction) => {
        if (action.payload?.auth) {
          return {
            ...action.payload.auth,
            bootstrapComplete: false,
            roleSwitcherOpen: false,
          };
        }
        return initialState;
      });
  },
});

export const {
  setAuthState,
  setUser,
  setToken,
  setCurrentRole,
  setCurrentProfileId,
  setProfiles,
  clearAuth,
  roleSwitcherOpened,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
