import type { Permission } from "./permissions";
import type { PermissionRequirement } from "./types";

type RequirementObject = {
  anyOf?: readonly Permission[];
  allOf?: readonly Permission[];
  not?: Permission | readonly Permission[];
};

function isRequirementObject(
  req: PermissionRequirement | undefined | null,
): req is RequirementObject {
  return typeof req === "object" && req !== null && !Array.isArray(req);
}

/**
 * Pure policy evaluation function with zero dependencies on React or Redux.
 *
 * Evaluates whether a list of user permissions satisfies a `PermissionRequirement`.
 *
 * @param userPermissions Readonly list of permission slugs granted to the active user.
 * @param requirement The required permission specification.
 * @returns `true` if permitted, `false` otherwise.
 */
export function isPermitted(
  userPermissions: readonly string[],
  requirement: PermissionRequirement | undefined | null,
): boolean {
  if (!requirement) {
    return true;
  }

  // Single permission slug
  if (typeof requirement === "string") {
    return userPermissions.includes(requirement);
  }

  // Array of permissions -> anyOf shorthand
  if (Array.isArray(requirement)) {
    if (requirement.length === 0) return true;
    return requirement.some((perm: Permission) => userPermissions.includes(perm));
  }

  // Complex object { anyOf?, allOf?, not? }
  if (isRequirementObject(requirement)) {
    // Check 'not' condition first
    if (requirement.not !== undefined) {
      const notPerms = Array.isArray(requirement.not)
        ? requirement.not
        : [requirement.not];
      // If user has any of the 'not' permissions, deny
      if (notPerms.some((perm: Permission) => userPermissions.includes(perm))) {
        return false;
      }
    }

    // Check 'anyOf' condition
    if (requirement.anyOf !== undefined && requirement.anyOf.length > 0) {
      const passesAnyOf = requirement.anyOf.some((perm: Permission) =>
        userPermissions.includes(perm),
      );
      if (!passesAnyOf) {
        return false;
      }
    }

    // Check 'allOf' condition
    if (requirement.allOf !== undefined && requirement.allOf.length > 0) {
      const passesAllOf = requirement.allOf.every((perm: Permission) =>
        userPermissions.includes(perm),
      );
      if (!passesAllOf) {
        return false;
      }
    }

    return true;
  }

  return false;
}
