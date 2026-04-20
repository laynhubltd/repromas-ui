/**
 * Mock auth for development – allows login and dashboard access without the real API.
 * Enable with VITE_USE_MOCK_AUTH=true in .env.
 */

import { Permission } from "@/features/access-control/permissions";
import type {
<<<<<<< Updated upstream
    ApiRole,
    LoginRequest,
    LoginResponse,
    SimpleUserProfile,
    UserProfile,
} from "./types";
=======
  LoginRequest,
  LoginResponse,
  SimpleUserProfile,
  UserProfile,
  UserRole,
} from "./types";
import { Privilege } from "@/features/access-control/privileges-enum";
>>>>>>> Stashed changes

const MOCK_JWT_EXP = 9999999999; // Far future so token is never “expired”

function base64UrlEncode(input: string): string {
  const base64 = typeof btoa !== "undefined"
    ? btoa(input)
    : Buffer.from(input, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build a JWT-like token that passes isTokenExpired (has valid exp). */
function createMockJwt(sub = "mock-user"): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({ sub, exp: MOCK_JWT_EXP, iat: Math.floor(Date.now() / 1000) }),
  );
  const signature = base64UrlEncode("mock-signature");
  return `${header}.${payload}.${signature}`;
}

const MOCK_ROLE: ApiRole = {
  name: "Admin",
  scope: "GLOBAL",
  scopeReferenceId: null,
};

const MOCK_PERMISSIONS: string[] = [
  Permission.FacultiesList,
  Permission.RolesList,
  Permission.SystemConfigsList,
];

const MOCK_PROFILE: SimpleUserProfile = {
  profileId: "mock-profile-1",
  role: { name: "Admin", description: "Mock admin for development" },
  company: { id: "mock-company-1", name: "Repromas Demo", type: "school" },
};

/** Returns mock login response for any email/password when mock auth is enabled. */
export function getMockLoginResponse(credentials: LoginRequest): LoginResponse {
  const token = createMockJwt(credentials.email);
  const user: UserProfile = {
    id: "mock-user-id",
    email: credentials.email,
    firstName: "Mock",
    lastName: "User",
    role: MOCK_ROLE,
    company: { id: "mock-company-1", name: "Repromas Demo", type: "school" },
  };
  return {
    token,
    refresh_token: `mock-refresh-${credentials.email}-${Date.now()}`,
    roles: [MOCK_ROLE],
    permissions: MOCK_PERMISSIONS,
    user,
    profiles: [MOCK_PROFILE],
  };
}

export const USE_MOCK_AUTH =
  import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
  import.meta.env.VITE_USE_MOCK_AUTH === "1";
