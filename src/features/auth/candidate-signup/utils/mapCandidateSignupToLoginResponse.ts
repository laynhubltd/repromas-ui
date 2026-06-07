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
            scopeReferenceId: data.candidateId,
            entity: {
              id: data.candidateId,
              cycle_id: 0,
              jamb_reg_no: "",
              first_name: data.profile.firstName,
              last_name: data.profile.lastName,
              date_of_birth: null,
              gender: null,
              state_id: 0,
              lga_id: null,
              email: data.user.email,
              phone: null,
              entry_mode: "UTME",
              metadata: null,
              created_at: "",
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
  };

  return {
    token: data.token,
    refresh_token: data.refreshToken,
    profile,
    roles,
    permissions: data.permissions ?? [],
  };
}
