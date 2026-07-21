import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { useCallback, useEffect, useState } from "react";
import type {
  AnyPrimitiveConfigItemProps,
  PrimitiveConfigValue,
} from "../types/config-item";

export function usePrimitiveConfigItem<TData, TPayload>(
  props: AnyPrimitiveConfigItemProps<TData, TPayload>,
) {
  const {
    type,
    useGetQuery,
    usePostMutation,
    getConfigValue,
    postPayloadFormatter,
    getSummary,
    onSuccess,
    onError,
  } = props;

  const handleApiError = useApiError();

  const { data, isLoading, isFetching, refetch } = useGetQuery();
  const [postMutation, { isLoading: isSaving }] = usePostMutation();

  const serverValue = getConfigValue(data);
  const summary = getSummary?.(data) ?? null;

  const [draftValue, setDraftValue] = useState<PrimitiveConfigValue>(serverValue);

  useEffect(() => {
    setDraftValue(serverValue);
  }, [serverValue]);

  const formatPayload = useCallback(
    (value: PrimitiveConfigValue) => {
      return (postPayloadFormatter as (value: PrimitiveConfigValue) => TPayload)(
        value,
      );
    },
    [postPayloadFormatter],
  );

  const persistValue = useCallback(
    async (next: PrimitiveConfigValue) => {
      try {
        const payload = formatPayload(next);
        const result = await postMutation(payload);

        if (result && "error" in result && result.error) {
          onError?.(result.error);
          handleApiError(result.error, {
            context: { screen: RequestScreen.Action, method: "POST" },
          });
          return false;
        }

        onSuccess?.();
        refetch?.();
        return true;
      } catch (err: unknown) {
        onError?.(err);
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
        return false;
      }
    },
    [
      formatPayload,
      postMutation,
      onSuccess,
      onError,
      refetch,
      handleApiError,
    ],
  );

  const handleChange = useCallback(
    async (next: PrimitiveConfigValue) => {
      if (type === "BOOLEAN") {
        setDraftValue(next);
        const saved = await persistValue(next);
        if (!saved) {
          setDraftValue(serverValue);
        }
        return;
      }

      setDraftValue(next);
    },
    [type, persistValue, serverValue],
  );

  const handleBlurPersist = useCallback(() => {
    if (type === "BOOLEAN") return;
    if (draftValue === serverValue) return;
    void persistValue(draftValue);
  }, [type, draftValue, serverValue, persistValue]);

  return {
    state: {
      value: draftValue,
      summary,
      isLoading: isLoading || Boolean(isFetching),
      isSaving,
    },
    actions: {
      handleChange,
      handleBlurPersist,
      refetch,
    },
    flags: {
      isReadOnly: isLoading || isSaving,
    },
  };
}
