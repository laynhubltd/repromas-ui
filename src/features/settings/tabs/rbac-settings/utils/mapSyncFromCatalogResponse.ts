import type { SyncFromCatalogResponse } from "../types/rbac";

type RawSyncFromCatalogResponse = Record<string, unknown>;

function readNumber(raw: RawSyncFromCatalogResponse, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readStringArray(raw: RawSyncFromCatalogResponse, snake: string, camel: string): string[] {
  const value = raw[snake] ?? raw[camel];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readCreatedTenantPermissions(
  raw: RawSyncFromCatalogResponse,
): SyncFromCatalogResponse["createdTenantPermissions"] {
  const value =
    raw.created_tenant_permissions ?? raw.createdTenantPermissions;
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const slug = entry.slug;
      const id = entry.id;
      if (typeof slug !== "string" || typeof id !== "number") return null;
      return { slug, id };
    })
    .filter((item): item is SyncFromCatalogResponse["createdTenantPermissions"][number] =>
      item !== null,
    );
}

function readSkipped(raw: RawSyncFromCatalogResponse): SyncFromCatalogResponse["skipped"] {
  const value = raw.skipped;
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const slug = entry.slug;
      const reason = entry.reason;
      if (typeof slug !== "string" || typeof reason !== "string") return null;
      return { slug, reason };
    })
    .filter((item): item is SyncFromCatalogResponse["skipped"][number] => item !== null);
}

function readWarnings(raw: RawSyncFromCatalogResponse): string[] {
  const value = raw.warnings;
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Normalize sync-from-catalog API payload (snake_case or camelCase) to camelCase. */
export function mapSyncFromCatalogResponse(raw: unknown): SyncFromCatalogResponse {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawSyncFromCatalogResponse;

  return {
    catalogueCreatedCount: readNumber(data, "catalogue_created_count", "catalogueCreatedCount"),
    catalogueUpdatedCount: readNumber(data, "catalogue_updated_count", "catalogueUpdatedCount"),
    catalogueTotal: readNumber(data, "catalogue_total", "catalogueTotal"),
    tenantPermissionsCreatedCount: readNumber(
      data,
      "tenant_permissions_created_count",
      "tenantPermissionsCreatedCount",
    ),
    tenantPermissionsSkippedCount: readNumber(
      data,
      "tenant_permissions_skipped_count",
      "tenantPermissionsSkippedCount",
    ),
    assignedToSystemAdministratorCount: readNumber(
      data,
      "assigned_to_system_administrator_count",
      "assignedToSystemAdministratorCount",
    ),
    createdCatalogueSlugs: readStringArray(
      data,
      "created_catalogue_slugs",
      "createdCatalogueSlugs",
    ),
    createdTenantPermissions: readCreatedTenantPermissions(data),
    skipped: readSkipped(data),
    warnings: readWarnings(data),
  };
}
