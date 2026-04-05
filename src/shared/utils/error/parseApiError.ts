import type { ApiErrorResponse } from '@/shared/types/common-types';

// ─── Enums (const objects — TypeScript enum syntax is disabled in this project) ──

export const ApiErrorType = {
  BadRequest: '/errors/bad-request',
  NotFound: '/errors/not-found',
  Unauthorized: '/errors/unauthorized',
  Forbidden: '/errors/forbidden',
  Conflict: '/errors/conflict',
  UnprocessableEntity: '/errors/unprocessable-entity',
  Internal: '/errors/internal',
  ConstraintViolation: '/errors/constraint-violation',
  Validation: '/errors/validation',
} as const;

export type ApiErrorType = (typeof ApiErrorType)[keyof typeof ApiErrorType];

export const HttpStatusCode = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  UnprocessableEntity: 422,
  InternalServerError: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];

// ─── Backend Error Body Interfaces ───────────────────────────────────────────

export interface GenericApiError {
  type: ApiErrorType;
  title: string;
  status: number;
  detail: string;
}

export interface ConstraintViolationError extends GenericApiError {
  type: typeof ApiErrorType.ConstraintViolation;
  message: string;
  errors: Array<{ field: string; message: string }>;
}

export interface ValidationError extends GenericApiError {
  type: typeof ApiErrorType.Validation;
  violations: Array<{ propertyPath: string; message: string }>;
}

export type ApiErrorBody = GenericApiError | ConstraintViolationError | ValidationError;

// ─── Output Interface ─────────────────────────────────────────────────────────

export interface ParsedApiError {
  type: ApiErrorType;
  status: number;
  /** Never empty — fallback applied when needed */
  message: string;
  /** Empty object when no field-level errors */
  fieldErrors: Record<string, string>;
  raw: ApiErrorBody;
}

// ─── Internal constant ────────────────────────────────────────────────────────

const INTERNAL_FALLBACK = 'Something went wrong. Please try again.';

// ─── Public function ──────────────────────────────────────────────────────────

export function parseApiError(error: unknown): ParsedApiError {
  // 1. Null / non-object guard
  if (!error || typeof error !== 'object') {
    return internalFallback();
  }

  const raw = error as Record<string, unknown>;

  // 2. Detect ApiErrorResponse shape (has .message from axiosBaseQuery)
  if ('message' in raw) {
    const apiError = raw as unknown as ApiErrorResponse;
    const body = tryParseBody(apiError.error);

    if (body) {
      return parseBody(body);
    }

    // Fallback: build from ApiErrorResponse fields directly
    return {
      type: deriveTypeFromStatus(Number(apiError.status)),
      status: Number(apiError.status) || HttpStatusCode.InternalServerError,
      message: apiError.message || INTERNAL_FALLBACK,
      fieldErrors: apiError.errorFields ?? {},
      raw: buildSyntheticBody(apiError),
    };
  }

  return internalFallback();
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function tryParseBody(errorField: string | undefined): ApiErrorBody | null {
  if (!errorField) return null;
  try {
    const parsed: unknown = JSON.parse(errorField);
    if (parsed && typeof parsed === 'object' && isKnownType((parsed as Record<string, unknown>).type)) {
      return parsed as ApiErrorBody;
    }
  } catch {
    /* not valid JSON */
  }
  return null;
}

function parseBody(body: ApiErrorBody): ParsedApiError {
  if (body.type === ApiErrorType.Validation) {
    const v = body as ValidationError;
    const fieldErrors = Object.fromEntries(
      (v.violations ?? []).map(({ propertyPath, message }) => [propertyPath, message]),
    );
    return {
      type: ApiErrorType.Validation,
      status: body.status,
      message: body.detail || body.title || INTERNAL_FALLBACK,
      fieldErrors,
      raw: body,
    };
  }

  if (body.type === ApiErrorType.ConstraintViolation) {
    const c = body as ConstraintViolationError;
    const fieldErrors = Object.fromEntries(
      (c.errors ?? []).map(({ field, message }) => [field, message]),
    );
    return {
      type: ApiErrorType.ConstraintViolation,
      status: body.status,
      message: c.message || body.detail || INTERNAL_FALLBACK,
      fieldErrors,
      raw: body,
    };
  }

  // Generic types — mask 500 detail
  const message =
    body.type === ApiErrorType.Internal
      ? INTERNAL_FALLBACK
      : body.detail || body.title || INTERNAL_FALLBACK;

  return {
    type: body.type,
    status: body.status,
    message,
    fieldErrors: {},
    raw: body,
  };
}

function internalFallback(): ParsedApiError {
  const raw: GenericApiError = {
    type: ApiErrorType.Internal,
    title: INTERNAL_FALLBACK,
    status: HttpStatusCode.InternalServerError,
    detail: INTERNAL_FALLBACK,
  };
  return {
    type: ApiErrorType.Internal,
    status: HttpStatusCode.InternalServerError,
    message: INTERNAL_FALLBACK,
    fieldErrors: {},
    raw,
  };
}

function deriveTypeFromStatus(status: number): ApiErrorType {
  switch (status) {
    case HttpStatusCode.BadRequest: return ApiErrorType.BadRequest;
    case HttpStatusCode.Unauthorized: return ApiErrorType.Unauthorized;
    case HttpStatusCode.Forbidden: return ApiErrorType.Forbidden;
    case HttpStatusCode.NotFound: return ApiErrorType.NotFound;
    case HttpStatusCode.Conflict: return ApiErrorType.Conflict;
    case HttpStatusCode.UnprocessableEntity: return ApiErrorType.UnprocessableEntity;
    default: return ApiErrorType.Internal;
  }
}

function buildSyntheticBody(apiError: ApiErrorResponse): GenericApiError {
  const status = Number(apiError.status) || HttpStatusCode.InternalServerError;
  return {
    type: deriveTypeFromStatus(status),
    title: apiError.message || INTERNAL_FALLBACK,
    status,
    detail: apiError.message || INTERNAL_FALLBACK,
  };
}

function isKnownType(type: unknown): type is ApiErrorType {
  return (Object.values(ApiErrorType) as unknown[]).includes(type);
}
