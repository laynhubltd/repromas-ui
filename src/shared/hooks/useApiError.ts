import { clearAuth } from "@/features/auth/state/auth-slice";
import {
  RequestScreen,
  type RequestContext,
  type UiDecision,
} from "@/shared/types/error-ui";
import {
  applyUiDecision,
  type UiDecisionHandlers,
} from "@/shared/utils/error/applyUiDecision";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { resolveUiDecision } from "@/shared/utils/error/resolveUiDecision";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

/**
 * Per-call options accepted by `handleApiError`. All fields are optional —
 * defaults match the most common "form inside a modal" case.
 */
export type UseApiErrorOptions = UiDecisionHandlers & {
  context?: RequestContext;
};

/**
 * `useApiError` is the React entry-point for the global error pipeline.
 *
 * It parses any RTK Query / Axios error, resolves a `UiDecision` from the
 * caller-provided context, and dispatches the decision to the UI handlers
 * (forms, banners, toasts, redirects). The hook wires in app-wide defaults
 * (Redux `clearAuth`) so consumers only need to supply UI handlers specific
 * to their screen (e.g. an antd `FormInstance`, a `setFormError` setter).
 *
 * Usage in a form modal hook:
 *
 *   const handleApiError = useApiError();
 *
 *   try {
 *     await createFaculty(values).unwrap();
 *   } catch (err) {
 *     handleApiError(err, {
 *       context: { screen: 'modal', method: 'POST' },
 *       form, // popup toast + inline field errors when present
 *     });
 *   }
 *
 * Usage in a list/section:
 *
 *   const handleApiError = useApiError();
 *   handleApiError(queryError, {
 *     context: { screen: 'list', method: 'GET' },
 *     setSectionError,
 *   });
 */
export function useApiError() {
  const dispatch = useDispatch();

  return useCallback(
    (err: unknown, options: UseApiErrorOptions = {}): UiDecision => {
      const parsed = parseApiError(err);
      const decision = resolveUiDecision(
        parsed,
        options.context ?? { screen: RequestScreen.Form },
      );
      applyUiDecision(decision, {
        ...options,
        clearAuth: options.clearAuth ?? (() => dispatch(clearAuth())),
      });
      return decision;
    },
    [dispatch],
  );
}
