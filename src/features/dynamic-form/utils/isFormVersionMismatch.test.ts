import { describe, expect, it } from "vitest";
import type { ParsedApiError } from "@/shared/utils/error/parseApiError";
import { isFormVersionMismatch } from "./isFormVersionMismatch";

function makeError(
  status: number,
  raw: Record<string, unknown> = {},
): ParsedApiError {
  return {
    status,
    message: "x",
    fieldErrors: {},
    raw,
  } as unknown as ParsedApiError;
}

describe("isFormVersionMismatch", () => {
  it("returns false for non-422 statuses", () => {
    expect(isFormVersionMismatch(makeError(400))).toBe(false);
    expect(isFormVersionMismatch(makeError(409))).toBe(false);
  });

  it("returns true for 422 with FORM_VERSION_MISMATCH code", () => {
    expect(
      isFormVersionMismatch(makeError(422, { code: "FORM_VERSION_MISMATCH" })),
    ).toBe(true);
  });

  it("returns false for 422 with a different code", () => {
    expect(isFormVersionMismatch(makeError(422, { code: "OTHER" }))).toBe(false);
  });

  it("falls back to true for 422 without a code", () => {
    expect(isFormVersionMismatch(makeError(422))).toBe(true);
  });
});
