import type { AdmissionSignupConfig } from "../types/candidate-signup";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

function readNumber(raw: RawRecord, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readNullableString(raw: RawRecord, snake: string, camel: string): string | null {
  const value = raw[snake] ?? raw[camel];
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : null;
}

export function mapAdmissionSignupConfig(raw: unknown): AdmissionSignupConfig {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  return {
    cycleId: readNumber(data, "cycle_id", "cycleId"),
    name: readString(data, "name", "name"),
    status: readString(data, "status", "status"),
    admissionIdentityMode: readString(
      data,
      "admission_identity_mode",
      "admissionIdentityMode",
    ) as AdmissionSignupConfig["admissionIdentityMode"],
    startDate: readNullableString(data, "start_date", "startDate"),
    endDate: readNullableString(data, "end_date", "endDate"),
  };
}
