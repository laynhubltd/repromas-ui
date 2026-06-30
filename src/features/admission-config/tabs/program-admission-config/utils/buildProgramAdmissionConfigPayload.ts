import type {
  CreateProgramAdmissionConfigRequest,
  ProgramAdmissionConfigFormValues,
} from "../types/program-admission-config";

export function buildProgramAdmissionConfigPayload(
  values: ProgramAdmissionConfigFormValues,
): CreateProgramAdmissionConfigRequest {
  const jambScore = values.minimumJambScore;
  return {
    programId: values.programId,
    totalCapacity: values.totalCapacity,
    meritPercentage: values.meritPercentage,
    catchmentPercentage: values.catchmentPercentage,
    eldsPercentage: values.eldsPercentage,
    meritCutoff: values.meritCutoff.toFixed(2),
    catchmentCutoff: values.catchmentCutoff.toFixed(2),
    eldsCutoff: values.eldsCutoff.toFixed(2),
    minimumJambScore:
      jambScore == null || !Number.isFinite(jambScore) ? null : jambScore,
    minimumOlevelCredits: values.minimumOlevelCredits,
    maxOlevelSittings: values.maxOlevelSittings,
    requireOlevelEnglish: values.requireOlevelEnglish,
    requireOlevelMathematics: values.requireOlevelMathematics,
    englishSubjectId: values.requireOlevelEnglish
      ? (values.englishSubjectId ?? null)
      : null,
    mathematicsSubjectId: values.requireOlevelMathematics
      ? (values.mathematicsSubjectId ?? null)
      : null,
  };
}
