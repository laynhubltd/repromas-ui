import type {
    AdmissionCandidate,
    AdmissionCandidateJambScore,
} from "../tabs/candidate/types/admission-candidate";

/** JAMB scores are nested under application.candidate per API include paths. */
export function getCandidateJambScores(
  candidate: AdmissionCandidate | null | undefined,
): AdmissionCandidateJambScore[] {
  if (!candidate) return [];
  return candidate.application?.candidate?.jambScores ?? [];
}

export function resolveJambSubjectName(
  score: AdmissionCandidateJambScore,
): string {
  return (
    score.subject?.name ??
    score.olevelSubject?.name ??
    (score.subjectId != null ? `Subject #${score.subjectId}` : "—")
  );
}

export function sortJambScores(
  scores: AdmissionCandidateJambScore[],
): AdmissionCandidateJambScore[] {
  return [...scores].sort((a, b) =>
    resolveJambSubjectName(a).localeCompare(resolveJambSubjectName(b)),
  );
}
