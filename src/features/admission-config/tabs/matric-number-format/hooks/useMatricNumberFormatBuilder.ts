import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetMatricNumberFormatQuery,
  useUpdateMatricNumberFormatMutation,
} from "../api/matricNumberFormatApi";
import {
  MatricNumberFormatBuilderActionType,
  initialMatricNumberFormatBuilderState,
  matricNumberFormatBuilderReducer,
} from "../state/matricNumberFormatBuilderState";
import type {
  MatricFormatActiveSlot,
  MatricNumberFormat,
  MatricNumberFormatPrerequisites,
} from "../types/matric-number-format";
import { canActivateDraft } from "../utils/slotLifecycleEligibility";
import {
  MATRIC_NUMBER_FORMAT_MAX_LENGTH,
  MATRIC_NUMBER_FORMAT_UI_COPY,
} from "@/shared/constants/matricNumberFormatOptions";
import {
  canActivateMatricFormat,
  findUnknownTokens,
  getActivationBlockers,
  isPrerequisitesReadyForTemplate,
  parseTemplateSegments,
  serializeTemplateSegments,
  suggestCounterPartition,
  templateNeedsSession,
} from "../utils/templateTokenHelpers";

import { useMatricNumberFormatPreview } from "./useMatricNumberFormatPreview";

export function useMatricNumberFormatBuilder(
  formatId: number | null,
  readOnly: boolean,
  open: boolean,
  onClose: () => void,
  prerequisites: MatricNumberFormatPrerequisites | undefined,
  activeSlots: MatricFormatActiveSlot[],
) {
  const [state, dispatch] = useReducer(
    matricNumberFormatBuilderReducer,
    initialMatricNumberFormatBuilderState,
  );
  const [updateFormat, { isLoading: isSaving }] = useUpdateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const { data: format, isLoading: isFormatLoading } = useGetMatricNumberFormatQuery(
    { id: formatId! },
    { skip: !open || formatId === null },
  );

  const initializedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !format || initializedRef.current === format.id) return;
    initializedRef.current = format.id;
    dispatch({ type: MatricNumberFormatBuilderActionType.Reset });
    dispatch({
      type: MatricNumberFormatBuilderActionType.SetSegments,
      segments: parseTemplateSegments(format.template),
    });
    dispatch({ type: MatricNumberFormatBuilderActionType.SetCode, value: format.code });
    dispatch({
      type: MatricNumberFormatBuilderActionType.SetCounterPartition,
      value: format.counterPartition,
    });
    dispatch({
      type: MatricNumberFormatBuilderActionType.SetSequencePadding,
      value: format.sequencePadding,
    });
    dispatch({
      type: MatricNumberFormatBuilderActionType.SetInitialValue,
      value: format.initialValue,
    });
    dispatch({
      type: MatricNumberFormatBuilderActionType.SetTokenOptions,
      value: format.tokenOptions ?? {},
    });
    dispatch({ type: MatricNumberFormatBuilderActionType.SetDirty, dirty: false });
  }, [open, format]);

  const reset = useCallback(() => {
    initializedRef.current = null;
    dispatch({ type: MatricNumberFormatBuilderActionType.Reset });
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const template = serializeTemplateSegments(state.segments);

  const { template: previewTemplate } = useMatricNumberFormatPreview(
    state,
    dispatch,
    open,
  );

  const unknownTokens = useMemo(() => findUnknownTokens(template), [template]);
  const needsSession = templateNeedsSession(template);

  const previewLength = state.previewResult?.length ?? 0;
  const isLengthInvalid = previewLength > MATRIC_NUMBER_FORMAT_MAX_LENGTH;
  const isSessionMissing = needsSession && !state.previewSessionId;

  const prerequisitesReady = isPrerequisitesReadyForTemplate(prerequisites, template);

  const slotActivationAllowed = format ? canActivateDraft(format, activeSlots) : false;

  const activationBlockers = getActivationBlockers({
    isDraft: format?.status === "DRAFT",
    prerequisitesReady,
    unknownTokens,
    isLengthInvalid,
    previewError: state.previewError,
    hasPreviewResult: state.previewResult !== null,
    previewProgramSelected: state.previewProgramId !== undefined,
    slotLocked: format?.status === "DRAFT" && !slotActivationAllowed,
  });

  const canActivate =
    slotActivationAllowed &&
    canActivateMatricFormat({
      isDraft: format?.status === "DRAFT",
      prerequisitesReady,
      unknownTokens,
      isLengthInvalid,
      previewError: state.previewError,
      hasPreviewResult: state.previewResult !== null,
      previewProgramSelected: state.previewProgramId !== undefined,
    });

  const handleSave = async () => {
    if (!format || readOnly) return;
    try {
      await updateFormat({
        id: format.id,
        code: state.code.trim(),
        entryMode: format.entryMode,
        template,
        tokenOptions: state.tokenOptions,
        counterPartition: state.counterPartition,
        sequencePadding: state.sequencePadding,
        initialValue: state.initialValue,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Matric number format", "updated"));
      dispatch({ type: MatricNumberFormatBuilderActionType.SetDirty, dirty: false });
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PUT" },
      });
    }
  };

  const handleInsertToken = useCallback(
    (token: string) => {
      if (readOnly) return;
      const newSegment = {
        type: "token" as const,
        value: token,
        id: `seg-${Date.now()}-${Math.random()}`,
      };
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetSegments,
        segments: [...state.segments, newSegment],
      });
      const suggested = suggestCounterPartition(
        serializeTemplateSegments([...state.segments, newSegment]),
      );
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetCounterPartition,
        value: suggested,
      });
    },
    [readOnly, state.segments],
  );

  const handleInsertLiteral = useCallback(
    (literal: string) => {
      if (readOnly || !literal) return;
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetSegments,
        segments: [
          ...state.segments,
          {
            type: "literal",
            value: literal,
            id: `seg-${Date.now()}-${Math.random()}`,
          },
        ],
      });
    },
    [readOnly, state.segments],
  );

  const handleSegmentsChange = useCallback(
    (segments: typeof state.segments) => {
      if (readOnly) return;
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetSegments,
        segments,
      });
      const suggested = suggestCounterPartition(serializeTemplateSegments(segments));
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetCounterPartition,
        value: suggested,
      });
    },
    [readOnly],
  );

  const handleAdvancedTemplateChange = useCallback(
    (value: string) => {
      if (readOnly) return;
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetSegments,
        segments: parseTemplateSegments(value),
      });
      dispatch({
        type: MatricNumberFormatBuilderActionType.SetCounterPartition,
        value: suggestCounterPartition(value),
      });
    },
    [readOnly],
  );

  return {
    state: {
      builderState: state,
      format,
      template: previewTemplate || template,
      isFormatLoading,
      isSaving,
      unknownTokens,
      needsSession,
      previewLength,
      isLengthInvalid,
      isSessionMissing,
      canActivate,
      activationBlockers,
      prerequisitesReady,
      slotActivationAllowed,
      slotLockedTitle: MATRIC_NUMBER_FORMAT_UI_COPY.actionActivateSlotLocked,
    },
    actions: {
      dispatch,
      handleClose,
      handleSave,
      handleInsertToken,
      handleInsertLiteral,
      handleSegmentsChange,
      handleAdvancedTemplateChange,
      reset,
    },
    flags: {
      readOnly,
      isDraft: format?.status === "DRAFT",
    },
  };
}

export type BuilderFormat = MatricNumberFormat;
