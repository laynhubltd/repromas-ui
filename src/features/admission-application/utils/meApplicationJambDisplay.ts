import type { MeAdmissionJambScore } from "../types/me-admission-application";

export function resolveJambSubjectName(score: MeAdmissionJambScore): string {
  return (
    score.subject?.name ??
    (score.subjectId != null ? `Subject #${score.subjectId}` : "—")
  );
}

export function sortJambScores(
  scores: MeAdmissionJambScore[],
): MeAdmissionJambScore[] {
  return [...scores].sort((a, b) =>
    resolveJambSubjectName(a).localeCompare(resolveJambSubjectName(b)),
  );
}

export function getCandidateJambScores(
  jambScores: MeAdmissionJambScore[] | undefined,
): MeAdmissionJambScore[] {
  return jambScores ?? [];
}
