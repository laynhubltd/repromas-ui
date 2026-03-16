import { appPaths } from "@/routing/app-path";
import { persistor } from "@/store/store";
import type { ApiErrorResponse } from "@/utils/types/common-types";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginRequest } from "./auth-api";
import useAuthSlice from "./use-auth-slice";

export default function useAuth() {
  const navigate = useNavigate();
  const [loginMutation, { isLoading: isLoggingIn, error: loginError }] =
    authApi.useLoginMutation();
  const [refreshMutation] = authApi.useRefreshMutation();
  const slice = useAuthSlice();

  const tryRefreshToken = async () => {
    const refreshToken = slice.refreshToken;
    if (!refreshToken) throw new Error("No refresh token");
    const resp = await refreshMutation({
      refresh_token: refreshToken,
    }).unwrap();
    const accessToken =
      resp?.accessToken ?? (resp as { token?: string })?.token;
    if (accessToken) {
      slice.setToken({
        accessToken,
        refreshToken:
          (resp as { refresh_token?: string })?.refresh_token ?? refreshToken,
      });
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const resp = await loginMutation(credentials).unwrap();
      if (!resp) return;

      const token =
        resp.token ?? (resp as unknown as { accessToken?: string }).accessToken;
      const refreshToken =
        resp.refresh_token ??
        (resp as unknown as { refreshToken?: string }).refreshToken;

      slice.setAuthState({
        userProfile: resp.user ?? null,
        token: token ?? null,
        refreshToken: refreshToken ?? null,
        profiles: resp.profiles ?? [],
        currentRole: resp.user?.role ?? null,
        currentProfileId: resp.profiles?.[0]?.profileId ?? null,
      });

      if (resp.profiles?.length === 1 && resp.user) {
        slice.setCurrentProfileId(resp.profiles[0].profileId);
        slice.setUser(resp.user);
        slice.setCurrentRole(
          (resp.profiles[0].role ?? resp.user.role) as {
            name: string;
            privileges?: string[];
          },
        );
      }

      if (resp.profiles && resp.profiles.length > 1) {
        navigate(appPaths.roleSelection);
      } else {
        navigate(appPaths.dashboard);
      }
    } catch (ex) {
      const message = (ex as ApiErrorResponse).message;
      throw new Error(message);
    }
  };

  const logout = async () => {
    slice.clearAuth();
    await persistor.purge();
    navigate(appPaths.login);
  };

  return {
    ...slice,
    login,
    logout,
    tryRefreshToken,
    isLoggingIn,
    loginError,
  };
}
