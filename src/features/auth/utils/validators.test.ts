import { describe, expect, it } from "vitest";
import { validators } from "@/shared/utils/validators";
import { confirmPasswordRules, passwordRules } from "./validators";

async function runRules(
  rules: typeof passwordRules,
  value: unknown,
  getFieldValue?: () => unknown,
) {
  for (const rule of rules) {
    if ("validator" in rule && rule.validator) {
      await rule.validator({}, value, getFieldValue ?? (() => undefined));
    }
  }
}

describe("auth validators", () => {
  it("accepts password with at least 8 characters", async () => {
    await expect(runRules(passwordRules, "12345678")).resolves.toBeUndefined();
  });

  it("rejects short password", async () => {
    await expect(runRules(passwordRules, "short")).rejects.toThrow(
      "Password must be at least 8 characters",
    );
  });

  it("confirmPasswordRules rejects mismatch", async () => {
    const rules = confirmPasswordRules(() => "password123");
    await expect(
      runRules(rules, "different", () => "password123"),
    ).rejects.toThrow("Passwords do not match");
  });

  it("confirmPasswordRules accepts match", async () => {
    const rules = confirmPasswordRules(() => "password123");
    await expect(
      runRules(rules, "password123", () => "password123"),
    ).resolves.toBeUndefined();
  });

  it("shared validators.password matches min 8 rule", () => {
    expect(validators.password("12345678")).toBe(true);
    expect(validators.password("short")).toBe(false);
  });
});
