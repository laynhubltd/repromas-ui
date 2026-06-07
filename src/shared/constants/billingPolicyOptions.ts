export const BILLING_POLICY_SORT_DEFAULT = "versionNo:desc";
export const BILLING_POLICY_ITEMS_PER_PAGE = 30;

export const BILLING_POLICY_UI_COPY = {
  explainerTitle: "Billing policy versions",
  explainerBody:
    "Policy versions control when fees are charged, which workflow steps require payment, and how often students can be billed. Changes publish a new version — past versions stay in history. Set fee amounts separately in Pricing Rules.",
  setupStandardFees: "Set up standard fees",
  selectEventPlaceholder: "Select a fee type",
  noEventsConfigured:
    "No fee types are configured yet. Use the Fee Event tab to set up standard fees or add a custom fee.",
  loadPoliciesError: "Failed to load policy versions.",
  loadEventsError: "Failed to load fee configurations.",
  noVersions: "No policy versions for this fee type yet.",
  publishVersion: "Publish new version",
  publishRevision: "Publish revision",
  viewVersion: "View",
  deleteVersion: "Delete version",
  useAsDraft: "Use as draft",
  currentBadge: "Current",
  publishSuccess: "Published version {versionNo}. Check Pricing Rules for amounts.",
  reviseSuccess: "Published version {versionNo}. Check Pricing Rules for amounts.",
  deleteSuccess: "Policy version removed.",
  seedSuccess:
    "Set up {createdCount} fee type(s). {skippedCount} skipped.",
  seedError: "Failed to set up standard fees.",
  unchangedPolicy: "No changes to publish — the form matches the current version.",
  occurrenceChangeTitle: "Change billing frequency?",
  occurrenceChangeBody:
    "Changing how often this fee is charged affects new fee records only. Existing charges are not migrated.",
  paymentTimingChangeTitle: "Change payment timing?",
  paymentTimingChangeBody:
    "This will reset trigger, guard, and billing rules to the recommended settings for this timing.",
  deleteVersionTitle: "Delete policy version?",
  deleteVersionDescription:
    "Remove version {versionNo} for {code}? Only historical versions can be deleted.",
  postPublishPricingReminder:
    "Amounts are unchanged — update Pricing Rules if needed for this fee code.",
  skippedAlreadyExists: "Already configured",
  skippedNoDefaults: "No catalog defaults",
} as const;
