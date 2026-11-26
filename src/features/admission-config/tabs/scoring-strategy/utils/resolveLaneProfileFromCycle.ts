import type {
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "@/shared/types/admission-lane";
import type { LaneProfile } from "../types/scoring-strategy";

type LaneInput = {
  entryMode: AdmissionEntryMode;
  identityMode?: AdmissionIdentityMode;
};

/**
 * Maps an admission cycle lane to its scoring strategy lane profile.
 * TRANSFER lanes do not use auto-scoring strategies.
 */
export function resolveLaneProfileFromLane(lane: LaneInput): LaneProfile | null {
  if (lane.entryMode === "TRANSFER") {
    return null;
  }

  if (lane.entryMode === "DIRECT_ENTRY") {
    return "DIRECT_ENTRY";
  }

  return lane.identityMode === "OPEN" ? "UTME_OPEN" : "UTME_JAMB";
}

export const resolveLaneProfileFromCycle = resolveLaneProfileFromLane;
