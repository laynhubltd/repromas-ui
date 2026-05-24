/**
 * resolveUiDecision — Unit Tests
 *
 * Validates the decision table documented in
 * `doc/global-error-handling-guide.md`: maps `ParsedApiError + RequestContext`
 * to a `UiDecision` with the correct surface, scope, severity, audience, and
 * recovery affordances.
 */

import { describe, expect, it } from "vitest";
import { appPaths } from "@/app/routing/app-path";
import {
  RequestScreen,
  UiAudience,
  UiScope,
  UiSeverity,
  UiSurface,
} from "@/shared/types/error-ui";
import {
  ApiErrorType,
  HttpStatusCode,
  type ParsedApiError,
} from "@/shared/utils/error/parseApiError";
import { resolveUiDecision } from "@/shared/utils/error/resolveUiDecision";
import { FAILED_CONNECTION_STATUS } from "@/shared/utils/constants";

function buildParsed(overrides: Partial<ParsedApiError> = {}): ParsedApiError {
  return {
    type: ApiErrorType.Internal,
    status: HttpStatusCode.InternalServerError,
    message: "Something went wrong.",
    fieldErrors: {},
    isSetupError: false,
    isPayloadShapeError: false,
    raw: {
      type: ApiErrorType.Internal,
      title: "Internal",
      status: HttpStatusCode.InternalServerError,
      detail: "internal",
    },
    ...overrides,
  };
}

describe("resolveUiDecision — 401 unauthorized", () => {
  it("emits a redirect with clearAuth + disableForm + login route", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Unauthorized,
        status: HttpStatusCode.Unauthorized,
        message: "Token expired",
      }),
      { screen: RequestScreen.Form },
    );

    expect(decision.surface).toBe(UiSurface.Redirect);
    expect(decision.scope).toBe(UiScope.App);
    expect(decision.severity).toBe(UiSeverity.Blocking);
    expect(decision.clearAuth).toBe(true);
    expect(decision.disableForm).toBe(true);
    expect(decision.redirectTo).toBe(appPaths.login);
    expect(decision.message).toMatch(/session has expired/i);
    expect(decision.actionHint).not.toBe("");
  });
});

describe("resolveUiDecision — 403 forbidden", () => {
  it("emits a blocking full-page error with admin guidance", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Forbidden,
        status: HttpStatusCode.Forbidden,
        message: "Tenant suspended.",
      }),
      { screen: RequestScreen.Form },
    );

    expect(decision.surface).toBe(UiSurface.FullPage);
    expect(decision.severity).toBe(UiSeverity.Blocking);
    expect(decision.disableForm).toBe(true);
    expect(decision.message).toBe("Tenant suspended.");
    expect(decision.actionHint).toMatch(/administrator/i);
  });
});

describe("resolveUiDecision — 404 not found", () => {
  it("uses emptyState on list", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Faculty 99 not found",
      }),
      { screen: RequestScreen.List, method: "GET" },
    );
    expect(decision.surface).toBe(UiSurface.EmptyState);
    expect(decision.severity).toBe(UiSeverity.Info);
  });

  it("uses emptyState on detail", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Faculty 99 not found",
      }),
      { screen: RequestScreen.Detail, method: "GET" },
    );
    expect(decision.surface).toBe(UiSurface.EmptyState);
  });

  it("uses banner + disableForm on form/modal", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Faculty 99 not found",
      }),
      { screen: RequestScreen.Modal, method: "PATCH" },
    );
    expect(decision.surface).toBe(UiSurface.Banner);
    expect(decision.scope).toBe(UiScope.Form);
    expect(decision.disableForm).toBe(true);
  });

  it("uses toast on action", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Faculty 99 not found",
      }),
      { screen: RequestScreen.Action, method: "DELETE" },
    );
    expect(decision.surface).toBe(UiSurface.Toast);
  });
});

describe("resolveUiDecision — 409 conflict", () => {
  it("uses banner when no field errors", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Conflict,
        status: HttpStatusCode.Conflict,
        message: "Code already taken",
      }),
      { screen: RequestScreen.Modal, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Banner);
    expect(decision.scope).toBe(UiScope.Form);
    expect(decision.severity).toBe(UiSeverity.Warning);
    expect(decision.allowRetry).toBe(true);
  });

  it("uses inline + field scope when field errors exist", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.ConstraintViolation,
        status: HttpStatusCode.Conflict,
        message: "Conflict",
        fieldErrors: { code: "Already taken" },
      }),
      { screen: RequestScreen.Modal, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Inline);
    expect(decision.scope).toBe(UiScope.Field);
  });
});

describe("resolveUiDecision — 422 unprocessable entity", () => {
  it("marks setup errors with admin audience and no retry", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.UnprocessableEntity,
        status: HttpStatusCode.UnprocessableEntity,
        message:
          "Scores cannot be graded because no grading system is linked to this course's program. Please contact your administrator.",
        isSetupError: true,
      }),
      { screen: RequestScreen.Form, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Banner);
    expect(decision.scope).toBe(UiScope.Page);
    expect(decision.audience).toBe(UiAudience.Admin);
    expect(decision.allowRetry).toBe(false);
    expect(decision.disableForm).toBe(true);
  });

  it("renders transitions as warning banner with no admin tone", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.UnprocessableEntity,
        status: HttpStatusCode.UnprocessableEntity,
        message: "Cannot transition score sheet from PUBLISHED to DRAFT.",
      }),
      { screen: RequestScreen.Action, method: "PATCH" },
    );
    expect(decision.surface).toBe(UiSurface.Banner);
    expect(decision.scope).toBe(UiScope.Form);
    expect(decision.audience).toBe(UiAudience.EndUser);
    expect(decision.severity).toBe(UiSeverity.Warning);
  });
});

describe("resolveUiDecision — 400 bad request", () => {
  it("treats payload-shape errors as developer-audience with logging", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.BadRequest,
        status: HttpStatusCode.BadRequest,
        message: "Invalid payload.",
        isPayloadShapeError: true,
      }),
      { screen: RequestScreen.Form, method: "POST" },
    );
    expect(decision.audience).toBe(UiAudience.Developer);
    expect(decision.disableForm).toBe(true);
    expect(decision.logToConsole).toBe(true);
    expect(decision.logToTracker).toBe(true);
    // never leak the technical detail
    expect(decision.message).not.toMatch(/invalid request payload/i);
  });

  it("uses inline + field scope when validation errors are present", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Validation,
        status: HttpStatusCode.BadRequest,
        message: "Validation failed",
        fieldErrors: { name: "Required" },
      }),
      { screen: RequestScreen.Modal, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Inline);
    expect(decision.scope).toBe(UiScope.Field);
    expect(decision.allowRetry).toBe(true);
  });
});

describe("resolveUiDecision — 5xx server error", () => {
  it("uses generic toast with retry + logging", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Internal,
        status: HttpStatusCode.InternalServerError,
      }),
      { screen: RequestScreen.Action, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Toast);
    expect(decision.allowRetry).toBe(true);
    expect(decision.logToConsole).toBe(true);
    expect(decision.logToTracker).toBe(true);
    expect(decision.message).toMatch(/on our end/i);
  });

  it("treats network failures (no response) as connectivity issue", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Internal,
        status: FAILED_CONNECTION_STATUS,
      }),
      { screen: RequestScreen.Form, method: "POST" },
    );
    expect(decision.surface).toBe(UiSurface.Toast);
    expect(decision.allowRetry).toBe(true);
    expect(decision.message).toMatch(/server/i);
    expect(decision.actionHint).toMatch(/connection/i);
  });
});

describe("resolveUiDecision — showPopup", () => {
  it("sets showPopup for modal POST mutations", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Conflict,
        status: HttpStatusCode.Conflict,
        message: "Code already taken",
      }),
      { screen: RequestScreen.Modal, method: "POST" },
    );
    expect(decision.showPopup).toBe(true);
  });

  it("sets showPopup for action DELETE", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Gone",
      }),
      { screen: RequestScreen.Action, method: "DELETE" },
    );
    expect(decision.showPopup).toBe(true);
  });

  it("does not set showPopup for list GET", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.NotFound,
        status: HttpStatusCode.NotFound,
        message: "Not found",
      }),
      { screen: RequestScreen.List, method: "GET" },
    );
    expect(decision.showPopup).toBe(false);
  });

  it("does not set showPopup for 401 redirect", () => {
    const decision = resolveUiDecision(
      buildParsed({
        type: ApiErrorType.Unauthorized,
        status: HttpStatusCode.Unauthorized,
        message: "Expired",
      }),
      { screen: RequestScreen.Modal, method: "POST" },
    );
    expect(decision.showPopup).toBe(false);
  });
});

describe("resolveUiDecision — always populates user-facing copy", () => {
  it("returns non-empty message and includes actionHint for every status", () => {
    const statuses = [400, 401, 403, 404, 409, 422, 500, 503];
    for (const status of statuses) {
      const decision = resolveUiDecision(
        buildParsed({ status, message: `error ${status}` }),
        { screen: RequestScreen.Form },
      );
      expect(decision.message.length).toBeGreaterThan(0);
      // For every status except 4xx field-errors there must be guidance.
      expect(typeof decision.actionHint).toBe("string");
    }
  });
});
