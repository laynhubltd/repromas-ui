import type {
  ApiRole,
  AuthProfile,
  AuthRoleScope,
  LoginResponse,
} from "@/features/auth/types";
import { AUTH_ROLE_SCOPES } from "@/features/auth/types/role-entity";
import type { CandidateSignupResponse } from "../types/candidate-signup";

function toAuthRoleScope(scope: string): AuthRoleScope {
  return (AUTH_ROLE_SCOPES as readonly string[]).includes(scope)
    ? (scope as AuthRoleScope)
    : "CANDIDATE";
}

function mapSignupRole(
  role: NonNullable<CandidateSignupResponse["roles"]>[number],
): ApiRole {
  const scopeRef = role.scopeReferenceId;
  return {
    name: role.name,
    scope: toAuthRoleScope(role.scope),
    scopeReferenceId:
      scopeRef === null || scopeRef === undefined ? null : Number(scopeRef),
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
            scopeReferenceId: data.candidateId,
            entity: {
              id: data.candidateId,
              cycleId: 0,
              jambRegNo: "",
              firstName: data.profile.firstName,
              lastName: data.profile.lastName,
              dateOfBirth: null,
              gender: null,
              stateId: 0,
              lgaId: null,
              email: data.user.email,
              phone: null,
              entryMode: "UTME",
              metadata: null,
              createdAt: "",
              application: null,
              state: null,
              lga: null,
              cycle: null,
            },
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
    profilePictureUrl: null,
  };

  return {
    token: data.token,
    refresh_token: data.refreshToken,
    profile,
    roles,
    permissions: data.permissions ?? [],
  };
}
