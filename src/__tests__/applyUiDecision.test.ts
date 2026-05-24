/**
 * applyUiDecision — Unit Tests
 *
 * Validates the deterministic side-effect ordering of the global UI dispatcher
 * (log -> clearAuth -> redirect -> disableForm -> field errors -> surface).
 */

import { describe, expect, it, vi } from "vitest";
import { appPaths } from "@/app/routing/app-path";
import {
  UiAudience,
  UiScope,
  UiSeverity,
  UiSurface,
  type UiDecision,
} from "@/shared/types/error-ui";
import {
  applyUiDecision,
  formatUserMessage,
  type UiDecisionHandlers,
} from "@/shared/utils/error/applyUiDecision";
import {
  ApiErrorType,
  HttpStatusCode,
  type ParsedApiError,
} from "@/shared/utils/error/parseApiError";

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

function buildDecision(overrides: Partial<UiDecision> = {}): UiDecision {
  const parsed = buildParsed();
  return {
    surface: UiSurface.Toast,
    scope: UiScope.Page,
    severity: UiSeverity.Error,
    audience: UiAudience.EndUser,
    message: parsed.message,
    actionHint: "Try again later.",
    fieldErrors: parsed.fieldErrors,
    allowRetry: false,
    disableForm: false,
    clearAuth: false,
    redirectTo: null,
    logToConsole: false,
    logToTracker: false,
    showPopup: false,
    parsed,
    ...overrides,
  };
}

describe("applyUiDecision — redirect", () => {
  it("invokes navigate handler with redirectTo and skips other surfaces", () => {
    const navigate = vi.fn();
    const setFormError = vi.fn();
    const notify = vi.fn();

    applyUiDecision(
      buildDecision({
        surface: UiSurface.Redirect,
        redirectTo: appPaths.login,
        clearAuth: true,
        disableForm: true,
      }),
      { navigate, setFormError, notify, clearAuth: vi.fn() },
    );

    expect(navigate).toHaveBeenCalledWith(appPaths.login);
    expect(setFormError).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("calls clearAuth before navigation", () => {
    const order: string[] = [];
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Redirect,
        redirectTo: appPaths.login,
        clearAuth: true,
      }),
      {
        clearAuth: () => order.push("clearAuth"),
        navigate: () => order.push("navigate"),
      },
    );
    expect(order).toEqual(["clearAuth", "navigate"]);
  });
});

describe("applyUiDecision — inline", () => {
  it("applies field errors via the form when provided", () => {
    const setFields = vi.fn();
    const handlers: UiDecisionHandlers = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form: { setFields } as any,
      setFormError: vi.fn(),
    };
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Inline,
        scope: UiScope.Field,
        fieldErrors: { code: "Already in use" },
      }),
      handlers,
    );
    expect(setFields).toHaveBeenCalledWith([
      { name: "code", errors: ["Already in use"] },
    ]);
    expect(handlers.setFormError).not.toHaveBeenCalled();
  });

  it("falls back to setFormError when no form is available", () => {
    const setFormError = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Inline,
        message: "Something failed",
        actionHint: "Try again.",
      }),
      { setFormError },
    );
    expect(setFormError).toHaveBeenCalledWith("Something failed Try again.");
  });
});

describe("applyUiDecision — banner", () => {
  it("renders the full user message into setFormError", () => {
    const setFormError = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Banner,
        scope: UiScope.Form,
        message: "Item is no longer available.",
        actionHint: "Close this form.",
      }),
      { setFormError },
    );
    expect(setFormError).toHaveBeenCalledWith(
      "Item is no longer available. Close this form.",
    );
  });

  it("disables the form when disableForm is true", () => {
    const setFormDisabled = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Banner,
        disableForm: true,
        message: "Gone",
        actionHint: "Refresh.",
      }),
      { setFormError: vi.fn(), setFormDisabled },
    );
    expect(setFormDisabled).toHaveBeenCalledWith(true);
  });
});

describe("applyUiDecision — empty state", () => {
  it("routes to showEmptyState when provided", () => {
    const showEmptyState = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.EmptyState,
        message: "Not found.",
        actionHint: "Refresh.",
      }),
      { showEmptyState },
    );
    expect(showEmptyState).toHaveBeenCalledWith("Not found. Refresh.");
  });

  it("falls back to setSectionError when no empty-state handler exists", () => {
    const setSectionError = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.EmptyState,
        message: "Not found.",
        actionHint: "Refresh.",
      }),
      { setSectionError },
    );
    expect(setSectionError).toHaveBeenCalledWith("Not found. Refresh.");
  });
});

describe("applyUiDecision — toast", () => {
  it("uses the provided notify handler with the full decision", () => {
    const notify = vi.fn();
    const decision = buildDecision({
      surface: UiSurface.Toast,
      message: "Server error.",
      actionHint: "Try again.",
    });
    applyUiDecision(decision, { notify });
    expect(notify).toHaveBeenCalledWith(decision);
  });
});

describe("applyUiDecision — logging", () => {
  it("invokes log when logToConsole or logToTracker is true", () => {
    const log = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Toast,
        logToConsole: true,
      }),
      { log },
    );
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("does not invoke log when both logging flags are false", () => {
    const log = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Toast,
      }),
      { log },
    );
    expect(log).not.toHaveBeenCalled();
  });
});

describe("applyUiDecision — showPopup", () => {
  it("shows toast and inline field errors without setFormError when showPopup is true", () => {
    const notify = vi.fn();
    const setFields = vi.fn();
    const setFormError = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Banner,
        scope: UiScope.Form,
        showPopup: true,
        fieldErrors: { code: "Already in use" },
        message: "Conflict",
        actionHint: "Try another code.",
      }),
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form: { setFields } as any,
        setFormError,
        notify,
      },
    );
    expect(notify).toHaveBeenCalledTimes(1);
    expect(setFields).toHaveBeenCalledWith([
      { name: "code", errors: ["Already in use"] },
    ]);
    expect(setFormError).not.toHaveBeenCalled();
  });

  it("shows toast only when showPopup is true and there are no field errors", () => {
    const notify = vi.fn();
    const setFormError = vi.fn();
    applyUiDecision(
      buildDecision({
        surface: UiSurface.Banner,
        showPopup: true,
        message: "Item is gone.",
        actionHint: "Refresh the list.",
      }),
      { setFormError, notify },
    );
    expect(notify).toHaveBeenCalledTimes(1);
    expect(setFormError).not.toHaveBeenCalled();
  });
});

describe("formatUserMessage", () => {
  it("returns only message when there is no action hint", () => {
    expect(
      formatUserMessage(
        buildDecision({ message: "Just the message.", actionHint: "" }),
      ),
    ).toBe("Just the message.");
  });

  it("joins message and action hint with a single space", () => {
    expect(
      formatUserMessage(
        buildDecision({
          message: "Item missing.",
          actionHint: "Refresh.",
        }),
      ),
    ).toBe("Item missing. Refresh.");
  });
});
