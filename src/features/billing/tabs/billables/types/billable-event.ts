export type PaymentTiming = "PAY_BEFORE" | "PAY_AFTER";

export type MissingFeeChargePolicy = "BLOCK" | "ALLOW";

export type CatalogOption = {
  value: string;
  label: string;
};

export type BillableEvent = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired: boolean;
  missingFeeChargePolicy: MissingFeeChargePolicy;
  fulfilledStatuses: string[];
  createdAt: string;
  updatedAt: string;
};

export type BillableEventCatalogDefaults = {
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  fulfilledStatuses: string[];
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

export type CreateBillableEventRequest = {
  code: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent?: string;
  guardWorkflowStep?: string;
  guardRequired?: boolean;
  missingFeeChargePolicy?: MissingFeeChargePolicy;
  fulfilledStatuses?: string[];
};

export type UpdateBillableEventRequest = {
  name: string;
  description: string | null;
  isActive: boolean;
  paymentTiming: PaymentTiming;
  feeChargeTriggerEvent: string;
  guardWorkflowStep: string;
  guardRequired: boolean;
  missingFeeChargePolicy: MissingFeeChargePolicy;
  fulfilledStatuses: string[];
};

export type BillableEventListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[name]"?: string;
  "exact[code]"?: string;
  "exact[isActive]"?: boolean;
  "exact[paymentTiming]"?: PaymentTiming;
  "exact[guardWorkflowStep]"?: string;
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
