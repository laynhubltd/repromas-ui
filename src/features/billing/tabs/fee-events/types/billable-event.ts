export type PaymentTiming = "PAY_BEFORE" | "PAY_AFTER";

export type MissingFeeChargePolicy = "BLOCK" | "ALLOW";

export type OccurrenceMode =
  | "ONCE_PER_RESOURCE"
  | "ONCE_PER_STUDENT_LIFECYCLE"
  | "PER_SESSION"
  | "PER_SEMESTER";

export type PeriodType = "NONE" | "SESSION" | "SEMESTER";

export type ArrearsMode = "STRICT" | "CURRENT_PERIOD_ONLY";

export type CatalogOption = {
  value: string;
  label: string;
};

/** Active policy snapshot when using ?include=currentPolicy on event list/detail. */
export type BillableEventPolicyEmbed = {
  id: number;
  versionNo: number;
  isActive: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired?: boolean;
  missingFeeChargePolicy?: MissingFeeChargePolicy;
  fulfilledStatuses?: string[];
  occurrenceMode: OccurrenceMode;
  periodType: PeriodType;
  arrearsMode: ArrearsMode;
};

export type BillableEvent = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  currentPolicy: BillableEventPolicyEmbed | null;
  createdAt: string;
  updatedAt: string;
};

export type BillableEventCatalogDefaults = {
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  fulfilledStatuses: string[];
  occurrenceMode: OccurrenceMode;
  periodType: PeriodType;
  arrearsMode: ArrearsMode;
};

export type BillableEventCatalogEntry = {
  code: string;
  defaultName: string;
  resourceType: string;
  isImplemented: boolean;
  allowedTriggers: CatalogOption[];
  allowedGuardSteps: CatalogOption[];
  allowedPaymentTimings: CatalogOption[];
  allowedFulfilledStatuses: CatalogOption[];
  defaultOccurrenceMode: OccurrenceMode;
  defaultPeriodType: PeriodType;
  defaultArrearsMode: ArrearsMode;
  allowedOccurrenceModes: CatalogOption[];
  allowedPeriodTypes: CatalogOption[];
  allowedArrearsModes: CatalogOption[];
  defaultsByPaymentTiming: Partial<
    Record<PaymentTiming, BillableEventCatalogDefaults>
  >;
};

export type BillableEventSeedSkipped = {
  code: string;
  reason: string;
};

export type BillableEventSeedResult = {
  implementedOnly: boolean;
  skipExisting: boolean;
  createdCount: number;
  skippedCount: number;
  created: BillableEvent[];
  skipped: BillableEventSeedSkipped[];
};

/** Shell-only create — initial policy published via billable-event-policies API. */
export type CreateBillableEventRequest = {
  code: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateBillableEventRequest = {
  name: string;
  description: string | null;
  isActive: boolean;
};

export type BillableEventListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: "currentPolicy";
  "search[name]"?: string;
  "exact[code]"?: string;
  "exact[isActive]"?: boolean;
};

export type BillableEventCatalogListParams = {
  implementedOnly?: boolean;
};

export type BillableEventCatalogEntryParams = {
  code: string;
  paymentTiming?: PaymentTiming;
};

export type BillableEventSeedRequest = {
  implementedOnly?: boolean;
  skipExisting?: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: {
    first: string;
    last: string;
    next?: string | null;
  };
};

export type FeeEventPolicyStatusFilter = "all" | "hasPolicy" | "noPolicy";
