import {
  useGetLgasByStateQuery,
  useGetStatesQuery,
} from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import { useMemo } from "react";

type PreviewOption = { value: number; label: string };

export function useFormBuilderPreviewOptions(
  previewValues: Record<string, unknown>,
) {
  const stateIdRaw =
    previewValues.stateId ?? previewValues.state_of_origin ?? undefined;
  const stateId =
    typeof stateIdRaw === "number"
      ? stateIdRaw
      : typeof stateIdRaw === "string" && stateIdRaw.length > 0
        ? Number(stateIdRaw)
        : undefined;
  const resolvedStateId =
    stateId != null && Number.isFinite(stateId) ? stateId : undefined;

  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const { data: lgasData, isLoading: isLgasLoading } = useGetLgasByStateQuery(
    { stateId: resolvedStateId ?? 0, itemsPerPage: 200 },
    { skip: resolvedStateId == null },
  );

  const stateOptions: PreviewOption[] = useMemo(
    () =>
      (statesData?.member ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [statesData],
  );

  const lgaOptions: PreviewOption[] = useMemo(
    () =>
      (lgasData?.member ?? []).map((l) => ({
        value: l.id,
        label: l.name,
      })),
    [lgasData],
  );

  return {
    stateOptions,
    lgaOptions,
    isLoading: isStatesLoading || (resolvedStateId != null && isLgasLoading),
  };
}
