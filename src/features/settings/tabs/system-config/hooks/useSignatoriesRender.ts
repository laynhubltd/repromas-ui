import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useMemo } from "react";
import { useGetSignatoriesRenderQuery } from "../api/signatoriesApi";
import type { ApplyToValue, SignatoryRenderItem } from "../types/signatories";

/**
 * Fetches resolved signatories for a specific document type from
 * GET /api/signatories/{documentType}/render.
 *
 * Returns only active signatories for that document type, sorted by order.
 * Intended for use by document generators (admission letters, transcripts, etc.).
 *
 * @param documentType - One of the ApplyToValue constants e.g. "ADMISSION_LETTER"
 * @param skip - Set to true to defer fetching (e.g. when the document is not yet open)
 */
export function useSignatoriesRender(
  documentType: ApplyToValue,
  skip = false,
) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSignatoriesRenderQuery(documentType, { skip });

  const signatories: SignatoryRenderItem[] = data ?? [];

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  return {
    state: {
      signatories,
      isLoading: isLoading || isFetching,
      sectionError,
    },
    actions: { refetch },
    flags: {
      hasSignatories: signatories.length > 0,
      isEmpty: !isLoading && !isFetching && signatories.length === 0,
    },
  };
}
