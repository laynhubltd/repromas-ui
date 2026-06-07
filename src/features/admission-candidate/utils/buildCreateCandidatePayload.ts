import type { Dayjs } from "dayjs";
import type {
  CandidateIntakeMode,
  CreateAdmissionCandidateRequest,
  JambScoreInput,
} from "../types/admission-candidate";

export type JambScoreFormRow = {
  subjectId?: number;
  score?: number;
};

export type CreateCandidateFormValues = {
  cycleId: number;
  intakeMode?: CandidateIntakeMode;
  jambRegNo?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Dayjs | null;
  gender?: string;
  stateId: number;
  lgaId?: number;
  appliedProgramId: number;
  email?: string;
  phone?: string;
  metadataJson?: string;
  jambScores?: JambScoreFormRow[];
};

export function normalizeJambScoreRows(
  rows: JambScoreFormRow[] | undefined,
): JambScoreFormRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is JambScoreFormRow => row != null);
}

/** Returns a user-facing message when a row is partially filled. */
export function validateJambScorePairing(
  rows: JambScoreFormRow[] | undefined,
): string | null {
  for (const row of normalizeJambScoreRows(rows)) {
    const hasSubject = row.subjectId != null && row.subjectId > 0;
    const hasScore = row.score != null && !Number.isNaN(row.score);

    if (!hasSubject && !hasScore) continue;

    if (hasScore && !hasSubject) {
      return "Each score needs a subject selected.";
    }
    if (hasSubject && !hasScore) {
      return "Each selected subject needs a score (0–100).";
    }
    if (row.score! < 0 || row.score! > 100) {
      return "Scores must be between 0 and 100.";
    }
  }
  return null;
}

export function dedupeJambScoreRows(
  rows: JambScoreFormRow[] | undefined,
): JambScoreInput[] {
  const seen = new Set<number>();
  const result: JambScoreInput[] = [];

  for (const row of normalizeJambScoreRows(rows)) {
    if (row.subjectId == null || row.score == null) continue;
    if (seen.has(row.subjectId)) continue;
    seen.add(row.subjectId);
    result.push({ subjectId: row.subjectId, score: row.score });
  }

  return result;
}

export function buildCreateCandidatePayload(
  values: CreateCandidateFormValues,
  intakeMode: CandidateIntakeMode,
): CreateAdmissionCandidateRequest {
  let metadata: Record<string, unknown> | null = null;
  if (values.metadataJson?.trim()) {
    metadata = JSON.parse(values.metadataJson) as Record<string, unknown>;
  }

  const dateOfBirth = values.dateOfBirth
    ? values.dateOfBirth.format("YYYY-MM-DD")
    : null;

  const base: CreateAdmissionCandidateRequest = {
    cycleId: values.cycleId,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    stateId: values.stateId,
    appliedProgramId: values.appliedProgramId,
    dateOfBirth,
    gender: values.gender ?? null,
    lgaId: values.lgaId ?? null,
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    metadata,
  };

  if (intakeMode === "manual") {
    return base;
  }

  const jambRegNo = values.jambRegNo?.trim() || null;
  const jambScores = dedupeJambScoreRows(values.jambScores);

  return {
    ...base,
    jambRegNo,
    ...(jambScores.length > 0 ? { jambScores } : {}),
  };
}
