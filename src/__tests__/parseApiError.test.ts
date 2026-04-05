import {
    ApiErrorType,
    HttpStatusCode,
    parseApiError,
    type ApiErrorBody,
    type ConstraintViolationError,
    type GenericApiError,
    type ValidationError,
} from '@/shared/utils/error/parseApiError';
import { describe, expect, it } from 'vitest';

const FALLBACK = 'Something went wrong. Please try again.';

// ─── Generic Error Bodies ─────────────────────────────────────────────────────

describe('parseApiError — Generic errors', () => {
  it('parses a BadRequest body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.BadRequest,
      title: 'Bad Request',
      status: 400,
      detail: 'The request was malformed.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.BadRequest);
    expect(result.status).toBe(400);
    expect(result.message).toBe('The request was malformed.');
    expect(result.fieldErrors).toEqual({});
  });

  it('parses a NotFound body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.NotFound,
      title: 'Not Found',
      status: 404,
      detail: 'Resource not found.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.NotFound);
    expect(result.status).toBe(404);
    expect(result.message).toBe('Resource not found.');
    expect(result.fieldErrors).toEqual({});
  });

  it('parses an Unauthorized body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.Unauthorized,
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.Unauthorized);
    expect(result.status).toBe(401);
    expect(result.message).toBe('Authentication required.');
  });

  it('parses a Forbidden body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.Forbidden,
      title: 'Forbidden',
      status: 403,
      detail: 'Access denied.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.Forbidden);
    expect(result.status).toBe(403);
    expect(result.message).toBe('Access denied.');
  });

  it('parses a Conflict body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.Conflict,
      title: 'Conflict',
      status: 409,
      detail: 'Resource already exists.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.Conflict);
    expect(result.status).toBe(409);
    expect(result.message).toBe('Resource already exists.');
  });

  it('parses an UnprocessableEntity body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.UnprocessableEntity,
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'Semantic error in request.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.UnprocessableEntity);
    expect(result.status).toBe(422);
    expect(result.message).toBe('Semantic error in request.');
  });

  it('sets raw to the original parsed body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.BadRequest,
      title: 'Bad Request',
      status: 400,
      detail: 'Bad input.',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.raw).toEqual(body);
  });
});

// ─── 500 Masking ──────────────────────────────────────────────────────────────

describe('parseApiError — Internal (500) masking', () => {
  it('masks detail for Internal error body', () => {
    const body: GenericApiError = {
      type: ApiErrorType.Internal,
      title: 'Internal Server Error',
      status: 500,
      detail: 'NullPointerException at line 42',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.status).toBe(500);
    expect(result.message).toBe(FALLBACK);
    expect(result.message).not.toContain('NullPointerException');
  });

  it('masks detail even when detail is a non-empty string', () => {
    const body: GenericApiError = {
      type: ApiErrorType.Internal,
      title: 'Server Error',
      status: 500,
      detail: 'Sensitive stack trace info',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe(FALLBACK);
  });
});

// ─── detail → title fallback chain ───────────────────────────────────────────

describe('parseApiError — detail → title fallback chain', () => {
  it('uses title when detail is empty string', () => {
    const body: GenericApiError = {
      type: ApiErrorType.BadRequest,
      title: 'Bad Request Title',
      status: 400,
      detail: '',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe('Bad Request Title');
  });

  it('uses FALLBACK when both detail and title are empty', () => {
    const body = {
      type: ApiErrorType.BadRequest,
      title: '',
      status: 400,
      detail: '',
    } as GenericApiError;
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe(FALLBACK);
  });

  it('uses detail over title when both are present', () => {
    const body: GenericApiError = {
      type: ApiErrorType.BadRequest,
      title: 'Title fallback',
      status: 400,
      detail: 'Specific detail message',
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe('Specific detail message');
  });
});

// ─── Constraint Violation Errors ─────────────────────────────────────────────

describe('parseApiError — ConstraintViolationError', () => {
  it('maps errors[] to fieldErrors', () => {
    const body: ConstraintViolationError = {
      type: ApiErrorType.ConstraintViolation,
      title: 'Constraint Violation',
      status: 409,
      detail: '',
      message: 'Constraint violated',
      errors: [
        { field: 'name', message: 'Name already exists' },
        { field: 'code', message: 'Code is taken' },
      ],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.ConstraintViolation);
    expect(result.status).toBe(409);
    expect(result.fieldErrors).toEqual({
      name: 'Name already exists',
      code: 'Code is taken',
    });
  });

  it('uses body.message as the top-level message', () => {
    const body: ConstraintViolationError = {
      type: ApiErrorType.ConstraintViolation,
      title: 'Constraint Violation',
      status: 409,
      detail: 'detail text',
      message: 'Constraint violated',
      errors: [{ field: 'name', message: 'Duplicate' }],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe('Constraint violated');
  });

  it('falls back to detail when message is empty', () => {
    const body: ConstraintViolationError = {
      type: ApiErrorType.ConstraintViolation,
      title: 'Constraint Violation',
      status: 409,
      detail: 'Fallback detail',
      message: '',
      errors: [{ field: 'name', message: 'Duplicate' }],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe('Fallback detail');
  });

  it('returns empty fieldErrors when errors[] is empty', () => {
    const body: ConstraintViolationError = {
      type: ApiErrorType.ConstraintViolation,
      title: 'Constraint Violation',
      status: 409,
      detail: 'Some detail',
      message: 'Constraint violated',
      errors: [],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.fieldErrors).toEqual({});
    expect(result.message).toBe('Constraint violated');
  });
});

// ─── Validation Errors ────────────────────────────────────────────────────────

describe('parseApiError — ValidationError', () => {
  it('maps violations[] to fieldErrors', () => {
    const body: ValidationError = {
      type: ApiErrorType.Validation,
      title: 'Validation Error',
      status: 400,
      detail: 'Validation failed',
      violations: [
        { propertyPath: 'name', message: 'Must not be blank' },
        { propertyPath: 'email', message: 'Invalid email format' },
      ],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.type).toBe(ApiErrorType.Validation);
    expect(result.status).toBe(400);
    expect(result.fieldErrors).toEqual({
      name: 'Must not be blank',
      email: 'Invalid email format',
    });
  });

  it('uses detail as the top-level message', () => {
    const body: ValidationError = {
      type: ApiErrorType.Validation,
      title: 'Validation Error',
      status: 400,
      detail: 'One or more fields are invalid',
      violations: [{ propertyPath: 'name', message: 'Required' }],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.message).toBe('One or more fields are invalid');
  });

  it('returns empty fieldErrors when violations[] is empty', () => {
    const body: ValidationError = {
      type: ApiErrorType.Validation,
      title: 'Validation Error',
      status: 400,
      detail: 'Validation failed',
      violations: [],
    };
    const result = parseApiError({ message: 'error', error: JSON.stringify(body) });
    expect(result.fieldErrors).toEqual({});
    expect(result.message).toBe('Validation failed');
  });
});

// ─── null / undefined / non-object inputs ────────────────────────────────────

describe('parseApiError — null / undefined / non-object inputs', () => {
  it('returns Internal fallback for null', () => {
    const result = parseApiError(null);
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.status).toBe(HttpStatusCode.InternalServerError);
    expect(result.message).toBe(FALLBACK);
    expect(result.fieldErrors).toEqual({});
  });

  it('returns Internal fallback for undefined', () => {
    const result = parseApiError(undefined);
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.status).toBe(HttpStatusCode.InternalServerError);
    expect(result.message).toBe(FALLBACK);
    expect(result.fieldErrors).toEqual({});
  });

  it('returns Internal fallback for a string', () => {
    const result = parseApiError('some error string');
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.message).toBe(FALLBACK);
  });

  it('returns Internal fallback for a number', () => {
    const result = parseApiError(500);
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.message).toBe(FALLBACK);
  });

  it('returns Internal fallback for false', () => {
    const result = parseApiError(false);
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.message).toBe(FALLBACK);
  });

  it('message is never empty for any primitive input', () => {
    [null, undefined, '', 0, false, NaN].forEach((input) => {
      expect(parseApiError(input).message.length).toBeGreaterThan(0);
    });
  });
});

// ─── ApiErrorResponse integration ────────────────────────────────────────────

describe('parseApiError — ApiErrorResponse with valid JSON error field', () => {
  it('parses a valid JSON ApiErrorBody from the error field', () => {
    const body: ApiErrorBody = {
      type: ApiErrorType.BadRequest,
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid input',
    };
    const apiErrorResponse = {
      status: 400,
      message: 'Request failed',
      error: JSON.stringify(body),
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.type).toBe(ApiErrorType.BadRequest);
    expect(result.message).toBe('Invalid input');
  });

  it('parses ConstraintViolation from JSON error field', () => {
    const body: ConstraintViolationError = {
      type: ApiErrorType.ConstraintViolation,
      title: 'Constraint Violation',
      status: 409,
      detail: '',
      message: 'Duplicate entry',
      errors: [{ field: 'name', message: 'Already taken' }],
    };
    const apiErrorResponse = {
      status: 409,
      message: 'Conflict',
      error: JSON.stringify(body),
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.type).toBe(ApiErrorType.ConstraintViolation);
    expect(result.fieldErrors).toEqual({ name: 'Already taken' });
  });
});

describe('parseApiError — ApiErrorResponse with invalid JSON error field', () => {
  it('falls back to ApiErrorResponse fields when error is not valid JSON', () => {
    const apiErrorResponse = {
      status: 400,
      message: 'Bad request from server',
      error: 'not-valid-json{{{',
      errorFields: { name: 'Required' },
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.message).toBe('Bad request from server');
    expect(result.fieldErrors).toEqual({ name: 'Required' });
    expect(result.status).toBe(400);
  });

  it('falls back when error field is valid JSON but has unrecognised type', () => {
    const apiErrorResponse = {
      status: 422,
      message: 'Unprocessable',
      error: JSON.stringify({ type: '/errors/unknown-type', detail: 'oops' }),
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.message).toBe('Unprocessable');
    expect(result.status).toBe(422);
  });
});

describe('parseApiError — ApiErrorResponse with absent error field', () => {
  it('uses status, message, and errorFields when error field is absent', () => {
    const apiErrorResponse = {
      status: 409,
      message: 'Conflict occurred',
      errorFields: { code: 'Already in use' },
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.message).toBe('Conflict occurred');
    expect(result.fieldErrors).toEqual({ code: 'Already in use' });
    expect(result.status).toBe(409);
    expect(result.type).toBe(ApiErrorType.Conflict);
  });

  it('uses empty object for fieldErrors when errorFields is absent', () => {
    const apiErrorResponse = {
      status: 404,
      message: 'Not found',
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.fieldErrors).toEqual({});
    expect(result.type).toBe(ApiErrorType.NotFound);
  });

  it('derives Internal type for unknown status codes', () => {
    const apiErrorResponse = {
      status: 503,
      message: 'Service unavailable',
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.type).toBe(ApiErrorType.Internal);
    expect(result.status).toBe(503);
  });

  it('uses FALLBACK when message is empty and error field is absent', () => {
    const apiErrorResponse = {
      status: 500,
      message: '',
    };
    const result = parseApiError(apiErrorResponse);
    expect(result.message).toBe(FALLBACK);
  });
});

// ─── Output shape completeness ────────────────────────────────────────────────

describe('parseApiError — output shape always complete', () => {
  const inputs = [
    null,
    undefined,
    'string',
    42,
    {},
    { message: 'bare message' },
    { status: 400, message: 'ok' },
    { status: 400, message: 'ok', error: JSON.stringify({ type: ApiErrorType.BadRequest, title: 'T', status: 400, detail: 'D' }) },
  ];

  inputs.forEach((input, i) => {
    it(`always returns all five fields for input[${i}]`, () => {
      const result = parseApiError(input);
      expect(typeof result.type).toBe('string');
      expect(typeof result.status).toBe('number');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
      expect(typeof result.fieldErrors).toBe('object');
      expect(result.fieldErrors).not.toBeNull();
      expect(typeof result.raw).toBe('object');
      expect(result.raw).not.toBeNull();
    });
  });
});
