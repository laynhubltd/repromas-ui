export const FEE_ITEM_SORT_DEFAULT = "name:asc";
export const FEE_ITEM_ITEMS_PER_PAGE = 30;

export const FEE_ITEM_UI_COPY = {
  explainerTitle: "Fee item catalog",
  explainerBody:
    "Define reusable fee line names and accounting codes for your institution. Fee items do not carry amounts — set prices per event and audience in Pricing Rules after you configure Fees and fee items here.",
  emptyTitle: "No fee items yet",
  emptyBody:
    "Create fee lines (e.g. Application Fee, Medical Fee) before building pricing rules.",
  createSuccess: "Fee item created successfully.",
  updateSuccess: "Fee item updated successfully.",
  deleteSuccess: "Fee item deleted successfully.",
  deactivateHint:
    "This fee item is used in pricing rules. Deactivate it instead of deleting.",
} as const;

export const FEE_ITEM_TOOLTIPS = {
  name: "Unique name per tenant. Shown on pricing rule lines and receipts.",
  accountingCode:
    "Optional GL or export code. Leave blank if not used by your finance system.",
  description: "Internal note for bursary staff — not shown to candidates.",
  isActive:
    "Inactive items cannot be added to new pricing rules but remain on historical rules.",
} as const;
