import type { LaneProfile } from "../types/scoring-strategy";

type CycleLaneInput = {
  entryMode: "UTME" | "DIRECT_ENTRY" | "TRANSFER";
  admissionIdentityMode?: "JAMB" | "OPEN";
};

/**
 * Maps admission cycle fields to scoring strategy lane profile.
 * TRANSFER cycles do not use auto-scoring strategies.
 */
export function resolveLaneProfileFromCycle(
  cycle: CycleLaneInput,
): LaneProfile | null {
  if (cycle.entryMode === "TRANSFER") {
    return null;
  }

  if (cycle.entryMode === "DIRECT_ENTRY") {
    return "DIRECT_ENTRY";
  }

  if (cycle.admissionIdentityMode === "OPEN") {
    return "UTME_OPEN";
  }

  return "UTME_JAMB";
}
