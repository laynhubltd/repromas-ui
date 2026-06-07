import { appPaths } from "@/app/routing/app-path";
import {
  RequestScreen,
  UiAudience,
  UiScope,
  UiSeverity,
  UiSurface,
  type HttpMethod,
  type RequestContext,
  type UiDecision,
} from "@/shared/types/error-ui";
import { FAILED_CONNECTION_STATUS } from "@/shared/utils/constants";
import {
  HttpStatusCode,
  type ParsedApiError,
} from "@/shared/utils/error/parseApiError";

/**
 * Resolves a `ParsedApiError` into a context-aware `UiDecision`.
 *
 * The decision tells consumers what to render (surface), where (scope), and
 * what affordances to offer (retry, disable form, clear auth, redirect).
 *
 * Always returns a fully-populated decision — callers never have to apply
 * fallbacks. End-user-facing copy is non-technical and pairs a "what happened"
 * `message` with a concrete "what to do" `actionHint`.
 *
 * The mapping mirrors the table documented in
 * `doc/global-error-handling-guide.md`.
 */
const MUTATION_METHODS = new Set<HttpMethod>(["POST", "PATCH", "PUT", "DELETE"]);

function shouldShowMutationPopup(context: RequestContext): boolean {
  if (context.method === undefined || !MUTATION_METHODS.has(context.method)) {
    return false;
  }
  return (
    context.screen === RequestScreen.Modal ||
    context.screen === RequestScreen.Form ||
    context.screen === RequestScreen.Action
  );
}

export function resolveUiDecision(
  parsed: ParsedApiError,
  context: RequestContext = { screen: RequestScreen.Form },
): UiDecision {
  return finalizeDecision(resolveUiDecisionInner(parsed, context), context);
}

function resolveUiDecisionInner(
  parsed: ParsedApiError,
  context: RequestContext,
): UiDecision {
  const base = buildBaseDecision(parsed);

  // Network / no-response: backend never answered.
  if (
    parsed.status === FAILED_CONNECTION_STATUS ||
    parsed.status === 0 ||
    Number.isNaN(parsed.status)
  ) {
    return {
      ...base,
      surface: UiSurface.Toast,
      scope: UiScope.Page,
      severity: UiSeverity.Error,
      message: "We couldn't reach the server.",
      actionHint:
        "Please check your internet connection and try again in a moment.",
      allowRetry: true,
      logToConsole: true,
    };
  }

  if (parsed.status === HttpStatusCode.Unauthorized) {
    return {
      ...base,
      surface: UiSurface.Redirect,
      scope: UiScope.App,
      severity: UiSeverity.Blocking,
      message: "Your session has expired.",
      actionHint: "Please sign in again to continue where you left off.",
      clearAuth: true,
      redirectTo: appPaths.login,
      disableForm: true,
    };
  }

  if (parsed.status === HttpStatusCode.Forbidden) {
    return {
      ...base,
      surface: UiSurface.FullPage,
      scope: UiScope.App,
      severity: UiSeverity.Blocking,
      message: parsed.message,
      actionHint:
        "If you believe this is a mistake, please contact your administrator.",
      disableForm: true,
    };
  }

  if (parsed.status === HttpStatusCode.NotFound) {
    return resolveNotFound(base, parsed, context);
  }

  if (parsed.status === HttpStatusCode.Conflict) {
    const hasFields = hasFieldErrors(parsed);
    return {
      ...base,
      surface: hasFields ? UiSurface.Inline : UiSurface.Banner,
      scope: hasFields ? UiScope.Field : UiScope.Form,
      severity: UiSeverity.Warning,
      message: parsed.message,
      actionHint: hasFields
        ? "Update the highlighted field and try again."
        : "Change the conflicting information and try again.",
      allowRetry: true,
    };
  }

  if (parsed.status === HttpStatusCode.UnprocessableEntity) {
    if (parsed.isSetupError) {
      return {
        ...base,
        surface: UiSurface.Banner,
        scope: UiScope.Page,
        severity: UiSeverity.Error,
        audience: UiAudience.Admin,
        message: parsed.message,
        actionHint:
          "An administrator needs to complete this configuration before you can continue.",
        disableForm: true,
      };
    }
    return {
      ...base,
      surface: UiSurface.Banner,
      scope: UiScope.Form,
      severity: UiSeverity.Warning,
      message: parsed.message,
      actionHint: "Please choose a different option and try again.",
    };
  }

  if (parsed.status === HttpStatusCode.BadRequest) {
    if (parsed.isPayloadShapeError) {
      return {
        ...base,
        surface: UiSurface.Toast,
        scope: UiScope.Page,
        severity: UiSeverity.Error,
        audience: UiAudience.Developer,
        message: "Something went wrong while processing your request.",
        actionHint:
          "Please refresh the page and try again. If the problem continues, contact support.",
        disableForm: true,
        logToConsole: true,
        logToTracker: true,
      };
    }
    const hasFields = hasFieldErrors(parsed);
    return {
      ...base,
      surface: hasFields ? UiSurface.Inline : UiSurface.Banner,
      scope: hasFields ? UiScope.Field : UiScope.Form,
      severity: UiSeverity.Error,
      message: hasFields
        ? "Please correct the highlighted fields."
        : parsed.message,
      actionHint: hasFields
        ? "Review the fields marked below and try again."
        : "Adjust your input and try again.",
      allowRetry: true,
    };
  }

  if (parsed.status >= 500) {
    return {
      ...base,
      surface: UiSurface.Toast,
      scope: UiScope.Page,
      severity: UiSeverity.Error,
      message: "Something went wrong on our end.",
      actionHint:
        "Please try again in a moment. If the problem persists, contact support.",
      allowRetry: true,
      logToConsole: true,
      logToTracker: true,
    };
  }

  return {
    ...base,
    surface: UiSurface.Toast,
    scope: UiScope.Page,
    severity: UiSeverity.Error,
    actionHint: "Please try again.",
    allowRetry: true,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildBaseDecision(parsed: ParsedApiError): UiDecision {
  return {
    surface: UiSurface.Toast,
    scope: UiScope.Page,
    severity: UiSeverity.Error,
    audience: UiAudience.EndUser,
    message: parsed.message,
    actionHint: "",
    fieldErrors: parsed.fieldErrors,
    allowRetry: false,
    disableForm: false,
    clearAuth: false,
    redirectTo: null,
    logToConsole: false,
    logToTracker: false,
    showPopup: false,
    parsed,
  };
}

function finalizeDecision(
  decision: UiDecision,
  context: RequestContext,
): UiDecision {
  const showPopup =
    shouldShowMutationPopup(context) &&
    decision.surface !== UiSurface.Redirect &&
    decision.surface !== UiSurface.FullPage;

  return { ...decision, showPopup };
}

function hasFieldErrors(parsed: ParsedApiError): boolean {
  return Object.keys(parsed.fieldErrors).length > 0;
}

function resolveNotFound(
  base: UiDecision,
  parsed: ParsedApiError,
  context: RequestContext,
): UiDecision {
  if (
    context.screen === RequestScreen.List ||
    context.screen === RequestScreen.Detail
  ) {
    return {
      ...base,
      surface: UiSurface.EmptyState,
      scope: UiScope.Page,
      severity: UiSeverity.Info,
      message: parsed.message,
      actionHint:
        "The item you're looking for is no longer available. Try refreshing or going back.",
    };
  }
  if (
    context.screen === RequestScreen.Form ||
    context.screen === RequestScreen.Modal
  ) {
    return {
      ...base,
      surface: UiSurface.Banner,
      scope: UiScope.Form,
      severity: UiSeverity.Error,
      message: parsed.message,
      actionHint:
        "This item is no longer available. Close this form and refresh the list.",
      disableForm: true,
    };
  }
  return {
    ...base,
    surface: UiSurface.Toast,
    scope: UiScope.Page,
    severity: UiSeverity.Error,
    message: parsed.message,
    actionHint: "Refresh the list to see the latest items.",
  };
}
