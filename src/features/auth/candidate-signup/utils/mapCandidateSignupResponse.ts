import type { CandidateSignupResponse } from "../types/candidate-signup";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

function readNumber(raw: RawRecord, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readUser(raw: RawRecord): CandidateSignupResponse["user"] {
  const user = raw.user;
  if (!user || typeof user !== "object") {
    return { id: 0, email: "" };
  }
  const u = user as RawRecord;
  return {
    id: readNumber(u, "id", "id"),
    email: readString(u, "email", "email"),
  };
}

function readProfile(raw: RawRecord): CandidateSignupResponse["profile"] {
  const profile = raw.profile;
  if (!profile || typeof profile !== "object") {
    return { id: 0, firstName: "", lastName: "" };
  }
  const p = profile as RawRecord;
  return {
    id: readNumber(p, "id", "id"),
    firstName: readString(p, "first_name", "firstName"),
    lastName: readString(p, "last_name", "lastName"),
  };
}

export function mapCandidateSignupResponse(raw: unknown): CandidateSignupResponse {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  const rolesRaw = data.roles;
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const r = item as RawRecord;
          const scope = readString(r, "scope", "scope");
          const name = readString(r, "name", "name");
          if (!scope) return null;
          const scopeRef = r.scope_reference_id ?? r.scopeReferenceId;
          return {
            name: name || "Candidate",
            scope,
            scopeReferenceId:
              scopeRef === null || scopeRef === undefined
                ? null
                : String(scopeRef),
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
    : undefined;

  const permissionsRaw = data.permissions;
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.filter((p): p is string => typeof p === "string")
    : undefined;

  return {
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    user: readUser(data),
    profile: readProfile(data),
    token: readString(data, "token", "token"),
    refreshToken: readString(data, "refresh_token", "refreshToken"),
    roles,
    permissions,
  };
}
