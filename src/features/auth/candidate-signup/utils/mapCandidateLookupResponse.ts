import type { CandidateLookupResponse } from "../types/candidate-signup";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

export function mapCandidateLookupResponse(raw: unknown): CandidateLookupResponse {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  return {
    firstName: readString(data, "first_name", "firstName"),
    lastName: readString(data, "last_name", "lastName"),
    gender: readString(data, "gender", "gender"),
    state: readString(data, "state", "state"),
    lga: readString(data, "lga", "lga"),
    appliedProgram: readString(data, "applied_program", "appliedProgram"),
    verificationToken: readString(data, "verification_token", "verificationToken"),
  };
}
