import { ACKNOWLEDGEMENT_REFERENCE_PREFIX } from "../constants/acknowledgementSlipOptions";

export function buildAcknowledgementReference({
  cycleId,
  applicationId,
  acknowledgementNumber,
}: {
  cycleId: number;
  applicationId: number;
  acknowledgementNumber?: string | null;
}): string {
  if (acknowledgementNumber?.trim()) {
    return acknowledgementNumber.trim();
  }
  return `${ACKNOWLEDGEMENT_REFERENCE_PREFIX}-${cycleId}-${applicationId}`;
}
