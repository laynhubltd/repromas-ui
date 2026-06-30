import type { ProgramAdmissionConfig } from "../types/program-admission-config";

export function formatGateSummaryTags(config: ProgramAdmissionConfig): string[] {
  const tags: string[] = [
    `${config.minimumOlevelCredits} credits`,
    `${config.maxOlevelSittings} sittings`,
  ];
  if (config.requireOlevelEnglish) tags.push("English");
  if (config.requireOlevelMathematics) tags.push("Math");
  return tags;
}

export function formatJambFloor(config: ProgramAdmissionConfig): string {
  if (config.minimumJambScore == null) return "Not set";
  return `≥ ${config.minimumJambScore}`;
}

export function formatGatePlainSummary(
  config: ProgramAdmissionConfig,
  subjectNames?: {
    english?: string | null;
    mathematics?: string | null;
  },
): string {
  const parts = [
    `${config.minimumOlevelCredits} O-Level credits`,
    `max ${config.maxOlevelSittings} sitting${config.maxOlevelSittings === 1 ? "" : "s"}`,
  ];
  if (config.requireOlevelEnglish) {
    const englishLabel = subjectNames?.english ?? `#${config.englishSubjectId ?? "?"}`;
    parts.push(`English required (${englishLabel})`);
  }
  if (config.requireOlevelMathematics) {
    const mathLabel =
      subjectNames?.mathematics ?? `#${config.mathematicsSubjectId ?? "?"}`;
    parts.push(`Mathematics required (${mathLabel})`);
  }
  return parts.join(" · ");
}

export function formatQuotaSummary(config: ProgramAdmissionConfig): string {
  return `Merit ${config.meritPercentage}% · Catchment ${config.catchmentPercentage}% · ELDS ${config.eldsPercentage}%`;
}

export function formatCutoffSummary(config: ProgramAdmissionConfig): string {
  return `Merit ${config.meritCutoff} · Catchment ${config.catchmentCutoff} · ELDS ${config.eldsCutoff}`;
}

export function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
