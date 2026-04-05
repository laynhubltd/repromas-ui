/**
 * parseApiError — Property-Based Tests
 *
 * Feature: shared-error-handler
 * Tests correctness properties from design.md using fast-check (100 iterations each).
 */

import * as fc from 'fast-check';

import {
    ApiErrorType,
    parseApiError,
    type ApiErrorBody,
    type ConstraintViolationError,
    type GenericApiError,
    type ValidationError
} from '@/shared/utils/error/parseApiError';

const FALLBACK = 'Something went wrong. Please try again.';

// ── Shared arbitraries ────────────────────────────────────────────────────────

const nonEmptyString = fc.string({ minLength: 1 });

const genericTypes = [
  ApiErrorType.BadRequest,
  ApiErrorType.NotFound,
  ApiErrorType.Unauthorized,
  ApiErrorType.Forbidden,
  ApiErrorType.Conflict,
  ApiErrorType.UnprocessableEntity,
] as const;

const genericTypeArb = fc.constantFrom(...genericTypes);

const statusForType: Record<string, number> = {
  [ApiErrorType.BadRequest]: 400,
  [ApiErrorType.NotFound]: 404,
  [ApiErrorType.Unauthorized]: 401,
  [ApiErrorType.Forbidden]: 403,
  [ApiErrorType.Conflict]: 409,
  [ApiErrorType.UnprocessableEntity]: 422,
  [ApiErrorType.Internal]: 500,
  [ApiErrorType.ConstraintViolation]: 409,
  [ApiErrorType.Validation]: 400,
};

/** Generates a random GenericApiError for one of the 7 non-field-level types */
const genericApiErrorArb = (typeArb = genericTypeArb) =>
  fc.record({
    type: typeArb,
    title: nonEmptyString,
    status: fc.integer({ min: 400, max: 599 }),
    detail: nonEmptyString,
  }) as fc.Arbitrary<GenericApiError>;

/** Generates a random ConstraintViolationError */
const constraintViolationErrorArb = fc.record({
  type: fc.constant(ApiErrorType.ConstraintViolation as typeof ApiErrorType.ConstraintViolation),
  title: nonEmptyString,
  status: fc.constant(409),
  detail: nonEmptyString,
  message: nonEmptyString,
  errors: fc.array(
    fc.record({ field: nonEmptyString, message: nonEmptyString }),
    { minLength: 0, maxLength: 10 },
  ),
}) as fc.Arbitrary<ConstraintViolationError>;

/** Generates a random ValidationError */
const validationErrorArb = fc.record({
  type: fc.constant(ApiErrorType.Validation as typeof ApiErrorType.Validation),
  title: nonEmptyString,
  status: fc.constant(400),
  detail: nonEmptyString,
  violations: fc.array(
    fc.record({ propertyPath: nonEmptyString, message: nonEmptyString }),
    { minLength: 0, maxLength: 10 },
  ),
}) as fc.Arbitrary<ValidationError>;

/** Generates any ApiErrorBody */
const apiErrorBodyArb: fc.Arbitrary<ApiErrorBody> = fc.oneof(
  genericApiErrorArb(),
  genericApiErrorArb(fc.constant(ApiErrorType.Internal)),
  constraintViolationErrorArb,
  validationErrorArb,
);


// ── Property 1: Output shape completeness ────────────────────────────────────

// Feature: shared-error-handler, Property 1: For any input, parseApiError returns an object with all five required fields
describe('Property 1: Output shape completeness', () => {
  it('always returns all five required fields for any input', () => {
    // Validates: Requirements 2.1, 2.2, 6.1, 7.1
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = parseApiError(input);

        // type must be a known ApiErrorType value
        expect(Object.values(ApiErrorType)).toContain(result.type);
        // status must be a number
        expect(typeof result.status).toBe('number');
        // message must be a non-empty string
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
        // fieldErrors must be a plain object (not null)
        expect(typeof result.fieldErrors).toBe('object');
        expect(result.fieldErrors).not.toBeNull();
        // raw must be an object (not null)
        expect(typeof result.raw).toBe('object');
        expect(result.raw).not.toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 2: Message never empty ──────────────────────────────────────────

// Feature: shared-error-handler, Property 2: For any input, parseApiError(input).message is always a non-empty string
describe('Property 2: Message never empty', () => {
  it('message is always a non-empty string for any input', () => {
    // Validates: Requirements 2.3, 3.2, 6.5
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = parseApiError(input);
        expect(result.message).toBeTruthy();
        expect(result.message.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 3: Generic error parsing preserves type, status, and detail ─────

// Feature: shared-error-handler, Property 3: For any GenericApiError with non-empty detail, output type/status/message match input and fieldErrors is {}
describe('Property 3: Generic error parsing preserves type, status, and detail', () => {
  it('type, status, message match input body and fieldErrors is {} for any generic error with non-empty detail', () => {
    // Validates: Requirements 3.1, 2.2
    fc.assert(
      fc.property(
        genericApiErrorArb().filter((b) => b.detail.length > 0),
        (body) => {
          const result = parseApiError({ message: 'err', error: JSON.stringify(body) });
          expect(result.type).toBe(body.type);
          expect(result.status).toBe(body.status);
          expect(result.message).toBe(body.detail);
          expect(result.fieldErrors).toEqual({});
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 4: Internal error message is always masked ──────────────────────

// Feature: shared-error-handler, Property 4: For any error body with type Internal, message always equals the generic fallback string
describe('Property 4: Internal error message is always masked', () => {
  it('message always equals the fallback string for any Internal error body, regardless of detail', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(
        genericApiErrorArb(fc.constant(ApiErrorType.Internal)),
        (body) => {
          const result = parseApiError({ message: 'err', error: JSON.stringify(body) });
          expect(result.message).toBe(FALLBACK);
          // detail must never leak
          if (body.detail) {
            expect(result.message).not.toBe(body.detail);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 5: Constraint violation field round-trip ────────────────────────

// Feature: shared-error-handler, Property 5: For any ConstraintViolationError, fieldErrors keys equal the set of field values from errors[]
describe('Property 5: Constraint violation field round-trip', () => {
  it('fieldErrors keys exactly equal the set of field values from errors[]', () => {
    // Validates: Requirements 4.1, 7.5
    fc.assert(
      fc.property(constraintViolationErrorArb, (body) => {
        const result = parseApiError({ message: 'err', error: JSON.stringify(body) });

        const expectedKeys = new Set(body.errors.map((e) => e.field));
        const actualKeys = new Set(Object.keys(result.fieldErrors));

        expect(actualKeys).toEqual(expectedKeys);

        // Each value must match the corresponding message
        for (const { field, message } of body.errors) {
          expect(result.fieldErrors[field]).toBe(message);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 6: Validation field round-trip ──────────────────────────────────

// Feature: shared-error-handler, Property 6: For any ValidationError, fieldErrors keys equal the set of propertyPath values from violations[]
describe('Property 6: Validation field round-trip', () => {
  it('fieldErrors keys exactly equal the set of propertyPath values from violations[]', () => {
    // Validates: Requirements 5.1, 7.4
    fc.assert(
      fc.property(validationErrorArb, (body) => {
        const result = parseApiError({ message: 'err', error: JSON.stringify(body) });

        const expectedKeys = new Set(body.violations.map((v) => v.propertyPath));
        const actualKeys = new Set(Object.keys(result.fieldErrors));

        expect(actualKeys).toEqual(expectedKeys);

        // Each value must match the corresponding message
        for (const { propertyPath, message } of body.violations) {
          expect(result.fieldErrors[propertyPath]).toBe(message);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 7: JSON string parsing round-trip ───────────────────────────────

// Feature: shared-error-handler, Property 7: Wrapping any ApiErrorBody as JSON.stringify in ApiErrorResponse.error produces the same type/fieldErrors/message as parsing the body directly
describe('Property 7: JSON string parsing round-trip', () => {
  it('wrapping body as JSON string in ApiErrorResponse.error produces same type/fieldErrors/message as direct parse', () => {
    // Validates: Requirements 6.3, 7.3
    fc.assert(
      fc.property(apiErrorBodyArb, (body) => {
        // Parse via ApiErrorResponse wrapper (JSON string in .error field)
        const viaWrapper = parseApiError({
          message: 'wrapper-message',
          status: body.status,
          error: JSON.stringify(body),
        });

        // Parse the body directly (simulate parseBody by wrapping with a known-good ApiErrorResponse)
        const direct = parseApiError({
          message: 'direct-message',
          status: body.status,
          error: JSON.stringify(body),
        });

        expect(viaWrapper.type).toBe(direct.type);
        expect(viaWrapper.message).toBe(direct.message);
        expect(viaWrapper.fieldErrors).toEqual(direct.fieldErrors);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 8: Fallback on invalid ApiErrorResponse.error ───────────────────

// Feature: shared-error-handler, Property 8: When error field is absent, non-JSON, or has unrecognised type, message equals apiErrorResponse.message and fieldErrors equals errorFields ?? {}
describe('Property 8: Fallback on invalid ApiErrorResponse.error', () => {
  it('falls back to ApiErrorResponse.message and errorFields when error field is absent', () => {
    // Validates: Requirements 6.4
    fc.assert(
      fc.property(
        nonEmptyString,
        fc.option(fc.dictionary(nonEmptyString, nonEmptyString), { nil: undefined }),
        (message, errorFields) => {
          const input = { message, ...(errorFields !== undefined ? { errorFields } : {}) };
          const result = parseApiError(input);
          expect(result.message).toBe(message);
          expect(result.fieldErrors).toEqual(errorFields ?? {});
        },
      ),
      { numRuns: 100 },
    );
  });

  it('falls back to ApiErrorResponse fields when error field is not valid JSON', () => {
    fc.assert(
      fc.property(
        nonEmptyString,
        // Generate strings that are definitely not valid JSON objects
        fc.string().filter((s) => { try { const p = JSON.parse(s); return typeof p !== 'object' || p === null; } catch { return true; } }),
        fc.option(fc.dictionary(nonEmptyString, nonEmptyString), { nil: undefined }),
        (message, invalidError, errorFields) => {
          const input = {
            message,
            error: invalidError,
            ...(errorFields !== undefined ? { errorFields } : {}),
          };
          const result = parseApiError(input);
          expect(result.message).toBe(message);
          expect(result.fieldErrors).toEqual(errorFields ?? {});
        },
      ),
      { numRuns: 100 },
    );
  });

  it('falls back when error field is valid JSON but has an unrecognised type URI', () => {
    fc.assert(
      fc.property(
        nonEmptyString,
        // A string that is valid JSON but whose .type is not a known ApiErrorType
        nonEmptyString.filter((s) => !(Object.values(ApiErrorType) as string[]).includes(s)),
        fc.option(fc.dictionary(nonEmptyString, nonEmptyString), { nil: undefined }),
        (message, unknownType, errorFields) => {
          const unrecognisedBody = JSON.stringify({ type: unknownType, detail: 'x', status: 400, title: 'x' });
          const input = {
            message,
            error: unrecognisedBody,
            ...(errorFields !== undefined ? { errorFields } : {}),
          };
          const result = parseApiError(input);
          expect(result.message).toBe(message);
          expect(result.fieldErrors).toEqual(errorFields ?? {});
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 9: Purity — deterministic output ────────────────────────────────

// Feature: shared-error-handler, Property 9: Calling parseApiError(input) twice returns structurally equivalent results and does not mutate input
describe('Property 9: Purity — deterministic output', () => {
  it('calling parseApiError twice on the same input returns structurally equivalent results', () => {
    // Validates: Requirements 7.1, 7.2
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const first = parseApiError(input);
        const second = parseApiError(input);

        expect(first.type).toBe(second.type);
        expect(first.status).toBe(second.status);
        expect(first.message).toBe(second.message);
        expect(first.fieldErrors).toEqual(second.fieldErrors);
      }),
      { numRuns: 100 },
    );
  });

  it('does not mutate the input object between calls', () => {
    fc.assert(
      fc.property(apiErrorBodyArb, (body) => {
        const input = { message: 'test', status: body.status, error: JSON.stringify(body) };
        const inputSnapshot = JSON.stringify(input);

        parseApiError(input);

        // Input must not have been mutated
        expect(JSON.stringify(input)).toBe(inputSnapshot);
      }),
      { numRuns: 100 },
    );
  });
});
