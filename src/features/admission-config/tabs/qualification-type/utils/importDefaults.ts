import { CANONICAL_PRIOR_QUALIFICATION_TYPE_DEFAULTS } from "@/shared/constants/priorQualificationTypeOptions";
import type {
  CreatePriorQualificationTypeRequest,
  ImportDefaultsResult,
} from "../types/prior-qualification-type";

type CreateMutation = (
  body: CreatePriorQualificationTypeRequest,
) => Promise<unknown>;

function isConflictError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const status =
    "status" in err
      ? (err as { status?: number }).status
      : "data" in err &&
          typeof (err as { data?: { status?: number } }).data === "object"
        ? (err as { data?: { status?: number } }).data?.status
        : undefined;
  return status === 409;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const data = (err as { data?: { detail?: string; message?: string } }).data;
    if (data?.detail) return String(data.detail);
    if (data?.message) return String(data.message);
    if ("message" in err && typeof (err as { message?: string }).message === "string") {
      return (err as { message: string }).message;
    }
  }
  return "Unknown error";
}

export async function importPriorQualificationTypeDefaults(
  create: CreateMutation,
  defaults: CreatePriorQualificationTypeRequest[] = CANONICAL_PRIOR_QUALIFICATION_TYPE_DEFAULTS,
): Promise<ImportDefaultsResult> {
  const result: ImportDefaultsResult = {
    created: [],
    skipped: [],
    failed: [],
  };

  for (const row of defaults) {
    try {
      await create(row);
      result.created.push(row.code);
    } catch (err: unknown) {
      if (isConflictError(err)) {
        result.skipped.push(row.code);
      } else {
        result.failed.push({ code: row.code, message: extractErrorMessage(err) });
      }
    }
  }

  return result;
}
