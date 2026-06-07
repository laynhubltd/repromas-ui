import type {
  ArrearsMode,
  MissingFeeChargePolicy,
  OccurrenceMode,
  PaginatedResponse,
  PaymentTiming,
  PeriodType,
} from "@/features/billing/tabs/fee-events/types/billable-event";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";

export type { PaginatedResponse };

export type BillableEventPolicy = {
  id: number;
  code: string;
  eventId: number | null;
  versionNo: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired: boolean;
  missingFeeChargePolicy: MissingFeeChargePolicy;
  fulfilledStatuses: string[];
  occurrenceMode: OccurrenceMode;
  periodType: PeriodType;
  arrearsMode: ArrearsMode;
  createdAt: string;
};

export type BillableEventPolicyWritableFields = {
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired: boolean;
  missingFeeChargePolicy: MissingFeeChargePolicy;
  fulfilledStatuses: string[];
  occurrenceMode: OccurrenceMode;
  periodType: PeriodType;
  arrearsMode: ArrearsMode;
};

export type PublishBillableEventPolicyRequest = BillableEventPolicyWritableFields & {
  bindEventId: number;
};

export type ReviseBillableEventPolicyRequest = BillableEventPolicyWritableFields;

export type BillableEventPolicyListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[eventId]"?: number;
  "exact[code]"?: string;
  "exact[paymentTiming]"?: PaymentTiming;
  "exact[occurrenceMode]"?: OccurrenceMode;
  "exact[isActive]"?: boolean;
};

export type BillableEventPolicySeedSkipped = {
  code: string;
  reason: string;
};

export type BillableEventPolicySeedCreatedEvent = Pick<
  BillableEvent,
  "id" | "code" | "name" | "isActive"
> & {
  currentPolicy: BillableEvent["currentPolicy"];
};

export type BillableEventPolicySeedCreatedPolicy = Pick<
  BillableEventPolicy,
  | "id"
  | "code"
  | "eventId"
  | "versionNo"
  | "isActive"
  | "occurrenceMode"
  | "periodType"
>;

export type BillableEventPolicySeedResult = {
  implementedOnly: boolean;
  skipExisting: boolean;
  createdCount: number;
  skippedCount: number;
  createdEvents: BillableEventPolicySeedCreatedEvent[];
  createdPolicies: BillableEventPolicySeedCreatedPolicy[];
  skipped: BillableEventPolicySeedSkipped[];
};

export type BillableEventPolicySeedRequest = {
  implementedOnly?: boolean;
  skipExisting?: boolean;
};
