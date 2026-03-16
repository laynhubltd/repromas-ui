import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";
import type { UserProfile, UserRole } from "./auth-api";
import type { SimpleUserProfile } from "./auth-slice";
import authSlice from "./auth-slice";

const actions = authSlice.actions;

export default function useAuthSlice() {
  const state = useAppSelector((s: RootState) => s.auth);
  const dispatch = useAppDispatch();
  return {
    ...state,
    setAuthState: (payload: RootState["auth"]) =>
      dispatch(actions.setAuthState(payload)),
    setUser: (payload: UserProfile) => dispatch(actions.setUser(payload)),
    setToken: (payload: { accessToken?: string; refreshToken?: string }) =>
      dispatch(actions.setToken(payload)),
    setCurrentRole: (payload: UserRole | null) =>
      dispatch(actions.setCurrentRole(payload)),
    setCurrentProfileId: (payload: string | null) =>
      dispatch(actions.setCurrentProfileId(payload)),
    setProfiles: (payload: SimpleUserProfile[]) =>
      dispatch(actions.setProfiles(payload)),
    clearAuth: () => dispatch(actions.clearAuth()),
  };
}
