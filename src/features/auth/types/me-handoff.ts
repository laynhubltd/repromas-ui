export type HandoffBillingPayer = {
  type: string;
  id: number;
};

export type HandoffMetadata = {
  status: string;
  fromPortal: string;
  toPortal: string;
  candidateId: number;
  studentId: number;
  billingPayer: HandoffBillingPayer;
};

export type MeHandoffResponse = {
  tenant_id?: number;
  tenantId?: number;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
  profile?: unknown;
  roles?: unknown[];
  permissions?: string[];
  handoff?: HandoffMetadata;
};
