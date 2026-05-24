import type { ApiRole, AuthProfile, LoginResponse } from "@/features/auth/types";
import type { CandidateSignupResponse } from "../types/candidate-signup";

function mapSignupRole(
  role: NonNullable<CandidateSignupResponse["roles"]>[number],
): ApiRole {
  const scopeRef = role.scopeReferenceId;
  return {
    name: role.name,
    scope: role.scope,
    scopeReferenceId:
      scopeRef === null || scopeRef === undefined
        ? null
        : Number(scopeRef),
    entity: null,
  };
}

export function mapCandidateSignupToLoginResponse(
  data: CandidateSignupResponse,
): LoginResponse {
  const roles: ApiRole[] =
    data.roles && data.roles.length > 0
      ? data.roles.map(mapSignupRole)
      : [
          {
            name: "Candidate",
            scope: "CANDIDATE",
            scopeReferenceId: null,
            entity: null,
          },
        ];

  const profile: AuthProfile = {
    id: data.profile.id,
    userId: data.user.id,
    tenantId: 0,
    firstName: data.profile.firstName || null,
    lastName: data.profile.lastName || null,
    phoneNumber: null,
    dateOfBirth: null,
    score: 0,
    metadata: null,
    email: data.user.email,
  };

  return {
    token: data.token,
    refresh_token: data.refreshToken,
    profile,
    roles,
    permissions: data.permissions ?? [],
  };
}
