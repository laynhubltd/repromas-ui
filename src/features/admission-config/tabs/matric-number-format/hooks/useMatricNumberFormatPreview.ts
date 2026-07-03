import { parseApiError } from "@/shared/utils/error/parseApiError";
import type { Dispatch } from "react";
import { useCallback, useEffect, useRef } from "react";
import { usePreviewMatricNumberFormatMutation } from "../api/matricNumberFormatApi";
import {
  MatricNumberFormatBuilderActionType,
  type MatricNumberFormatBuilderState,
} from "../state/matricNumberFormatBuilderState";
import { serializeTemplateSegments, templateNeedsSession } from "../utils/templateTokenHelpers";

type PreviewDispatch = Dispatch<
  import("../state/matricNumberFormatBuilderState").MatricNumberFormatBuilderAction
>;

export function useMatricNumberFormatPreview(
  builderState: MatricNumberFormatBuilderState,
  dispatch: PreviewDispatch,
  enabled: boolean,
) {
  const [previewFormat] = usePreviewMatricNumberFormatMutation();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const template = serializeTemplateSegments(builderState.segments);

  const runPreview = useCallback(async () => {
    if (!enabled || !template.trim() || !builderState.previewProgramId) {
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetPreviewResult,
        result: null,
      });
      return;
    }

    if (templateNeedsSession(template) && !builderState.previewSessionId) {
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetPreviewError,
        error: "Select an academic session to preview session tokens.",
      });
      return;
    }

    dispatch({
      type: MatricNumberFormatBuilderActionType.SetPreviewLoading,
      loading: true,
    });

    try {
      const result = await previewFormat({
        template,
        tokenOptions: builderState.tokenOptions,
        counterPartition: builderState.counterPartition,
        sequencePadding: builderState.sequencePadding,
        initialValue: builderState.initialValue,
        programId: builderState.previewProgramId,
        academicSessionId: builderState.previewSessionId ?? null,
        simulatedSequence: builderState.simulatedSequence,
      }).unwrap();
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetPreviewResult,
        result,
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetPreviewError,
        error: parsed.message,
      });
    }
  }, [
    enabled,
    template,
    builderState.previewProgramId,
    builderState.previewSessionId,
    builderState.tokenOptions,
    builderState.counterPartition,
    builderState.sequencePadding,
    builderState.initialValue,
    builderState.simulatedSequence,
    previewFormat,
    dispatch,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      void runPreview();
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [enabled, runPreview]);

  return { template };
}
