import type { ApiRole, AuthProfile, LoginResponse, UserProfile } from "../types";
import {
  AUTH_ROLE_SCOPES,
  type AuthRoleScope,
  type RoleEntity,
} from "../types/role-entity";

type RawRecord = Record<string, unknown>;

function readAuthRoleScope(scope: string): AuthRoleScope {
  if ((AUTH_ROLE_SCOPES as string[]).includes(scope)) {
    return scope as AuthRoleScope;
  }
  return scope as AuthRoleScope;
}

function readRoleEntity(value: unknown): RoleEntity {
  if (value === undefined || value === null) {
    return null;
  }
  return value as RoleEntity;
}

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

function readNumber(raw: RawRecord, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readNullableString(
  raw: RawRecord,
  snake: string,
  camel: string,
): string | null {
  const value = raw[snake] ?? raw[camel];
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : null;
}

function readNullableNumber(
  raw: RawRecord,
  snake: string,
  camel: string,
): number | null {
  const value = raw[snake] ?? raw[camel];
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : null;
}

function readScopeReferenceId(raw: RawRecord): number | null {
  const value = raw.scope_reference_id ?? raw.scopeReferenceId;
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function readRole(raw: unknown): ApiRole | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawRecord;
  const scope = readString(r, "scope", "scope");
  if (!scope) return null;
  const entity = r.entity;
  return {
    name: readString(r, "name", "name") || scope,
    scope: readAuthRoleScope(scope),
    scopeReferenceId: readScopeReferenceId(r),
    entity: readRoleEntity(entity),
  };
}

function readProfile(raw: RawRecord, topLevelTenantId: number | null): AuthProfile {
  const profile = raw.profile;
  const p =
    profile && typeof profile === "object" ? (profile as RawRecord) : ({} as RawRecord);

  const tenantId =
    readNumber(p, "tenant_id", "tenantId") ||
    topLevelTenantId ||
    0;

  return {
    id: readNumber(p, "id", "id"),
    userId: readNumber(p, "user_id", "userId"),
    tenantId,
    firstName: readNullableString(p, "first_name", "firstName"),
    lastName: readNullableString(p, "last_name", "lastName"),
    phoneNumber: readNullableString(p, "phone_number", "phoneNumber"),
    dateOfBirth: readNullableString(p, "date_of_birth", "dateOfBirth"),
    score: readNumber(p, "score", "score"),
    metadata: p.metadata === undefined ? null : p.metadata,
    email: readString(p, "email", "email"),
  };
}

export function mapAuthProfileToUserProfile(profile: AuthProfile): UserProfile {
  return {
    id: String(profile.id),
    userId: profile.userId,
    tenantId: profile.tenantId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  };
}

export function mapLoginResponse(raw: unknown): LoginResponse {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  const topLevelTenantId = readNullableNumber(data, "tenant_id", "tenantId");

  const rolesRaw = data.roles;
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw
        .map(readRole)
        .filter((r): r is ApiRole => r !== null)
    : [];

  const permissionsRaw = data.permissions;
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.filter((p): p is string => typeof p === "string")
    : [];

  return {
    token: readString(data, "token", "token"),
    refresh_token: readString(data, "refresh_token", "refreshToken"),
    profile: readProfile(data, topLevelTenantId),
    roles,
    permissions,
  };
}
