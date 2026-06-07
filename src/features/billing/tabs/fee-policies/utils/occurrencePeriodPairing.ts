import type {
  OccurrenceMode,
  PeriodType,
} from "@/features/billing/tabs/fee-events/types/billable-event";

const OCCURRENCE_PERIOD_PAIRING: Record<OccurrenceMode, PeriodType> = {
  ONCE_PER_RESOURCE: "NONE",
  ONCE_PER_STUDENT_LIFECYCLE: "NONE",
  PER_SESSION: "SESSION",
  PER_SEMESTER: "SEMESTER",
};

export function periodTypeForOccurrenceMode(
  occurrenceMode: OccurrenceMode,
): PeriodType {
  return OCCURRENCE_PERIOD_PAIRING[occurrenceMode];
}

export function isValidOccurrencePeriodPair(
  occurrenceMode: OccurrenceMode,
  periodType: PeriodType,
): boolean {
  return periodTypeForOccurrenceMode(occurrenceMode) === periodType;
}

export function isPeriodTypeAllowedForOccurrence(
  occurrenceMode: OccurrenceMode,
  periodType: PeriodType,
): boolean {
  return periodTypeForOccurrenceMode(occurrenceMode) === periodType;
}
