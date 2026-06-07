export type FeeChargeStatus =
  | "OPEN"
  | "PAID"
  | "PARTIALLY_PAID"
  | "WAIVED"
  | "CANCELLED"
  | string;

export type FeeCharge = {
  id: number;
  billableEventPolicyId: number;
  occurrenceKey: string;
  eventCode: string;
  status: FeeChargeStatus;
  studentId: number | null;
  candidateId: number | null;
  academicSessionId: number | null;
  grossAmount: string | null;
  amountDue: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeeChargeListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[eventCode]"?: string;
  "exact[status]"?: FeeChargeStatus;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
