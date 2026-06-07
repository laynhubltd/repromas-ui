import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import {
  UiSurface,
  type UiDecision,
} from "@/shared/types/error-ui";
import type { FormInstance } from "antd";
import { notification } from "antd";

/**
 * Render handlers consumed by `applyUiDecision`.
 *
 * Every handler is optional — the dispatcher gracefully no-ops when the
 * caller doesn't need a given surface. Defaults are provided where it's
 * safe to do so (toasts via antd `notification`, redirects via
 * `window.location.assign`). Consumers can override any handler to plug
 * in their own UI (e.g. router navigation, page-level error containers).
 */
export type UiDecisionHandlers = {
  /** Antd form instance — required for inline field errors. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: FormInstance<any>;
  /** Set form-level banner message (renders inside `ErrorAlert variant="form"`). */
  setFormError?: (message: string | null) => void;
  /** Set section / page error state (renders inside `ErrorAlert variant="section"`). */
  setSectionError?: (message: string | null) => void;
  /** Render empty-state copy when the resource is gone (list/detail 404). */
  showEmptyState?: (message: string) => void;
  /** Render a blocking full-page error (e.g. tenant suspended / 403). */
  showFullPage?: (message: string) => void;
  /** Disable the form's submit button while the error stands. */
  setFormDisabled?: (disabled: boolean) => void;
  /** Clear authentication state (e.g. on 401). */
  clearAuth?: () => void;
  /** Navigate to the supplied path. Defaults to `window.location.assign`. */
  navigate?: (path: string) => void;
  /** Show a transient toast. Defaults to antd `notification.error`. */
  notify?: (decision: UiDecision) => void;
  /** Optional logger hook (dev/ops). Receives the full decision. */
  log?: (decision: UiDecision) => void;
};

/**
 * Renders a `UiDecision` using the provided handlers.
 *
 * The dispatcher applies side-effects in a deterministic order so consumers
 * never have to think about ordering:
 *
 *   1. Log (when the decision requests it).
 *   2. Clear auth (when applicable — e.g. 401).
 *   3. Redirect — short-circuits remaining UI work.
 *   4. Disable the form (per `disableForm`).
 *   5. Apply field errors to the form (when present).
 *   6. Render the chosen surface (toast / banner / inline / empty / fullPage).
 *
 * All user-facing copy comes from the decision; this module never invents
 * strings. The handler signature for `notify` receives the full decision so
 * consumers can render `message` and `actionHint` together.
 */
export function applyUiDecision(
  decision: UiDecision,
  handlers: UiDecisionHandlers = {},
): void {
  const log = handlers.log ?? defaultLog;
  if (decision.logToConsole || decision.logToTracker) {
    log(decision);
  }

  if (decision.clearAuth) {
    handlers.clearAuth?.();
  }

  if (decision.redirectTo) {
    const navigate = handlers.navigate ?? defaultNavigate;
    navigate(decision.redirectTo);
    return;
  }

  if (decision.disableForm) {
    handlers.setFormDisabled?.(true);
  }

  const hasFieldErrors = Object.keys(decision.fieldErrors).length > 0;

  if (decision.showPopup) {
    const notify = handlers.notify ?? defaultNotify;
    notify(decision);
    if (hasFieldErrors && handlers.form) {
      applyFormErrors(
        {
          type: decision.parsed.type,
          status: decision.parsed.status,
          message: decision.message,
          fieldErrors: decision.fieldErrors,
          isSetupError: decision.parsed.isSetupError,
          isPayloadShapeError: decision.parsed.isPayloadShapeError,
          raw: decision.parsed.raw,
        },
        handlers.form,
        () => undefined,
      );
    }
    return;
  }

  switch (decision.surface) {
    case UiSurface.Inline: {
      if (handlers.form) {
        applyFormErrors(
          {
            type: decision.parsed.type,
            status: decision.parsed.status,
            message: decision.message,
            fieldErrors: decision.fieldErrors,
            isSetupError: decision.parsed.isSetupError,
            isPayloadShapeError: decision.parsed.isPayloadShapeError,
            raw: decision.parsed.raw,
          },
          handlers.form,
          (message) => handlers.setFormError?.(message),
        );
      } else if (handlers.setFormError) {
        handlers.setFormError(formatUserMessage(decision));
      } else {
        defaultNotify(decision);
      }
      break;
    }

    case UiSurface.Banner: {
      if (handlers.setFormError) {
        handlers.setFormError(formatUserMessage(decision));
      } else if (handlers.setSectionError) {
        handlers.setSectionError(formatUserMessage(decision));
      } else {
        defaultNotify(decision);
      }
      // Apply field-level highlights if the backend still pinpointed fields.
      if (hasFieldErrors && handlers.form) {
        applyFormErrors(
          {
            type: decision.parsed.type,
            status: decision.parsed.status,
            message: decision.message,
            fieldErrors: decision.fieldErrors,
            isSetupError: decision.parsed.isSetupError,
            isPayloadShapeError: decision.parsed.isPayloadShapeError,
            raw: decision.parsed.raw,
          },
          handlers.form,
          () => undefined,
        );
      }
      break;
    }

    case UiSurface.Toast: {
      const notify = handlers.notify ?? defaultNotify;
      notify(decision);
      break;
    }

    case UiSurface.Modal: {
      const notify = handlers.notify ?? defaultNotify;
      notify(decision);
      break;
    }

    case UiSurface.EmptyState: {
      if (handlers.showEmptyState) {
        handlers.showEmptyState(formatUserMessage(decision));
      } else if (handlers.setSectionError) {
        handlers.setSectionError(formatUserMessage(decision));
      } else {
        defaultNotify(decision);
      }
      break;
    }

    case UiSurface.FullPage: {
      if (handlers.showFullPage) {
        handlers.showFullPage(formatUserMessage(decision));
      } else {
        defaultNotify(decision);
      }
      break;
    }

    case UiSurface.Redirect: {
      const navigate = handlers.navigate ?? defaultNavigate;
      navigate(decision.redirectTo ?? "/");
      break;
    }

    default: {
      defaultNotify(decision);
      break;
    }
  }
}

// ─── Helpers exposed for consumers ───────────────────────────────────────────

/**
 * Combines the decision's "what happened" message with its "what to do next"
 * hint into a single user-facing string. Used when rendering into a single-line
 * container (banner / section alert / toast).
 */
export function formatUserMessage(decision: UiDecision): string {
  if (!decision.actionHint) return decision.message;
  return `${decision.message} ${decision.actionHint}`.trim();
}

// ─── Internal defaults ───────────────────────────────────────────────────────

function defaultNavigate(path: string): void {
  if (typeof window === "undefined" || !window.location) return;
  // Idempotent: avoid double-navigation when the transport layer has already
  // redirected (e.g. axiosBaseQuery's 401 refresh-failure path) or when the
  // user is already on the target route.
  if (window.location.pathname === path) return;
  window.location.assign(path);
}

function defaultNotify(decision: UiDecision): void {
  notification.error({
    message: decision.message,
    description: decision.actionHint || undefined,
    duration: decision.severity === "blocking" ? 0 : 6,
  });
}

function defaultLog(decision: UiDecision): void {
  if (typeof console === "undefined") return;
  if (decision.logToTracker) {
    console.error("[api-error]", {
      status: decision.parsed.status,
      type: decision.parsed.type,
      message: decision.parsed.message,
      isSetupError: decision.parsed.isSetupError,
      isPayloadShapeError: decision.parsed.isPayloadShapeError,
    });
  } else if (decision.logToConsole) {
    console.warn("[api-error]", {
      status: decision.parsed.status,
      type: decision.parsed.type,
      message: decision.parsed.message,
    });
  }
}
