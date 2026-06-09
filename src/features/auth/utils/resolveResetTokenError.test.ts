import { describe, expect, it } from "vitest";
import { resolveResetTokenError } from "./resolveResetTokenError";
import {
  PASSWORD_RESET_TOKEN_ERROR_DEFAULT,
  PASSWORD_RESET_TOKEN_ERROR_EXPIRED,
  PASSWORD_RESET_TOKEN_ERROR_INVALID,
  PASSWORD_RESET_TOKEN_ERROR_USED,
} from "@/shared/constants/passwordResetOptions";

describe("resolveResetTokenError", () => {
  it("maps expired detail", () => {
    expect(
      resolveResetTokenError("The reset password link has expired."),
    ).toBe(PASSWORD_RESET_TOKEN_ERROR_EXPIRED);
  });

  it("maps invalid detail", () => {
    expect(
      resolveResetTokenError("The reset password link is invalid."),
    ).toBe(PASSWORD_RESET_TOKEN_ERROR_INVALID);
  });

  it("maps already used detail", () => {
    expect(
      resolveResetTokenError("The reset password link has already been used."),
    ).toBe(PASSWORD_RESET_TOKEN_ERROR_USED);
  });

  it("returns default for unknown detail", () => {
    expect(resolveResetTokenError("Something else")).toBe(
      PASSWORD_RESET_TOKEN_ERROR_DEFAULT,
    );
  });

  it("returns default when detail is empty", () => {
    expect(resolveResetTokenError(undefined)).toBe(
      PASSWORD_RESET_TOKEN_ERROR_DEFAULT,
    );
  });
});
