export const FEE_CHARGE_ITEMS_PER_PAGE = 30;
export const FEE_CHARGE_SORT_DEFAULT = "createdAt:desc";

export const FEE_CHARGE_UI_COPY = {
  explainerTitle: "Fee charges",
  explainerBody:
    "Read-only view of fee charges created at runtime. Each charge is stamped with the policy version and occurrence key active when billing ran. Amounts are not rewritten when you publish a new policy.",
  emptyTitle: "No fee charges",
  emptyBody: "Charges appear here after billing runs for configured fee types.",
  sessionLockInTooltip:
    "Charges keep the policy version from when they were created. New sessions may use the active policy; existing open charges stay on their stamped version until paid or waived.",
  grandfatheredBadge: "Prior policy",
  policyVersionLabel: "Policy version",
  occurrenceKeyLabel: "Occurrence",
  detailTitle: "Fee charge details",
} as const;
