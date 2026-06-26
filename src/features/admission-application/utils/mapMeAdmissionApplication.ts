import type {
  MeAdmissionApplication,
  MeAdmissionApplicationCandidate,
  MeAdmissionCycleEmbed,
  MeAdmissionJambScore,
  MeAdmissionOlevelGrade,
  MeAdmissionOlevelSitting,
  MeAdmissionProgramSummary,
  MeAdmissionRef,
  MeAdmissionScreening,
  MeAdmissionSubjectRef,
} from "../types/me-admission-application";

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

function readBoolean(raw: RawRecord, snake: string, camel: string): boolean {
  const value = raw[snake] ?? raw[camel];
  return Boolean(value);
}

function readMetadata(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

function mapRef(raw: unknown): MeAdmissionRef | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    id: readNumber(data, "id", "id"),
    name: readString(data, "name", "name"),
    ...(typeof data.code === "string" ? { code: data.code } : {}),
    ...(typeof data.countryCode === "string"
      ? { countryCode: data.countryCode }
      : {}),
    ...(readOptionalNumber(data, "state_id", "stateId") !== undefined
      ? { stateId: readNumber(data, "state_id", "stateId") }
      : {}),
  };
}

function mapSubjectRef(raw: unknown): MeAdmissionSubjectRef | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    id: readNumber(data, "id", "id"),
    name: readString(data, "name", "name"),
    ...(typeof data.code === "string" ? { code: data.code } : {}),
    createdAt: readNullableString(data, "created_at", "createdAt") ?? undefined,
  };
}

function mapCycleEmbed(raw: unknown): MeAdmissionCycleEmbed | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    id: readNumber(data, "id", "id"),
    sessionId: readNumber(data, "session_id", "sessionId"),
    name: readString(data, "name", "name"),
    status: readString(data, "status", "status"),
    startDate: readNullableString(data, "start_date", "startDate"),
    endDate: readNullableString(data, "end_date", "endDate"),
    createdAt: readNullableString(data, "created_at", "createdAt") ?? undefined,
  };
}

function mapJambScore(raw: unknown): MeAdmissionJambScore | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const subject = data.subject;
  return {
    id: readNumber(data, "id", "id"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    subjectId: readNumber(data, "subject_id", "subjectId"),
    score: readNumber(data, "score", "score"),
    createdAt: readString(data, "created_at", "createdAt"),
    subject: mapSubjectRef(subject),
  };
}

function mapOlevelGrade(raw: unknown): MeAdmissionOlevelGrade | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    id: readNumber(data, "id", "id"),
    subjectId: readNumber(data, "subject_id", "subjectId"),
    grade: readString(data, "grade", "grade"),
    subject: mapSubjectRef(data.subject),
  };
}

function mapOlevelSitting(raw: unknown): MeAdmissionOlevelSitting | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const gradesRaw = data.grades;
  const grades = Array.isArray(gradesRaw)
    ? gradesRaw
        .map(mapOlevelGrade)
        .filter((g): g is MeAdmissionOlevelGrade => g !== null)
    : [];

  return {
    id: readNumber(data, "id", "id"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    examType: readString(data, "exam_type", "examType"),
    examYear: readNumber(data, "exam_year", "examYear"),
    examRegNo: readNullableString(data, "exam_reg_no", "examRegNo"),
    centerNumber: readNullableString(data, "center_number", "centerNumber"),
    schoolName: readNullableString(data, "school_name", "schoolName"),
    metadata: readMetadata(data.metadata),
    createdAt: readString(data, "created_at", "createdAt"),
    grades,
  };
}

function mapCandidate(raw: unknown): MeAdmissionApplicationCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;

  const jambScoresRaw =
    data.jamb_scores ?? data.jambScores ?? data.jambScore ?? [];
  const jambScores = Array.isArray(jambScoresRaw)
    ? jambScoresRaw
        .map(mapJambScore)
        .filter((s): s is MeAdmissionJambScore => s !== null)
    : [];

  const olevelRaw =
    data.olevel_sittings ?? data.olevelSittings ?? data.olevelSitting ?? [];
  const olevelSittings = Array.isArray(olevelRaw)
    ? olevelRaw
        .map(mapOlevelSitting)
        .filter((s): s is MeAdmissionOlevelSitting => s !== null)
    : [];

  const lgaIdValue = data.lga_id ?? data.lgaId;

  return {
    id: readNumber(data, "id", "id"),
    cycleId: readNumber(data, "cycle_id", "cycleId"),
    jambRegNo: readNullableString(data, "jamb_reg_no", "jambRegNo"),
    firstName: readString(data, "first_name", "firstName"),
    lastName: readString(data, "last_name", "lastName"),
    dateOfBirth: readNullableString(data, "date_of_birth", "dateOfBirth"),
    gender: readNullableString(
      data,
      "gender",
      "gender",
    ) as MeAdmissionApplicationCandidate["gender"],
    stateId: readNumber(data, "state_id", "stateId"),
    lgaId:
      lgaIdValue === null || lgaIdValue === undefined
        ? null
        : readOptionalNumber(data, "lga_id", "lgaId") ?? null,
    email: readNullableString(data, "email", "email"),
    phone: readNullableString(data, "phone", "phone"),
    entryMode: readNullableString(data, "entry_mode", "entryMode"),
    metadata: readMetadata(data.metadata),
    createdAt: readString(data, "created_at", "createdAt"),
    state: mapRef(data.state),
    lga: mapRef(data.lga),
    cycle: mapCycleEmbed(data.cycle),
    jambScores,
    olevelSittings,
  };
}

function mapProgram(raw: unknown): MeAdmissionProgramSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const duration = readOptionalNumber(data, "duration_in_years", "durationInYears");
  const maxResidency = readOptionalNumber(
    data,
    "max_residency_years",
    "maxResidencyYears",
  );

  return {
    id: readNumber(data, "id", "id"),
    departmentId: readOptionalNumber(data, "department_id", "departmentId"),
    name: readString(data, "name", "name"),
    degreeTitle: readNullableString(data, "degree_title", "degreeTitle") ?? undefined,
    ...(duration !== undefined ? { durationInYears: duration } : {}),
    ...(maxResidency !== undefined ? { maxResidencyYears: maxResidency } : {}),
    createdAt: readNullableString(data, "created_at", "createdAt") ?? undefined,
    updatedAt: readNullableString(data, "updated_at", "updatedAt") ?? undefined,
    department: mapRef(data.department),
  };
}

function mapScreening(raw: unknown): MeAdmissionScreening | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const scoreDetailsRaw = data.score_details ?? data.scoreDetails;
  const scoreDetails =
    scoreDetailsRaw && typeof scoreDetailsRaw === "object"
      ? (scoreDetailsRaw as Record<string, unknown>)
      : {};

  const jambScore = data.jamb_score ?? data.jambScore;
  const schoolRaw = data.school_raw_score ?? data.schoolRawScore;
  const aggregate = data.aggregate_score ?? data.aggregateScore;

  return {
    id: readNumber(data, "id", "id"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    jambScore:
      jambScore === null || jambScore === undefined
        ? null
        : String(jambScore),
    schoolRawScore:
      schoolRaw === null || schoolRaw === undefined ? null : String(schoolRaw),
    aggregateScore:
      aggregate === null || aggregate === undefined ? null : String(aggregate),
    scoreDetails,
    createdAt: readString(data, "created_at", "createdAt"),
  };
}

export function mapMeAdmissionApplication(raw: unknown): MeAdmissionApplication {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  const offeredProgramIdRaw = data.offered_program_id ?? data.offeredProgramId;

  const candidate = data.candidate ? mapCandidate(data.candidate) : null;
  const appliedProgram = mapProgram(data.applied_program ?? data.appliedProgram);
  const offeredProgram = mapProgram(data.offered_program ?? data.offeredProgram);
  const screening = mapScreening(data.screening);

  return {
    id: readNumber(data, "id", "id"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    appliedProgramId: readNumber(data, "applied_program_id", "appliedProgramId"),
    offeredProgramId:
      typeof offeredProgramIdRaw === "number" ? offeredProgramIdRaw : null,
    applicationStatus: readString(
      data,
      "application_status",
      "applicationStatus",
    ),
    finalDecision: readString(data, "final_decision", "finalDecision"),
    isMatriculated: readBoolean(data, "is_matriculated", "isMatriculated"),
    updatedAt: readString(data, "updated_at", "updatedAt"),
    submittedAt: readNullableString(data, "submitted_at", "submittedAt"),
    acknowledgementNumber: readNullableString(
      data,
      "acknowledgement_number",
      "acknowledgementNumber",
    ),
    ...(candidate ? { candidate } : {}),
    ...(appliedProgram ? { appliedProgram } : {}),
    ...(offeredProgram ? { offeredProgram } : {}),
    ...(screening ? { screening } : {}),
  };
}
