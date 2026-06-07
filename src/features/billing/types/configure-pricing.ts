export type ConfigurePricingParams = {
  eventCode: string;
  billableEventPolicyId?: number;
  cloneFromPolicyId?: number;
};

export type PublishedPolicyHandoff = {
  eventCode: string;
  policyId: number;
  versionNo: number;
  priorActivePolicyId?: number;
};
