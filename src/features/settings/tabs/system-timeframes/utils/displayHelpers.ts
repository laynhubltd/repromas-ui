import type { EventType, SystemTimeFrame, UpdateSystemTimeFrameRequest } from "../types/system-timeframe";
import { getTimeframeEventTypeLabel } from "@/shared/constants/systemTimeframeOptions";

// Property 4: isLateWindow badge — "Late" with warning color when true, null when false
export function getLateWindowBadge(
  isLateWindow: boolean
): { label: string; color?: string } | null {
  return isLateWindow ? { label: "Late", color: "warning" } : null;
}

// Property 9: Toggle payload — isActive is boolean negation of original, all other fields preserved
export function buildTogglePayload(
  record: SystemTimeFrame
): UpdateSystemTimeFrameRequest {
  return {
    id: record.id,
    eventType: record.eventType,
    scope: record.scope,
    referenceId: record.referenceId,
    sessionId: record.sessionId,
    semesterId: record.semesterId,
    startAt: record.startAt,
    endAt: record.endAt,
    isLateWindow: record.isLateWindow,
    isActive: !record.isActive,
  };
}

// Property 10: Accordion header — output contains human-readable label and exact count
export function getAccordionHeaderLabel(eventType: EventType, count: number): string {
  return `${getTimeframeEventTypeLabel(eventType)} (${count})`;
}
