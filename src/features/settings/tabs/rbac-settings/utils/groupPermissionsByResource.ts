import type { Permission, ResourceGroup } from "../types/rbac";

/**
 * Groups an array of permissions by their resource prefix (the part of the slug before the first colon).
 * Returns an array of ResourceGroup sorted alphabetically by resource name.
 * Returns an empty array for empty input.
 */
export function groupPermissionsByResource(permissions: Permission[]): ResourceGroup[] {
  if (permissions.length === 0) return [];

  const map = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const colonIndex = permission.slug.indexOf(":");
    const resource = colonIndex !== -1 ? permission.slug.slice(0, colonIndex) : permission.slug;

    const group = map.get(resource);
    if (group) {
      group.push(permission);
    } else {
      map.set(resource, [permission]);
    }
  }

  return Array.from(map.entries())
    .map(([resource, perms]) => ({
      resource,
      label: resource.charAt(0).toUpperCase() + resource.slice(1),
      permissions: perms,
    }))
    .sort((a, b) => a.resource.localeCompare(b.resource));
}
