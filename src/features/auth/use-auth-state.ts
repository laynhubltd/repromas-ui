import { useAppSelector } from "@/app/hooks";

export default function useAuthState() {
  const {
    token,
    refreshToken,
    isAuthenticated,
    userProfile,
    profiles,
    currentRole,
    currentProfileId,
    bootstrapComplete,
    roles,
    permissions,
    activeRole,
    roleSwitcherOpen,
  } = useAppSelector((state) => state.auth);

  return {
    token,
    refreshToken,
    isAuthenticated,
    userProfile,
    profiles,
    currentRole,
    currentProfileId,
    bootstrapComplete,
    roles,
    permissions,
    activeRole,
    roleSwitcherOpen,
  };
}
