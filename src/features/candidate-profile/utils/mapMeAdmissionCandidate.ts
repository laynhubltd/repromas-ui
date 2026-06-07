import type {
  MeAdmissionCandidate,
  MeAdmissionCycleEmbed,
} from "../types/me-admission-candidate";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
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

function mapRef(
  raw: unknown,
): { id: number; name: string; code?: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    id: readNumber(data, "id", "id"),
    name: readString(data, "name", "name"),
    ...(typeof data.code === "string" ? { code: data.code } : {}),
  };
}

function mapCycleEmbed(raw: unknown): MeAdmissionCycleEmbed | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const entryMode = readNullableString(data, "entry_mode", "entryMode");
  const batchNo = readOptionalNumber(data, "batch_no", "batchNo");
  const identityMode = readNullableString(
    data,
    "admission_identity_mode",
    "admissionIdentityMode",
  );

  return {
    id: readNumber(data, "id", "id"),
    sessionId: readNumber(data, "session_id", "sessionId"),
    name: readString(data, "name", "name"),
    status: readString(data, "status", "status"),
    ...(identityMode === "JAMB" || identityMode === "OPEN"
      ? { admissionIdentityMode: identityMode }
      : {}),
    ...(entryMode ? { entryMode: entryMode as MeAdmissionCycleEmbed["entryMode"] } : {}),
    ...(batchNo !== undefined ? { batchNo } : {}),
    startDate: readNullableString(data, "start_date", "startDate"),
    endDate: readNullableString(data, "end_date", "endDate"),
  };
}

function mapApplication(raw: unknown): MeAdmissionCandidate["application"] {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const applied = data.applied_program ?? data.appliedProgram;
  const offered = data.offered_program ?? data.offeredProgram;

  return {
    id: readNumber(data, "id", "id"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    appliedProgramId: readNumber(
      data,
      "applied_program_id",
      "appliedProgramId",
    ),
    offeredProgramId: (() => {
      const value = data.offered_program_id ?? data.offeredProgramId;
      return typeof value === "number" ? value : null;
    })(),
    applicationStatus: readString(
      data,
      "application_status",
      "applicationStatus",
    ),
    finalDecision: readString(data, "final_decision", "finalDecision"),
    isMatriculated: Boolean(data.is_matriculated ?? data.isMatriculated),
    updatedAt: readString(data, "updated_at", "updatedAt"),
    ...(applied && typeof applied === "object"
      ? {
          appliedProgram: {
            id: readNumber(applied as RawRecord, "id", "id"),
            name: readString(applied as RawRecord, "name", "name"),
          },
        }
      : {}),
    ...(offered && typeof offered === "object"
      ? {
          offeredProgram: {
            id: readNumber(offered as RawRecord, "id", "id"),
            name: readString(offered as RawRecord, "name", "name"),
          },
        }
      : {}),
  };
}

export function mapMeAdmissionCandidate(raw: unknown): MeAdmissionCandidate {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  return {
    id: readNumber(data, "id", "id"),
    cycleId: readNumber(data, "cycle_id", "cycleId"),
    jambRegNo: readNullableString(data, "jamb_reg_no", "jambRegNo"),
    firstName: readString(data, "first_name", "firstName"),
    lastName: readString(data, "last_name", "lastName"),
    dateOfBirth: readNullableString(data, "date_of_birth", "dateOfBirth"),
    gender: readNullableString(data, "gender", "gender") as MeAdmissionCandidate["gender"],
    stateId: readNumber(data, "state_id", "stateId"),
    lgaId:
      data.lga_id === null || data.lgaId === null
        ? null
        : readOptionalNumber(data, "lga_id", "lgaId") ?? null,
    email: readNullableString(data, "email", "email"),
    phone: readNullableString(data, "phone", "phone"),
    metadata:
      data.metadata && typeof data.metadata === "object"
        ? (data.metadata as Record<string, unknown>)
        : null,
    application: mapApplication(data.application),
    state: mapRef(data.state),
    lga: mapRef(data.lga),
    cycle: mapCycleEmbed(data.cycle),
  };
}
