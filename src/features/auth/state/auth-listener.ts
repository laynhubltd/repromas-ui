import { appPaths } from "@/app/routing/app-path";
import { isTokenExpired } from "@/shared/utils/token-util";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { authCleared, userLoggedIn } from "../events";
import { type AuthState } from "./auth-slice";

type ListenerRootState = { auth: AuthState };

export const authListenerMiddleware = createListenerMiddleware();

const startListening = authListenerMiddleware.startListening.withTypes<
  ListenerRootState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>();

startListening({
  actionCreator: userLoggedIn,
  effect: async () => {
    const { persistor } = await import("@/app/store");
    await persistor.flush();
    window.location.replace(appPaths.dashboard);
  },
});

startListening({
  predicate: (action) => action.type === REHYDRATE,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState();
    const { token } = state.auth;

    if (!token || isTokenExpired(token)) {
      listenerApi.dispatch(authCleared());
    }
  },
});
