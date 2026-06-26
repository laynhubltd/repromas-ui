/**
 * Mock auth for development – allows login and dashboard access without the real API.
 * Enable with VITE_USE_MOCK_AUTH=true in .env.
 */

import { Permission } from "@/features/access-control/permissions";
import type { ApiRole, AuthProfile, LoginRequest, LoginResponse } from "./types";

const MOCK_JWT_EXP = 9999999999; // Far future so token is never “expired”

function base64UrlEncode(input: string): string {
  const base64 =
    typeof btoa !== "undefined"
      ? btoa(input)
      : Buffer.from(input, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build a JWT-like token that passes isTokenExpired (has valid exp). */
function createMockJwt(sub = "mock-user"): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub,
      exp: MOCK_JWT_EXP,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const signature = base64UrlEncode("mock-signature");
  return `${header}.${payload}.${signature}`;
}

const MOCK_ROLE: ApiRole = {
  name: "Admin",
  scope: "GLOBAL",
  scopeReferenceId: null,
  entity: null,
};

const MOCK_PERMISSIONS: string[] = [
  Permission.FacultiesList,
  Permission.RolesList,
  Permission.SystemConfigsList,
];

/** Returns mock login response for any email/password when mock auth is enabled. */
export function getMockLoginResponse(credentials: LoginRequest): LoginResponse {
  const token = createMockJwt(credentials.email);
  const profile: AuthProfile = {
    id: 1,
    userId: 1,
    tenantId: 1,
    firstName: "Mock",
    lastName: "User",
    phoneNumber: null,
    dateOfBirth: null,
    score: 0,
    metadata: null,
    email: credentials.email,
    profilePictureUrl: null,
  };
  return {
    token,
    refresh_token: `mock-refresh-${credentials.email}-${Date.now()}`,
    profile,
    roles: [MOCK_ROLE],
    permissions: MOCK_PERMISSIONS,
  };
}

export const USE_MOCK_AUTH =
  import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
  import.meta.env.VITE_USE_MOCK_AUTH === "1";
