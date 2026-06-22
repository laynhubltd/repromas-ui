import { authApi } from "@/features/auth/api/auth-api";
import "@/features/admission-config/tabs/geography-rule/api/statesApi";
import "@/features/auth/candidate-signup/api/candidateSignupApi";
import "@/features/candidate-profile/api/candidateProfileApi";
import { authListenerMiddleware } from "@/features/auth/state/auth-listener";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "./api/baseApi";

import themeReducer from "@/app/state/theme-slice";
import admissionApplicationSessionReducer from "@/features/admission-application/state/admissionApplicationSessionSlice";
import { authReducer } from "@/features/auth/state/auth-slice";
import setupUiReducer from "@/features/tenant-setup/state/setupUiSlice";
import "@/features/tenant-setup/api/setupStatusApi";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "admissionApplicationSession"],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  auth: authReducer,
  admissionApplicationSession: admissionApplicationSessionReducer,
  theme: themeReducer,
  setupUi: setupUiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware, authApi.middleware, authListenerMiddleware.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
