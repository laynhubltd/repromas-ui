import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { extractNameError } from "../features/settings/tabs/curriculum-version/utils/extractNameError";

// --- Unit tests ---

describe("extractNameError", () => {
  describe("409 ConstraintViolation", () => {
    it("returns field error when errors[].field === 'name'", () => {
      const error = {
        data: { errors: [{ field: "name", message: "Name already exists" }] },
      };
      expect(extractNameError(error)).toEqual({
        type: "field",
        message: "Name already exists",
      });
    });

    it("returns null when errors[].field !== 'name'", () => {
      const error = {
        data: { errors: [{ field: "code", message: "Code taken" }] },
      };
      expect(extractNameError(error)).toBeNull();
    });

    it("returns null when errors array is empty", () => {
      const error = { data: { errors: [] } };
      expect(extractNameError(error)).toBeNull();
    });

    it("handles error object without .data wrapper", () => {
      const error = { errors: [{ field: "name", message: "Duplicate name" }] };
      expect(extractNameError(error)).toEqual({
        type: "field",
        message: "Duplicate name",
      });
    });
  });

  describe("400 ValidationViolation", () => {
    it("returns field error when violations[].propertyPath === 'name'", () => {
      const error = {
        data: {
          violations: [{ propertyPath: "name", message: "Must not be blank" }],
        },
      };
      expect(extractNameError(error)).toEqual({
        type: "field",
        message: "Must not be blank",
      });
    });

    it("returns null when violations[].propertyPath !== 'name'", () => {
      const error = {
        data: {
          violations: [{ propertyPath: "description", message: "Too long" }],
        },
      };
      expect(extractNameError(error)).toBeNull();
    });

    it("returns null when violations array is empty", () => {
      const error = { data: { violations: [] } };
      expect(extractNameError(error)).toBeNull();
    });
  });

  describe("400 GenericError", () => {
    it("returns form error using detail field", () => {
      const error = {
        data: {
          type: "https://tools.ietf.org/html/rfc2616#section-10",
          title: "An error occurred",
          status: 400,
          detail: "Something went wrong on the server",
        },
      };
      expect(extractNameError(error)).toEqual({
        type: "form",
        message: "Something went wrong on the server",
      });
    });
  });

  describe("unrecognised shapes", () => {
    it("returns null for null", () => {
      expect(extractNameError(null)).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(extractNameError(undefined)).toBeNull();
    });

    it("returns null for a string", () => {
      expect(extractNameError("error")).toBeNull();
    });

    it("returns null for an empty object", () => {
      expect(extractNameError({})).toBeNull();
    });

    it("returns null for an object with unrecognised shape", () => {
      expect(extractNameError({ message: "oops", code: 500 })).toBeNull();
    });
  });
});

// --- Property-based test ---

// Feature: curriculum-version-settings, Property 5: Error normalisation surfaces name errors inline
describe("Property 5: extractNameError normalisation", () => {
  /**
   * Validates: Requirements 4.6, 4.7, 4.8, 5.6, 5.7, 5.8
   *
   * For any API error response (409 ConstraintViolation, 400 ValidationViolation,
   * or GenericError) returned from a create or update mutation, extractNameError
   * should return a field-level error when the error targets the "name" field,
   * and a form-level error for generic errors — never silently swallowing the message.
   */
  it("always returns a field error for 409 ConstraintViolation targeting name", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (message) => {
        const error = {
          data: { errors: [{ field: "name", message }] },
        };
        const result = extractNameError(error);
        expect(result).toEqual({ type: "field", message });
      })
    );
  });

  it("always returns null for 409 ConstraintViolation not targeting name", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s !== "name"),
        fc.string({ minLength: 1 }),
        (field, message) => {
          const error = {
            data: { errors: [{ field, message }] },
          };
          const result = extractNameError(error);
          expect(result).toBeNull();
        }
      )
    );
  });

  it("always returns a field error for 400 ValidationViolation targeting name", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (message) => {
        const error = {
          data: { violations: [{ propertyPath: "name", message }] },
        };
        const result = extractNameError(error);
        expect(result).toEqual({ type: "field", message });
      })
    );
  });

  it("always returns null for 400 ValidationViolation not targeting name", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s !== "name"),
        fc.string({ minLength: 1 }),
        (propertyPath, message) => {
          const error = {
            data: { violations: [{ propertyPath, message }] },
          };
          const result = extractNameError(error);
          expect(result).toBeNull();
        }
      )
    );
  });

  it("always returns a form error with detail for GenericError shape", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 400, max: 499 }),
        fc.string({ minLength: 1 }),
        (type, title, status, detail) => {
          const error = { data: { type, title, status, detail } };
          const result = extractNameError(error);
          expect(result).toEqual({ type: "form", message: detail });
        }
      )
    );
  });

  it("never swallows the message — result message always equals the input message", () => {
    const constraintViolation = fc.string({ minLength: 1 }).map((message) => ({
      input: { data: { errors: [{ field: "name", message }] } },
      expected: message,
    }));

    const validationViolation = fc.string({ minLength: 1 }).map((message) => ({
      input: { data: { violations: [{ propertyPath: "name", message }] } },
      expected: message,
    }));

    const genericError = fc
      .tuple(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 400, max: 499 }),
        fc.string({ minLength: 1 })
      )
      .map(([type, title, status, detail]) => ({
        input: { data: { type, title, status, detail } },
        expected: detail,
      }));

    fc.assert(
      fc.property(
        fc.oneof(constraintViolation, validationViolation, genericError),
        ({ input, expected }) => {
          const result = extractNameError(input);
          expect(result).not.toBeNull();
          expect(result!.message).toBe(expected);
        }
      )
    );
  });
});
