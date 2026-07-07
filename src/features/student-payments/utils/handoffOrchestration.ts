import { FEE_EVENT_CODE } from "@/shared/constants/feeEventOptions";
import {
  HANDOFF_POLL_INTERVALS_MS,
  HANDOFF_POLL_MAX_ATTEMPTS,
} from "@/shared/constants/billingPaymentOptions";
import type { StudentPaymentTransaction } from "../types/student-payment";
import type { StoredCheckoutContext } from "./paymentSession";

export { HANDOFF_POLL_INTERVALS_MS, HANDOFF_POLL_MAX_ATTEMPTS };

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function resolveBackoffMs(attempt: number): number {
  const intervals = HANDOFF_POLL_INTERVALS_MS;
  return intervals[Math.min(attempt, intervals.length - 1)];
}

export function resolvePaymentEventCode(
  transaction: StudentPaymentTransaction | null | undefined,
  checkoutContext: StoredCheckoutContext | null,
): string | null {
  const posted = transaction?.payments?.[0];
  const fromFeeCharge =
    posted?.feeCharge?.eventCode ?? transaction?.feeCharge?.eventCode;
  if (fromFeeCharge) return fromFeeCharge;

  const fromInvoice = posted?.invoice?.eventCode ?? transaction?.invoice?.eventCode;
  if (fromInvoice) return fromInvoice;

  return checkoutContext?.eventCode ?? null;
}

export function isAdmissionRegistrationFeePayment(
  eventCode: string | null | undefined,
): boolean {
  return eventCode === FEE_EVENT_CODE.ADMISSION_REGISTRATION;
}

export function isPortalMatriculated(
  portalState: string | null | undefined,
): boolean {
  return portalState === "matriculated";
}
