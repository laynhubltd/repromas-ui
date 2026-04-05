import { isTokenExpired } from "@/shared/utils/token-util";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { authCleared, roleSelected, roleSwitched, userLoggedIn } from "../events";
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
    // No redirect needed — HostRouter reads auth state directly
    // and transitions to the authenticated route tree on its own.
  },
});

startListening({
  actionCreator: roleSelected,
  effect: async (action, listenerApi) => {
    // Hook point for future analytics / persistence
    // Dispatch roleSwitched to signal mid-session completion
    listenerApi.dispatch(roleSwitched(action.payload));
  },
});

startListening({
  actionCreator: roleSwitched,
  effect: async (_action, _listenerApi) => {
    // Hook point for future analytics
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
