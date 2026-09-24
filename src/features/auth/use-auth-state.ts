import { useAppSelector } from "@/app/hooks";
import { useContext } from "react";
import { ReactReduxContext } from "react-redux";

const EMPTY_AUTH_STATE = {
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  userProfile: null,
  profiles: [],
  currentRole: null,
  currentProfileId: null,
  bootstrapComplete: false,
  roles: [],
  permissions: [],
  activeRole: null,
  roleSwitcherOpen: false,
  tenantId: null,
  entity: null,
};

export default function useAuthState() {
  const reduxContext = useContext(ReactReduxContext);

  if (!reduxContext) {
    return EMPTY_AUTH_STATE;
  }

  return useAppSelector((state) => state.auth);
}
