import {
  RequestScreen,
  type RequestContext,
} from "@/shared/types/error-ui";
import { formatUserMessage } from "@/shared/utils/error/applyUiDecision";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { resolveUiDecision } from "@/shared/utils/error/resolveUiDecision";

/**
 * Derives a user-facing section error message from an RTK Query fetch failure.
 * Returns null when the query is not in an error state.
 */
export function deriveSectionErrorMessage(
  isError: boolean,
  queryError: unknown,
  context: RequestContext = { screen: RequestScreen.List, method: "GET" },
): string | null {
  if (!isError) return null;
  const parsed = parseApiError(queryError);
  const decision = resolveUiDecision(parsed, context);
  return formatUserMessage(decision);
}
