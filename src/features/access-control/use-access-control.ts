import useAuthState from "@/features/auth/use-auth-state";
import { hasItems } from "@/shared/utils/array-utils";
import { Privilege } from "./privileges-enum";

type PrivilegeConfig = { hasAll?: boolean };

export function useAccessControl() {
  const { currentRole, userProfile } = useAuthState();
  const privileges = currentRole?.privileges ?? [];
  const company = userProfile?.company;

  const hasPrivilege = (
    privilege: Privilege | Privilege[],
    config?: PrivilegeConfig,
  ): boolean => {
    if (!hasItems(privileges)) return true;
    if (typeof privilege === "string") return privileges.includes(privilege);
    if (Array.isArray(privilege)) {
      if (config?.hasAll) return privilege.every((p) => privileges.includes(p));
      return privilege.some((p) => privileges.includes(p));
    }
    return false;
  };

  const hasRole = (roleName: string): boolean => {
    return currentRole?.name === roleName;
  };

  return {
    company,
    currentRole,
    privileges,
    hasPrivilege,
    hasRole,
  };
}
