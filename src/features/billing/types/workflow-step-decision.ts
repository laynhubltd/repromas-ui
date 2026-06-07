import type { WorkflowStep } from "@/shared/constants/billingWorkflowOptions";

export type WorkflowStepDecisionItem = {
  eventCode: string;
  allowed: boolean;
  status: string | null;
  feeChargeId: number | null;
  amountDueTotal: string;
  amountDueRequired: string;
  amountPaidTotal: string;
  amountCreditedTotal: string;
  amountOutstandingTotal: string;
  amountOutstandingRequired: string;
  currentPeriodAllowed: boolean | null;
  arrearsAllowed: boolean | null;
  arrearsOpenCount: number | null;
  arrearsOutstandingRequired: string | null;
  reason: string | null;
};

export type WorkflowStepDecisionResponse = {
  workflowStep: WorkflowStep;
  resourceType: string;
  resourceId: number;
  payerType: string;
  payerId: number;
  allowed: boolean;
  blockingCount: number;
  items: WorkflowStepDecisionItem[];
};

export type WorkflowStepDecisionParams = {
  workflowStep: WorkflowStep;
  eventCode?: string;
};

export type WorkflowPayNowPayload = {
  feeChargeId: number;
  eventCode: string;
  amountOutstandingRequired: string;
};
