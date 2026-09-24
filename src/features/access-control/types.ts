import type { Permission } from "./permissions";

/**
 * Polymorphic permission requirement value type.
 *
 * Supported formats:
 * - `undefined` | `null` | `[]`: Always permitted (unrestricted)
 * - `Permission`: Single permission requirement
 * - `readonly Permission[]`: Shorthand for `anyOf` (matches existing codebase convention)
 * - `{ anyOf?: readonly Permission[]; allOf?: readonly Permission[]; not?: Permission | readonly Permission[] }`:
 *   Combined logic where all specified conditions must pass.
 */
export type PermissionRequirement =
  | Permission
  | readonly Permission[]
  | {
      anyOf?: readonly Permission[];
      allOf?: readonly Permission[];
      not?: Permission | readonly Permission[];
    };
