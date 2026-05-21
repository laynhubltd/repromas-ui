import type {
  ComputedQuotaSeats,
  ProgramAdmissionConfig,
} from "../types/program-admission-config";

export function computeQuotaSeats(
  config: Pick<
    ProgramAdmissionConfig,
    | "totalCapacity"
    | "meritPercentage"
    | "catchmentPercentage"
    | "eldsPercentage"
    | "meritSeatsUsed"
    | "catchmentSeatsUsed"
    | "eldsSeatsUsed"
  >,
): ComputedQuotaSeats {
  const meritAllocated = Math.floor(
    (config.totalCapacity * config.meritPercentage) / 100,
  );
  const catchmentAllocated = Math.floor(
    (config.totalCapacity * config.catchmentPercentage) / 100,
  );
  const eldsAllocated = Math.floor(
    (config.totalCapacity * config.eldsPercentage) / 100,
  );

  return {
    meritAllocated,
    catchmentAllocated,
    eldsAllocated,
    meritAvailable: Math.max(0, meritAllocated - config.meritSeatsUsed),
    catchmentAvailable: Math.max(
      0,
      catchmentAllocated - config.catchmentSeatsUsed,
    ),
    eldsAvailable: Math.max(0, eldsAllocated - config.eldsSeatsUsed),
  };
}
