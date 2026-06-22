import { describe, expect, it } from "vitest";
import { mapViolationToFieldErrors } from "./mapViolationToFieldErrors";

describe("mapViolationToFieldErrors", () => {
  it("maps section.field property paths to field keys", () => {
    const errors = mapViolationToFieldErrors([
      { propertyPath: "10.email", message: "Invalid email" },
      { propertyPath: "10.phone", message: "Required" },
    ]);
    expect(errors).toEqual({
      email: "Invalid email",
      phone: "Required",
    });
  });

  it("maps single-segment paths directly", () => {
    const errors = mapViolationToFieldErrors([
      { propertyPath: "email", message: "Must not be blank" },
    ]);
    expect(errors).toEqual({ email: "Must not be blank" });
  });
});
