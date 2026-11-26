import type {
  AdmissionEntryMode,
  AdmissionIdentityMode,
  AdmissionSignupConfig,
  SignupConfigLane,
} from "../types/candidate-signup";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

function readNumber(raw: RawRecord, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readOptionalNumber(
  raw: RawRecord,
  snake: string,
  camel: string,
): number | undefined {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : undefined;
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

function mapSignupLanes(raw: RawRecord): SignupConfigLane[] {
  const rawList = raw.entry_modes ?? raw.entryModes;
  if (!Array.isArray(rawList)) return [];

  const lanes: SignupConfigLane[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== "object") continue;
    const rec = item as RawRecord;
    const entryMode = readString(rec, "entry_mode", "entryMode");
    const identityMode = readString(rec, "identity_mode", "identityMode");
    if (!entryMode || !identityMode) continue;
    lanes.push({
      entryMode: entryMode as AdmissionEntryMode,
      identityMode: identityMode as AdmissionIdentityMode,
    });
  }
  return lanes;
}

export function mapAdmissionSignupConfig(raw: unknown): AdmissionSignupConfig {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  const sessionId = readOptionalNumber(data, "session_id", "sessionId");

  return {
    cycleId: readNumber(data, "cycle_id", "cycleId"),
    name: readString(data, "name", "name"),
    status: readString(data, "status", "status"),
    entryModes: mapSignupLanes(data),
    batchNo: readNumber(data, "batch_no", "batchNo") || 1,
    ...(sessionId !== undefined ? { sessionId } : {}),
    startDate: readNullableString(data, "start_date", "startDate"),
    endDate: readNullableString(data, "end_date", "endDate"),
  };
}
