import { describe, expect, it } from "vitest";
import { mapSyncFromCatalogResponse } from "./mapSyncFromCatalogResponse";

describe("mapSyncFromCatalogResponse", () => {
  it("maps snake_case API payload from documentation", () => {
    const result = mapSyncFromCatalogResponse({
      catalogue_created_count: 6,
      catalogue_updated_count: 0,
      catalogue_total: 420,
      tenant_permissions_created_count: 6,
      tenant_permissions_skipped_count: 414,
      assigned_to_system_administrator_count: 6,
      created_catalogue_slugs: ["billing-fee-charges:read"],
      created_tenant_permissions: [{ slug: "billing-fee-charges:read", id: 501 }],
      skipped: [{ slug: "students:read", reason: "already_exists" }],
      warnings: [],
    });

    expect(result).toEqual({
      catalogueCreatedCount: 6,
      catalogueUpdatedCount: 0,
      catalogueTotal: 420,
      tenantPermissionsCreatedCount: 6,
      tenantPermissionsSkippedCount: 414,
      assignedToSystemAdministratorCount: 6,
      createdCatalogueSlugs: ["billing-fee-charges:read"],
      createdTenantPermissions: [{ slug: "billing-fee-charges:read", id: 501 }],
      skipped: [{ slug: "students:read", reason: "already_exists" }],
      warnings: [],
    });
  });

  it("maps camelCase payload", () => {
    const result = mapSyncFromCatalogResponse({
      catalogueCreatedCount: 1,
      catalogueUpdatedCount: 2,
      catalogueTotal: 3,
      tenantPermissionsCreatedCount: 4,
      tenantPermissionsSkippedCount: 5,
      assignedToSystemAdministratorCount: 0,
      createdCatalogueSlugs: ["foo:read"],
      createdTenantPermissions: [{ slug: "foo:read", id: 10 }],
      skipped: [],
      warnings: ["No System Administrator role found"],
    });

    expect(result.assignedToSystemAdministratorCount).toBe(0);
    expect(result.warnings).toEqual(["No System Administrator role found"]);
  });

  it("returns safe defaults for invalid input", () => {
    expect(mapSyncFromCatalogResponse(null)).toEqual({
      catalogueCreatedCount: 0,
      catalogueUpdatedCount: 0,
      catalogueTotal: 0,
      tenantPermissionsCreatedCount: 0,
      tenantPermissionsSkippedCount: 0,
      assignedToSystemAdministratorCount: 0,
      createdCatalogueSlugs: [],
      createdTenantPermissions: [],
      skipped: [],
      warnings: [],
    });
  });
});
