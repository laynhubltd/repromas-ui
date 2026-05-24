/**
 * Shared UI error decision contract.
 *
 * This module defines the framework-agnostic types used by the global error
 * pipeline:
 *
 *   transport error -> parseApiError -> resolveUiDecision -> applyUiDecision
 *
 * A `UiDecision` tells the UI WHAT to render (surface), WHERE it applies
 * (scope), WHO the copy is for (audience), and which recovery affordances
 * to offer (allowRetry, disableForm, clearAuth, redirectTo).
 *
 * Hooks build a `RequestContext` describing the user's screen/action so the
 * same backend error renders correctly across list/detail/form/action.
 */

import type { ParsedApiError } from "@/shared/utils/error/parseApiError";

// ─── Enumerations (const objects — `enum` is disabled by erasableSyntaxOnly) ──

export const UiSurface = {
  Redirect: "redirect",
  FullPage: "fullPage",
  Modal: "modal",
  Banner: "banner",
  Inline: "inline",
  EmptyState: "emptyState",
  Toast: "toast",
} as const;
export type UiSurface = (typeof UiSurface)[keyof typeof UiSurface];

export const UiScope = {
  App: "app",
  Page: "page",
  Form: "form",
  Field: "field",
} as const;
export type UiScope = (typeof UiScope)[keyof typeof UiScope];

export const UiSeverity = {
  Blocking: "blocking",
  Error: "error",
  Warning: "warning",
  Info: "info",
} as const;
export type UiSeverity = (typeof UiSeverity)[keyof typeof UiSeverity];

export const UiAudience = {
  EndUser: "endUser",
  Admin: "admin",
  Developer: "developer",
} as const;
export type UiAudience = (typeof UiAudience)[keyof typeof UiAudience];

export const RequestScreen = {
  List: "list",
  Detail: "detail",
  Form: "form",
  Modal: "modal",
  Action: "action",
} as const;
export type RequestScreen = (typeof RequestScreen)[keyof typeof RequestScreen];

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ─── Request context ──────────────────────────────────────────────────────────

/**
 * Context describing where an API call originated. This lets the decision
 * engine pick the right surface (e.g. 404 -> empty state on a list vs banner
 * on a form vs toast on an action).
 */
export type RequestContext = {
  screen: RequestScreen;
  method?: HttpMethod;
};

// ─── UI Decision ──────────────────────────────────────────────────────────────

/**
 * Output of `resolveUiDecision`. Every field is required so consumers never
 * have to apply their own fallbacks. `message` and `actionHint` are written
 * for end users: what happened and what to do next.
 */
export type UiDecision = {
  surface: UiSurface;
  scope: UiScope;
  severity: UiSeverity;
  audience: UiAudience;
  /** User-facing description of what happened — never empty. */
  message: string;
  /**
   * User-facing suggestion of what to do next. Empty string when no specific
   * guidance applies (consumers may simply not render it).
   */
  actionHint: string;
  /** Empty object when no field-level errors are present. */
  fieldErrors: Record<string, string>;
  /** True when the user can safely retry the same action. */
  allowRetry: boolean;
  /** True when forms should disable their submit while this error stands. */
  disableForm: boolean;
  /** True when the session should be cleared (e.g. on 401). */
  clearAuth: boolean;
  /** Route to navigate to (e.g. `/auth/login`), or null. */
  redirectTo: string | null;
  /** Hint that this error should be logged to the dev console. */
  logToConsole: boolean;
  /** Hint that this error should be sent to a monitoring tracker. */
  logToTracker: boolean;
  /**
   * When true, `applyUiDecision` shows a toast popup as primary feedback.
   * Set for modal/form/action mutations (POST/PATCH/PUT/DELETE).
   */
  showPopup: boolean;
  /** The parsed error this decision came from — useful for advanced consumers. */
  parsed: ParsedApiError;
};
