import type {
  MeAdmissionProgress,
  MeAdmissionProgressBlocker,
  MeAdmissionProgressFee,
  MeAdmissionProgressStep,
} from "../types/me-admission-progress";

type RawRecord = Record<string, unknown>;

function readString(raw: RawRecord, snake: string, camel: string): string {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "string" ? value : "";
}

function readNumber(raw: RawRecord, snake: string, camel: string): number {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : 0;
}

function readBoolean(raw: RawRecord, snake: string, camel: string): boolean {
  const value = raw[snake] ?? raw[camel];
  return Boolean(value);
}

function readNullableNumber(
  raw: RawRecord,
  snake: string,
  camel: string,
): number | null {
  const value = raw[snake] ?? raw[camel];
  return typeof value === "number" ? value : null;
}

function mapStep(raw: unknown): MeAdmissionProgressStep | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    key: readString(data, "key", "key"),
    status: readString(data, "status", "status"),
    order: readNumber(data, "order", "order"),
  };
}

function mapBlocker(raw: unknown): MeAdmissionProgressBlocker | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  return {
    code: readString(data, "code", "code"),
    step: readString(data, "step", "step"),
  };
}

function mapFee(raw: unknown): MeAdmissionProgressFee | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as RawRecord;
  const feeChargeIdRaw = data.fee_charge_id ?? data.feeChargeId;
  return {
    required: readBoolean(data, "required", "required"),
    feeChargeId:
      typeof feeChargeIdRaw === "number" ? feeChargeIdRaw : null,
    status: readString(data, "status", "status"),
    allowedToSubmit: readBoolean(
      data,
      "allowed_to_submit",
      "allowedToSubmit",
    ),
  };
}

export function mapMeAdmissionProgress(raw: unknown): MeAdmissionProgress {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawRecord;

  const stepsRaw = data.steps;
  const steps = Array.isArray(stepsRaw)
    ? stepsRaw
        .map(mapStep)
        .filter((s): s is MeAdmissionProgressStep => s !== null)
        .sort((a, b) => a.order - b.order)
    : [];

  const blockersRaw = data.blockers;
  const blockers = Array.isArray(blockersRaw)
    ? blockersRaw
        .map(mapBlocker)
        .filter((b): b is MeAdmissionProgressBlocker => b !== null)
    : [];

  const feeRaw = data.fee;
  const fee = feeRaw != null ? mapFee(feeRaw) : null;

  return {
    portalState: readString(data, "portal_state", "portalState"),
    cycleId: readNumber(data, "cycle_id", "cycleId"),
    cycleStatus: readString(data, "cycle_status", "cycleStatus"),
    candidateId: readNumber(data, "candidate_id", "candidateId"),
    applicationId: readNullableNumber(
      data,
      "application_id",
      "applicationId",
    ),
    formSubmissionId: readNullableNumber(
      data,
      "form_submission_id",
      "formSubmissionId",
    ),
    currentStep: readString(data, "current_step", "currentStep"),
    nextAction: readString(data, "next_action", "nextAction"),
    steps,
    blockers,
    fee,
  };
}
