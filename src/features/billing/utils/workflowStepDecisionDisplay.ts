import { BILLING_WORKFLOW_UI_COPY } from "@/shared/constants/billingWorkflowOptions";
import { formatCurrencyDisplay } from "@/features/billing/tabs/pricing-rules/utils/computeGrossPreview";
import type {
  WorkflowStepDecisionItem,
  WorkflowStepDecisionResponse,
} from "../types/workflow-step-decision";

export type WorkflowBlockingVariant =
  | "pass"
  | "preparing"
  | "payNow"
  | "arrears"
  | "cutover";

export type WorkflowBlockingUi = {
  variant: WorkflowBlockingVariant;
  primaryItem: WorkflowStepDecisionItem | null;
  message: string;
  payAmount: string | null;
  payAmountDisplay: string | null;
  canPayNow: boolean;
};

const FEE_NOT_GENERATED_PATTERNS = [
  "not found",
  "not generated",
  "fee charge not found",
];

function reasonIndicatesFeeNotGenerated(reason: string | null): boolean {
  if (!reason) return false;
  const lower = reason.toLowerCase();
  return FEE_NOT_GENERATED_PATTERNS.some((pattern) => lower.includes(pattern));
}

function reasonIndicatesCutoverIncomplete(reason: string | null): boolean {
  if (!reason) return false;
  return reason.toLowerCase().includes("cutover");
}

function isUnsettledCurrentPeriodStatus(status: string | null): boolean {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized === "PENDING" || normalized === "PARTIAL";
}

export function getBlockingItems(
  response: WorkflowStepDecisionResponse | undefined,
): WorkflowStepDecisionItem[] {
  if (!response) return [];
  return response.items.filter((item) => !item.allowed);
}

function resolveItemVariant(
  item: WorkflowStepDecisionItem,
): Exclude<WorkflowBlockingVariant, "pass"> {
  if (reasonIndicatesCutoverIncomplete(item.reason)) {
    return "cutover";
  }

  if (
    item.status === null &&
    reasonIndicatesFeeNotGenerated(item.reason)
  ) {
    return "preparing";
  }

  if (
    item.currentPeriodAllowed === true &&
    item.arrearsAllowed === false
  ) {
    return "arrears";
  }

  if (
    item.currentPeriodAllowed === false ||
    isUnsettledCurrentPeriodStatus(item.status)
  ) {
    return "payNow";
  }

  if (item.arrearsAllowed === false) {
    return "arrears";
  }

  return "payNow";
}

function messageForVariant(
  variant: Exclude<WorkflowBlockingVariant, "pass">,
  item: WorkflowStepDecisionItem,
): string {
  if (variant === "cutover") {
    return item.reason ?? BILLING_WORKFLOW_UI_COPY.cutoverBlockedDescription;
  }

  if (variant === "preparing") {
    return BILLING_WORKFLOW_UI_COPY.preparingFeeDescription;
  }

  if (variant === "arrears") {
    const amount = item.arrearsOutstandingRequired ?? item.amountOutstandingRequired;
    const formatted = formatCurrencyDisplay(amount);
    return `${BILLING_WORKFLOW_UI_COPY.arrearsBlocked} ${formatted}`;
  }

  const formatted = formatCurrencyDisplay(item.amountOutstandingRequired);
  return `${BILLING_WORKFLOW_UI_COPY.currentPeriodUnpaid} ${formatted}`;
}

function payAmountForVariant(
  variant: Exclude<WorkflowBlockingVariant, "pass">,
  item: WorkflowStepDecisionItem,
): string | null {
  if (variant === "preparing") return null;
  if (variant === "arrears") {
    return item.arrearsOutstandingRequired ?? item.amountOutstandingRequired;
  }
  return item.amountOutstandingRequired;
}

export function resolveWorkflowBlockingUi(
  response: WorkflowStepDecisionResponse | undefined,
): WorkflowBlockingUi {
  if (!response || response.allowed) {
    return {
      variant: "pass",
      primaryItem: null,
      message: "",
      payAmount: null,
      payAmountDisplay: null,
      canPayNow: false,
    };
  }

  const blockingItems = getBlockingItems(response);
  const primaryItem = blockingItems[0] ?? null;

  if (!primaryItem) {
    return {
      variant: "payNow",
      primaryItem: null,
      message: BILLING_WORKFLOW_UI_COPY.paymentRequired,
      payAmount: null,
      payAmountDisplay: null,
      canPayNow: false,
    };
  }

  const variant = resolveItemVariant(primaryItem);
  const payAmount = payAmountForVariant(variant, primaryItem);
  const canPayNow =
    variant !== "preparing" &&
    variant !== "cutover" &&
    primaryItem.feeChargeId !== null &&
    variant === "payNow";

  return {
    variant,
    primaryItem,
    message: messageForVariant(variant, primaryItem),
    payAmount,
    payAmountDisplay: payAmount ? formatCurrencyDisplay(payAmount) : null,
    canPayNow,
  };
}
