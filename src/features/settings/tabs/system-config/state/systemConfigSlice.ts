import { createSlice } from "@reduxjs/toolkit";
import systemConfigApi from "../api/systemConfigApi";
import type { ConfigKey } from "../types/system-config";

export interface SystemConfigState {
  configs: Partial<Record<ConfigKey, any>>;
  isBootstrapped: boolean;
}

const initialState: SystemConfigState = {
  configs: {},
  isBootstrapped: false,
};

export const systemConfigSlice = createSlice({
  name: "systemConfig",
  initialState,
  reducers: {
    clearSystemConfigs: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        systemConfigApi.endpoints.listSystemConfigs.matchFulfilled,
        (state, action: any) => {
          const newConfigs: Partial<Record<ConfigKey, unknown>> = {};
          for (const item of action.payload.member) {
            newConfigs[item.configKey as ConfigKey] = item.configValue;
          }
          state.configs = newConfigs;
          state.isBootstrapped = true;
        }
      )
      .addMatcher(
        systemConfigApi.endpoints.createSystemConfig.matchFulfilled,
        (state, action: any) => {
          state.configs[action.payload.configKey as ConfigKey] = action.payload.configValue;
        }
      )
      .addMatcher(
        systemConfigApi.endpoints.updateSystemConfig.matchFulfilled,
        (state, action: any) => {
          state.configs[action.payload.configKey as ConfigKey] = action.payload.configValue;
        }
      );
  },
});

export const { clearSystemConfigs } = systemConfigSlice.actions;
export const systemConfigReducer = systemConfigSlice.reducer;
