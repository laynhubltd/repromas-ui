// ── Enums ─────────────────────────────────────────────────────────────────────

export type ConfigKey = "CREDIT_LOAD_LIMITS" | "FORCE_CARRYOVER_FIRST";

export type ConfigScope = "GLOBAL" | "PROGRAM" | "SESSION" | "SEMESTER";

export type DataType = "STRING" | "INTEGER" | "FLOAT" | "BOOLEAN" | "ARRAY" | "JSON_OBJECT";

// ── Config value shapes ───────────────────────────────────────────────────────

export type CreditLoadLimitsValue = {
  min_credits: number;
  max_credits: number;
};

// ── API response shape ────────────────────────────────────────────────────────

export type SystemConfig = {
  id: number;
  tenantId: number;
  scope: ConfigScope;
  referenceId: number | null;
  configKey: ConfigKey;
  dataType: DataType;
  configValue: CreditLoadLimitsValue | boolean | unknown;
  description: string | null;
  configVersion: number | null;
};

// ── API request shapes ────────────────────────────────────────────────────────

export type CreateSystemConfigRequest = {
  scope: ConfigScope;
  referenceId: number | null;
  configKey: ConfigKey;
  dataType: DataType;
  configValue: CreditLoadLimitsValue | boolean;
  configVersion?: number | null;
  description?: string | null;
};

export type UpdateSystemConfigRequest = {
  scope?: ConfigScope;
  referenceId?: number | null;
  configValue?: CreditLoadLimitsValue | boolean;
  description?: string | null;
};

// ── Form values shape (internal to useSystemConfigModal) ─────────────────────

export type SystemConfigFormValues = {
  configKey: ConfigKey;
  scope: ConfigScope;
  referenceId?: number | null;
  minCredits?: number;
  maxCredits?: number;
  forceCarryover?: boolean;
  description?: string | null;
};

// ── Program reference (from GET /api/programs) ────────────────────────────────

export type ProgramOption = {
  id: number;
  name: string;
};

// ── Derived UI types ──────────────────────────────────────────────────────────

export type MissingConfigProgram = {
  referenceId: number;
  programName: string;
};
