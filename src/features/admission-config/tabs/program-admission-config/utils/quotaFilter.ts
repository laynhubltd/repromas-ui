import type {
  ProgramAdmissionConfig,
  QuotaFilterValue,
} from "../types/program-admission-config";
import { computeQuotaSeats } from "./seatMath";

export function matchesQuotaFilter(
  config: ProgramAdmissionConfig,
  quotaFilter: QuotaFilterValue | undefined,
): boolean {
  if (!quotaFilter) return true;
  const seats = computeQuotaSeats(config);

  if (quotaFilter === "ANY_FULL") {
    return (
      seats.meritAvailable === 0 ||
      seats.catchmentAvailable === 0 ||
      seats.eldsAvailable === 0
    );
  }

  if (quotaFilter === "ALL_OPEN") {
    return (
      seats.meritAvailable > 0 &&
      seats.catchmentAvailable > 0 &&
      seats.eldsAvailable > 0
    );
  }

  return (
    Number(config.meritCutoff) === 0 ||
    Number(config.catchmentCutoff) === 0 ||
    Number(config.eldsCutoff) === 0
  );
}
